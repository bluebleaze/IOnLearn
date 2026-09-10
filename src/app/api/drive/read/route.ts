import { NextResponse } from 'next/server';
import path from 'path';
import url from 'url';
import { parseGoogleWorkspaceUrl, formatCsvToMarkdownTable, formatSlidesText } from '@/lib/workspaceUtils';

async function parsePdfBuffer(buffer: Buffer): Promise<string> {
  try {
    // @ts-ignore
    const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');

    try {
      const workerPath = url.pathToFileURL(
        path.join(process.cwd(), 'node_modules', 'pdfjs-dist', 'legacy', 'build', 'pdf.worker.mjs')
      ).href;
      if (pdfjs.GlobalWorkerOptions) {
        pdfjs.GlobalWorkerOptions.workerSrc = workerPath;
      }
    } catch (e) {
      console.warn('Could not set pdfjs workerSrc:', e);
    }

    const loadingTask = pdfjs.getDocument({
      data: new Uint8Array(buffer),
      useSystemFonts: true,
      disableFontFace: true,
      isEvalSupported: false,
    });
    const doc = await loadingTask.promise;
    const numPages = doc.numPages || 1;
    let fullText = '';

    for (let i = 1; i <= numPages; i++) {
      const page = await doc.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => (typeof item.str === 'string' ? item.str : ''))
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();

      if (pageText) {
        fullText += (fullText ? '\n\n' : '') + `[Halaman ${i}]\n${pageText}`;
      }
    }

    return fullText;
  } catch (err: any) {
    console.error('PDF extraction error in drive/read:', err);
    throw err;
  }
}

function extractTextFromHtml(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { token, fileId, url: rawUrl } = body;

    let effectiveFileId = fileId;
    let detectedType = 'generic';
    let gidParam = '';

    if (rawUrl) {
      const parsed = parseGoogleWorkspaceUrl(rawUrl);
      if (parsed.fileId) effectiveFileId = parsed.fileId;
      detectedType = parsed.type;
      if (parsed.gid) gidParam = parsed.gid;
    }

    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // 1. Try Google Drive API if fileId and token are available
    if (effectiveFileId && token) {
      try {
        const metaRes = await fetch(`https://www.googleapis.com/drive/v3/files/${effectiveFileId}?fields=id,name,mimeType`, {
          headers
        });

        if (metaRes.ok) {
          const meta = await metaRes.json();
          let textContent = '';
          const name = meta.name || 'Dokumen Google Workspace';

          if (meta.mimeType === 'application/vnd.google-apps.document') {
            const exportRes = await fetch(`https://www.googleapis.com/drive/v3/files/${effectiveFileId}/export?mimeType=text/plain`, { headers });
            if (exportRes.ok) textContent = await exportRes.text();
            detectedType = 'docs';
          } else if (meta.mimeType === 'application/vnd.google-apps.presentation') {
            const exportRes = await fetch(`https://www.googleapis.com/drive/v3/files/${effectiveFileId}/export?mimeType=text/plain`, { headers });
            if (exportRes.ok) {
              const rawSlidesText = await exportRes.text();
              textContent = formatSlidesText(rawSlidesText);
            }
            detectedType = 'slides';
          } else if (meta.mimeType === 'application/vnd.google-apps.spreadsheet') {
            const exportRes = await fetch(`https://www.googleapis.com/drive/v3/files/${effectiveFileId}/export?mimeType=text/csv`, { headers });
            if (exportRes.ok) {
              const rawCsv = await exportRes.text();
              textContent = formatCsvToMarkdownTable(rawCsv);
            }
            detectedType = 'sheets';
          } else if (meta.mimeType === 'application/pdf') {
            const mediaRes = await fetch(`https://www.googleapis.com/drive/v3/files/${effectiveFileId}?alt=media`, { headers });
            if (mediaRes.ok) {
              const arrayBuffer = await mediaRes.arrayBuffer();
              textContent = await parsePdfBuffer(Buffer.from(arrayBuffer));
            }
            detectedType = 'drive';
          } else if (meta.mimeType === 'text/plain' || meta.mimeType === 'text/markdown' || meta.mimeType === 'text/csv') {
            const mediaRes = await fetch(`https://www.googleapis.com/drive/v3/files/${effectiveFileId}?alt=media`, { headers });
            if (mediaRes.ok) textContent = await mediaRes.text();
            detectedType = 'drive';
          }

          if (textContent && textContent.trim()) {
            return NextResponse.json({ content: textContent, name, type: detectedType });
          }
        }
      } catch (e) {
        console.warn('Drive API metadata fetch failed, trying direct export fallback:', e);
      }
    }

    // 2. Fallback direct Google export endpoints (works with or without token for shared links)
    if (effectiveFileId) {
      try {
        // 2a. Google Sheets Export Fallback
        if (detectedType === 'sheets' || detectedType === 'generic') {
          const sheetExportUrl = gidParam
            ? `https://docs.google.com/spreadsheets/d/${effectiveFileId}/export?format=csv&gid=${gidParam}`
            : `https://docs.google.com/spreadsheets/d/${effectiveFileId}/export?format=csv`;

          const sheetRes = await fetch(sheetExportUrl, { headers });
          if (sheetRes.ok) {
            const text = await sheetRes.text();
            if (text && !text.includes('<!DOCTYPE html>') && !text.includes('<html')) {
              return NextResponse.json({
                content: formatCsvToMarkdownTable(text),
                name: 'Google Spreadsheet',
                type: 'sheets'
              });
            }
          }
        }

        // 2b. Google Docs Export Fallback
        if (detectedType === 'docs' || detectedType === 'generic') {
          const docRes = await fetch(`https://docs.google.com/document/d/${effectiveFileId}/export?format=txt`, { headers });
          if (docRes.ok) {
            const text = await docRes.text();
            if (text && !text.includes('<!DOCTYPE html>') && !text.includes('<html')) {
              return NextResponse.json({
                content: text,
                name: 'Google Document',
                type: 'docs'
              });
            }
          }
        }

        // 2c. Google Slides Export Fallback
        if (detectedType === 'slides' || detectedType === 'generic') {
          const slideRes = await fetch(`https://docs.google.com/presentation/d/${effectiveFileId}/export/txt`, { headers });
          if (slideRes.ok) {
            const text = await slideRes.text();
            if (text && !text.includes('<!DOCTYPE html>') && !text.includes('<html')) {
              return NextResponse.json({
                content: formatSlidesText(text),
                name: 'Google Slides',
                type: 'slides'
              });
            }
          }
        }
      } catch (e) {
        console.warn('Direct Google export fallback failed:', e);
      }
    }

    // 3. Fallback for generic public Web URLs
    if (rawUrl && (rawUrl.startsWith('http://') || rawUrl.startsWith('https://'))) {
      try {
        const pageRes = await fetch(rawUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          }
        });
        if (pageRes.ok) {
          const html = await pageRes.text();
          const cleanText = extractTextFromHtml(html);
          if (cleanText) {
            return NextResponse.json({ content: cleanText.slice(0, 15000), name: rawUrl });
          }
        }
      } catch (e) {
        console.warn('Public URL fetch failed:', e);
      }
    }

    return NextResponse.json({ error: 'Tidak dapat membaca konten dari link atau dokumen tersebut. Pastikan izin akses link dibuka atau login akun Google Anda aktif.' }, { status: 400 });
  } catch (error: any) {
    console.error('Error reading drive/URL file:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
