import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { extractBufferContent } from '@/lib/documentParsers';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const taskId = formData.get('taskId') as string | null;
    const userEmail = formData.get('userEmail') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'Tidak ada berkas yang diunggah.' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const fileName = file.name || 'document';

    const content = await extractBufferContent(buffer, fileName);

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: 'Berkas berhasil diunggah namun tidak ada teks yang dapat diekstrak atau berkas kosong.' },
        { status: 422 }
      );
    }

    // Auto-update server cache if taskId is provided
    if (taskId) {
      try {
        const cacheFile =
          process.env.VERCEL || process.env.NODE_ENV === 'production'
            ? path.join('/tmp', '.user_cache.json')
            : path.join(process.cwd(), '.user_cache.json');

        if (fs.existsSync(cacheFile)) {
          const cache = JSON.parse(fs.readFileSync(cacheFile, 'utf-8'));
          const emails = userEmail ? [userEmail] : Object.keys(cache);
          let updated = false;

          for (const email of emails) {
            const tasks = cache[email]?.tasks || [];
            const task = tasks.find((t: any) => t.id === taskId);
            if (task) {
              task.extractedMaterialsText = content;
              updated = true;
            }
          }

          if (updated) {
            fs.writeFileSync(cacheFile, JSON.stringify(cache, null, 2), 'utf-8');
          }
        }
      } catch (cacheErr) {
        console.warn('Failed to update cache on file upload:', cacheErr);
      }
    }

    return NextResponse.json({
      success: true,
      content,
      name: fileName,
      size: file.size,
    });
  } catch (error: any) {
    console.error('Error in upload-parse endpoint:', error);
    return NextResponse.json(
      { error: error?.message || 'Gagal memproses dan mengekstrak berkas.' },
      { status: 500 }
    );
  }
}
