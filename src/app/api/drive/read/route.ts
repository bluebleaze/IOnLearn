import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { parseGoogleWorkspaceUrl, formatCsvToMarkdownTable, formatSlidesText } from '@/lib/workspaceUtils';
import { extractBufferContent } from '@/lib/documentParsers';

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
    const { token, fileId, url: rawUrl, fileName } = body;

    let effectiveFileId = fileId;
    let detectedType = 'generic';
    let gidParam = '';

    if (rawUrl) {
      const parsed = parseGoogleWorkspaceUrl(rawUrl);
      if (parsed.fileId) effectiveFileId = parsed.fileId;
      detectedType = parsed.type;
      if (parsed.gid) gidParam = parsed.gid;
    }

    // 0. Fast local file check (for files in user Downloads or uploads directory)
    if (fileName && typeof fileName === 'string') {
      try {
        const cleanName = path.basename(fileName);
        const homeDir = process.env.HOME || '/home/flores';
        const candidatePaths = [
          path.join(homeDir, 'Downloads', cleanName),
          path.join(process.cwd(), 'uploads', cleanName),
        ];

        // Also check if any file in ~/Downloads matches normalized name or keywords
        const downloadsDir = path.join(homeDir, 'Downloads');
        const normTarget = cleanName.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (fs.existsSync(downloadsDir)) {
          const files = fs.readdirSync(downloadsDir);
          for (const f of files) {
            const fNorm = f.toLowerCase().replace(/[^a-z0-9]/g, '');
            if (
              (normTarget.length >= 4 && (fNorm.includes(normTarget) || normTarget.includes(fNorm))) ||
              (f.toLowerCase() === cleanName.toLowerCase())
            ) {
              candidatePaths.push(path.join(downloadsDir, f));
            }
          }
        }

        for (const cp of candidatePaths) {
          if (fs.existsSync(cp)) {
            const buf = fs.readFileSync(cp);
            const text = await extractBufferContent(buf, cp);
            if (text && text.trim()) {
              console.log(`[drive/read] Matched local file: ${cp}`);
              return NextResponse.json({ content: text, name: path.basename(cp), type: 'drive' });
            }
          }
        }
      } catch (locErr) {
        console.warn('[drive/read] Local file check error:', locErr);
      }
    }

    // 0.5 Cache lookup by fileId, URL, or fileName in user cache
    try {
      const cacheFile =
        process.env.VERCEL || process.env.NODE_ENV === 'production'
          ? path.join('/tmp', '.user_cache.json')
          : path.join(process.cwd(), '.user_cache.json');
      if (fs.existsSync(cacheFile)) {
        const cache = JSON.parse(fs.readFileSync(cacheFile, 'utf-8'));
        const normSearch = (fileName || effectiveFileId || rawUrl || '').toLowerCase().replace(/[^a-z0-9]/g, '');

        for (const email of Object.keys(cache)) {
          const tasks = cache[email]?.tasks || [];
          for (const t of tasks) {
            const matchedMat = t.materials?.find(
              (m: any) =>
                (effectiveFileId && (m.driveFile?.driveFile?.id === effectiveFileId || m.driveFile?.id === effectiveFileId)) ||
                (rawUrl && (m.driveFile?.driveFile?.alternateLink === rawUrl || m.link?.url === rawUrl)) ||
                (normSearch && normSearch.length >= 4 && (
                  (m.driveFile?.driveFile?.title && m.driveFile.driveFile.title.toLowerCase().replace(/[^a-z0-9]/g, '').includes(normSearch)) ||
                  (m.link?.title && m.link.title.toLowerCase().replace(/[^a-z0-9]/g, '').includes(normSearch)) ||
                  (t.title && t.title.toLowerCase().replace(/[^a-z0-9]/g, '').includes(normSearch))
                ))
            );

            // Also check if task title itself matches normSearch
            const titleMatches = normSearch && normSearch.length >= 5 && t.title && t.title.toLowerCase().replace(/[^a-z0-9]/g, '').includes(normSearch);

            if ((matchedMat || titleMatches) && t.extractedMaterialsText) {
              console.log(`[drive/read] Found cached extracted text for task "${t.title}"`);
              return NextResponse.json({
                content: t.extractedMaterialsText,
                name: matchedMat?.driveFile?.driveFile?.title || t.title,
                type: 'drive',
              });
            }
          }
        }
      }
    } catch (cacheErr) {
      console.warn('[drive/read] Cache lookup error:', cacheErr);
    }

    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    let isDriveApiDisabledInGcp = false;

    // 1. Try Google Drive API if fileId and token are available
    if (effectiveFileId && token) {
      try {
        console.log(`[drive/read] Fetching Drive metadata for ${effectiveFileId}`);
        const metaRes = await fetch(
          `https://www.googleapis.com/drive/v3/files/${effectiveFileId}?supportsAllDrives=true&includeItemsFromAllDrives=true&fields=id,name,mimeType`,
          { headers }
        );

        if (metaRes.ok) {
          const meta = await metaRes.json();
          let textContent = '';
          const name = meta.name || fileName || 'Dokumen Google Workspace';
          console.log(`[drive/read] File metadata: name="${name}", mimeType="${meta.mimeType}"`);

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
          } else {
            // Binary files: PDF, Word (.docx), PowerPoint (.pptx), Excel (.xlsx), TXT, etc.
            const mediaRes = await fetch(
              `https://www.googleapis.com/drive/v3/files/${effectiveFileId}?alt=media&supportsAllDrives=true&includeItemsFromAllDrives=true&acknowledgeAbuse=true`,
              { headers }
            );
            if (mediaRes.ok) {
              const arrayBuffer = await mediaRes.arrayBuffer();
              const buf = Buffer.from(arrayBuffer);
              textContent = await extractBufferContent(buf, name);
            } else {
              console.warn(`[drive/read] alt=media download failed with status ${mediaRes.status}:`, await mediaRes.text().catch(() => ''));
            }
            detectedType = 'drive';
          }

          if (textContent && textContent.trim()) {
            return NextResponse.json({ content: textContent, name, type: detectedType });
          }
        } else {
          const errBody = await metaRes.text().catch(() => '');
          console.warn(`[drive/read] Google Drive API metaRes failed (${metaRes.status}):`, errBody);

          if (
            errBody.includes('Google Drive API has not been used in project') ||
            errBody.includes('SERVICE_DISABLED') ||
            errBody.includes('accessNotConfigured')
          ) {
            isDriveApiDisabledInGcp = true;
            console.error('[drive/read] ACTION REQUIRED: Enable Google Drive API at https://console.developers.google.com/apis/api/drive.googleapis.com/overview?project=758029660631');
          }

          // Only return tokenExpired if Google actually returned 401 Unauthorized
          if (metaRes.status === 401) {
            return NextResponse.json(
              {
                error: 'Sesi Google telah kedaluwarsa. Silakan hubungkan ulang Google Classroom.',
                tokenExpired: true,
              },
              { status: 401 }
            );
          }
        }
      } catch (e) {
        console.warn('[drive/read] Drive API metadata fetch failed, trying direct export fallback:', e);
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
                type: 'sheets',
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
                type: 'docs',
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
                type: 'slides',
              });
            }
          }
        }

        // 2d. Google Drive direct download fallback (works for PDFs and shared files)
        const driveDownloadUrls = [
          `https://drive.usercontent.google.com/download?id=${effectiveFileId}&export=download&confirm=t`,
          `https://drive.google.com/uc?export=download&id=${effectiveFileId}&confirm=t`,
          `https://docs.google.com/uc?export=download&id=${effectiveFileId}&confirm=t`,
        ];

        for (const dlUrl of driveDownloadUrls) {
          try {
            const dlRes = await fetch(dlUrl, {
              headers: {
                ...headers,
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
              },
            });
            if (dlRes.ok) {
              const contentType = dlRes.headers.get('content-type') || '';
              // Skip HTML login redirects
              if (!contentType.includes('text/html')) {
                const buf = Buffer.from(await dlRes.arrayBuffer());
                const parsedText = await extractBufferContent(buf, fileName || 'document.pdf');
                if (parsedText && parsedText.trim()) {
                  return NextResponse.json({
                    content: parsedText,
                    name: fileName || 'Dokumen Google Drive',
                    type: 'drive',
                  });
                }
              }
            }
          } catch (dlErr) {
            console.warn(`[drive/read] Direct download failed for ${dlUrl}:`, dlErr);
          }
        }
      } catch (e) {
        console.warn('[drive/read] Direct Google export fallback failed:', e);
      }
    }

    // 3. Fallback for generic public Web URLs
    if (rawUrl && (rawUrl.startsWith('http://') || rawUrl.startsWith('https://'))) {
      try {
        const pageRes = await fetch(rawUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          },
        });
        if (pageRes.ok) {
          const html = await pageRes.text();
          const cleanText = extractTextFromHtml(html);
          if (cleanText) {
            return NextResponse.json({ content: cleanText.slice(0, 15000), name: rawUrl });
          }
        }
      } catch (e) {
        console.warn('[drive/read] Public URL fetch failed:', e);
      }
    }

    if (isDriveApiDisabledInGcp) {
      return NextResponse.json(
        {
          error: `Google Drive API belum diaktifkan di Google Cloud Console untuk proyek 758029660631 (uburubur-85adc). Silakan buka tautan aktivasi berikut untuk mengaktifkannya dengan sekali klik.`,
          serviceDisabled: true,
          activationUrl: 'https://console.developers.google.com/apis/api/drive.googleapis.com/overview?project=758029660631',
          fileName: fileName || '',
          fileId: effectiveFileId || '',
        },
        { status: 403 }
      );
    }

    // Honest and non-misleading response: Google Drive API blocked the file
    return NextResponse.json(
      {
        error: `Berkas "${fileName || 'lampiran'}" tidak dapat diakses otomatis dari Google Drive API karena pembatasan izin berkas guru/organisasi di Google Classroom. Anda dapat mengunggah berkasnya langsung di modal tugas agar dapat dibaca oleh AI.`,
        permissionDenied: true,
        fileName: fileName || '',
        fileId: effectiveFileId || '',
      },
      { status: 403 }
    );
  } catch (error: any) {
    console.error('[drive/read] Error reading drive/URL file:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
