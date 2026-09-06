import { NextResponse } from "next/server";
import path from "path";
import url from "url";

async function parsePdfBuffer(buffer: Buffer): Promise<{ text: string; pages: number }> {
  try {
    // Use pdfjs-dist legacy build designed specifically for Node.js server runtimes
    // @ts-ignore
    const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");

    // Configure workerSrc to absolute file URL so Turbopack/Next.js bundle finds the worker
    try {
      const workerPath = url.pathToFileURL(
        path.join(process.cwd(), "node_modules", "pdfjs-dist", "legacy", "build", "pdf.worker.mjs")
      ).href;
      if (pdfjs.GlobalWorkerOptions) {
        pdfjs.GlobalWorkerOptions.workerSrc = workerPath;
      }
    } catch (e) {
      console.warn("Could not set pdfjs workerSrc:", e);
    }

    const loadingTask = pdfjs.getDocument({
      data: new Uint8Array(buffer),
      useSystemFonts: true,
      disableFontFace: true,
      isEvalSupported: false,
    });
    const doc = await loadingTask.promise;
    const numPages = doc.numPages || 1;
    let fullText = "";

    for (let i = 1; i <= numPages; i++) {
      const page = await doc.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => (typeof item.str === "string" ? item.str : ""))
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();

      if (pageText) {
        fullText += (fullText ? "\n\n" : "") + `[Halaman ${i}]\n${pageText}`;
      }
    }

    return { text: fullText, pages: numPages };
  } catch (err: any) {
    console.error("PDF extraction error with pdfjs:", err);
    throw err;
  }
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "File tidak ditemukan" },
        { status: 400 }
      );
    }

    const name = file.name;
    const size = file.size;
    const mimeType = file.type || "";
    const isPdf =
      name.toLowerCase().endsWith(".pdf") || mimeType === "application/pdf";

    if (isPdf) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const { text, pages } = await parsePdfBuffer(buffer);

      return NextResponse.json({
        name,
        size,
        type: "pdf",
        pages,
        text: text.slice(0, 30000), // Max 30k chars for prompt context safety
      });
    }

    // Fallback for text / markdown / code files
    const text = await file.text();
    return NextResponse.json({
      name,
      size,
      type: "doc",
      text: text.slice(0, 30000),
    });
  } catch (error: any) {
    console.error("Error parsing file:", error);
    return NextResponse.json(
      { error: error.message || "Gagal membaca isi file PDF/dokumen" },
      { status: 500 }
    );
  }
}
