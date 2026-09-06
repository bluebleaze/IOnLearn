import { NextResponse } from 'next/server';
import path from 'path';
import url from 'url';

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

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { token, fileId } = body;
    if (!token || !fileId) {
      return NextResponse.json({ error: 'Token and fileId are required' }, { status: 400 });
    }

    const metaRes = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?fields=id,name,mimeType`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (!metaRes.ok) {
      return NextResponse.json({ error: 'Failed to fetch file metadata' }, { status: metaRes.status });
    }
    
    const meta = await metaRes.json();
    let textContent = '';

    if (meta.mimeType === 'application/vnd.google-apps.document' || meta.mimeType === 'application/vnd.google-apps.presentation') {
      const exportRes = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=text/plain`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (exportRes.ok) {
        textContent = await exportRes.text();
      }
    } else if (meta.mimeType === 'application/pdf') {
      const mediaRes = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (mediaRes.ok) {
        const arrayBuffer = await mediaRes.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        textContent = await parsePdfBuffer(buffer);
      }
    } else if (meta.mimeType === 'text/plain' || meta.mimeType === 'text/markdown' || meta.mimeType === 'text/csv') {
      const mediaRes = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (mediaRes.ok) {
        textContent = await mediaRes.text();
      }
    } else {
      return NextResponse.json({ error: 'Unsupported file type: ' + meta.mimeType }, { status: 400 });
    }

    return NextResponse.json({ content: textContent, name: meta.name });
  } catch (error: any) {
    console.error('Error reading drive file:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
