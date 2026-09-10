import { NextResponse } from "next/server";
import { GoogleGenAI, Type } from "@google/genai";
import { AIConfig } from "@/types";
const KNOWN_SUBJECTS = [
    "Fisika",
    "Matematika",
    "Biologi",
    "Kimia",
    "Informatika",
    "Pemrograman",
    "Algoritma",
    "Statistika",
    "Kalkulus",
    "Basis Data",
    "Jaringan Komputer",
    "Sistem Operasi",
    "Bahasa Indonesia",
    "Bahasa Inggris",
    "Sejarah",
    "Ekonomi",
    "Geografi",
    "Sosiologi",
    "Akuntansi",
    "Kewirausahaan",
    "Kewarganegaraan",
];

const IGNORED_TAG_WORDS = new Set([
    "ai copilot",
    "ai",
    "copilot",
    "socratic",
    "direct",
    "quizzer",
    "chat",
    "chat ai",
    "rangkuman",
    "catatan ai",
    "belajar ai",
    "catatan",
    "materi",
    "general",
    "umum",
    "tag",
    "tags",
    "label",
]);

function cleanAndNormalizeTags(rawTags: (string | undefined | null)[]): string[] {
    const result: string[] = [];
    const seen = new Set<string>();

    for (const raw of rawTags) {
        if (!raw || typeof raw !== "string") continue;
        const parts = raw.split(",");
        for (let p of parts) {
            p = p.replace(/^[#\s*>-]+/, "").replace(/[*_`~#]/g, "").trim();
            if (!p || p.length < 2) continue;
            const lower = p.toLowerCase();
            if (IGNORED_TAG_WORDS.has(lower)) continue;
            if (seen.has(lower)) continue;

            seen.add(lower);
            if (lower === "uas" || lower === "uts" || lower === "ti" || lower === "si" || lower === "ipa" || lower === "ips") {
                result.push(lower.toUpperCase());
            } else {
                const formatted = p.charAt(0).toUpperCase() + p.slice(1);
                result.push(formatted);
            }
        }
    }

    return result.slice(0, 3);
}

function sanitizeNoteOutput(
    rawNote: any,
    replyText?: string,
    taskContext?: any
): { title: string; content: string; subject: string; tags: string[] } | undefined {
    if (!rawNote || typeof rawNote !== "object") return undefined;

    let rawTitle = typeof rawNote.title === "string" ? rawNote.title.trim() : "";
    let rawContent = typeof rawNote.content === "string" ? rawNote.content.trim() : "";
    let subject = typeof rawNote.subject === "string" && rawNote.subject.trim()
        ? rawNote.subject.trim()
        : taskContext?.courseName || "";
    const rawTags: string[] = Array.isArray(rawNote.tags)
        ? rawNote.tags.map((t: any) => String(t).trim()).filter(Boolean)
        : [];

    // If content is empty/missing, but title contains the whole note / markdown
    if (!rawContent && rawTitle) {
        rawContent = rawTitle;
    }

    // If content is still empty, fallback to replyText
    if (!rawContent && replyText && replyText.trim()) {
        rawContent = replyText.trim();
    }

    if (!rawContent && !rawTitle) {
        return undefined;
    }

    // Extract a clean, concise title (under 70 chars, no markdown tokens)
    let cleanTitle = rawTitle;
    const firstLine = (rawTitle || rawContent).split("\n")[0].trim();
    const delimMatch = firstLine.match(/^(.*?)(?:\s+[-–—]\s+|\.\s+###|\s*###|:\s+)/);
    if (delimMatch && delimMatch[1] && delimMatch[1].trim().length >= 4) {
        cleanTitle = delimMatch[1].trim();
    } else {
        const dotIdx = firstLine.indexOf(". ");
        if (dotIdx > 4 && dotIdx <= 70) {
            cleanTitle = firstLine.slice(0, dotIdx);
        } else {
            cleanTitle = firstLine.slice(0, 70);
        }
    }

    cleanTitle = cleanTitle
        .replace(/^[#\s*>-]+/, "")
        .replace(/[*_`~]/g, "")
        .replace(/["'{}]/g, "")
        .trim();

    if (!cleanTitle || cleanTitle.length < 3) {
        cleanTitle = taskContext?.title ? `Catatan: ${taskContext.title}` : "Catatan Materi AI";
    }

    // Extract any trailing embedded tag line from markdown content (e.g. "### Tag: #Fisika #Mekanika #Rotasi")
    const trailingTagLineMatch = rawContent.match(/(?:^|\n)\s*(?:###?\s*)?(?:Tag|Tags|Label|Labels|Hashtags)\s*:\s*([^\n]+)$/i);
    if (trailingTagLineMatch && trailingTagLineMatch[1]) {
        const lineTags = trailingTagLineMatch[1].match(/#?([a-zA-Z0-9_-]+)/g);
        if (lineTags) {
            lineTags.forEach((t: string) => {
                const clean = t.replace(/^#/, "").trim();
                if (clean) rawTags.push(clean);
            });
        }
    }

    // Strip trailing tag lines and trailing hashtags block from content so they don't duplicate
    rawContent = rawContent
        .replace(/(?:\r?\n)+\s*(?:###?\s*)?(?:Tag|Tags|Label|Labels|Hashtags)\s*:\s*[^\n]+$/i, "")
        .replace(/(?:\r?\n)+\s*(?:#[a-zA-Z0-9_-]+\s*){1,10}$/i, "")
        .trim();

    // Ensure rawContent is not just the 1-line short title if replyText has more body
    if (rawContent === cleanTitle && replyText && replyText.trim().length > cleanTitle.length) {
        rawContent = replyText
            .replace(/(?:\r?\n)+\s*(?:###?\s*)?(?:Tag|Tags|Label|Labels|Hashtags)\s*:\s*[^\n]+$/i, "")
            .replace(/(?:\r?\n)+\s*(?:#[a-zA-Z0-9_-]+\s*){1,10}$/i, "")
            .trim();
    }

    let cleanedTags = cleanAndNormalizeTags(rawTags);

    // Subject inference & cleanup
    if (!subject || subject === "Belajar AI" || subject === "Catatan AI" || subject === "Umum") {
        const subjectFromTag = cleanedTags.find((t: string) =>
            KNOWN_SUBJECTS.some((ks: string) => ks.toLowerCase() === t.toLowerCase())
        );
        if (subjectFromTag) {
            subject = subjectFromTag;
            cleanedTags = cleanedTags.filter((t: string) => t.toLowerCase() !== subjectFromTag.toLowerCase());
        } else {
            const subjectFromTitle = KNOWN_SUBJECTS.find((ks: string) =>
                new RegExp(`\\b${ks}\\b`, "i").test(cleanTitle) || new RegExp(`\\b${ks}\\b`, "i").test(rawTitle)
            );
            subject = subjectFromTitle || (taskContext?.courseName ? taskContext.courseName : "Catatan Materi");
        }
    }

    if (subject) {
        cleanedTags = cleanedTags.filter((t: string) => t.toLowerCase() !== subject.toLowerCase());
    }

    return {
        title: cleanTitle,
        content: rawContent,
        subject: subject || "Catatan Materi",
        tags: cleanedTags,
    };
}

export function isConversationalFiller(text?: string): boolean {
    if (!text) return true;
    const trimmed = text.trim();
    if (trimmed.length < 250) {
        return true;
    }
    const lower = trimmed.toLowerCase();
    const startsWithFiller = (
        lower.startsWith("tentu saja") ||
        lower.startsWith("halo") ||
        lower.startsWith("hai") ||
        lower.startsWith("berikut adalah") ||
        lower.startsWith("saya telah") ||
        lower.startsWith("aku telah") ||
        lower.startsWith("dokumen ini siap") ||
        lower.startsWith("file ini siap") ||
        lower.startsWith("silakan unduh") ||
        lower.startsWith("baiklah") ||
        lower.startsWith("baik, saya telah")
    );
    if (startsWithFiller && !trimmed.includes("\n##") && trimmed.length < 500) {
        return true;
    }
    return false;
}

function extractFallbackActions(
    lastUserMessage: string,
    replyText: string,
    taskContext?: any,
    allMessages?: { role: string; content: string }[]
): { createdNote?: any; createdTodo?: any; createdDocument?: any; createdSlides?: any; createdImage?: any } {
    if (!replyText || replyText.length < 15) return {};

    const lowerUser = (lastUserMessage || "").toLowerCase();
    let createdNote: any = undefined;
    let createdTodo: any = undefined;
    let createdDocument: any = undefined;
    let createdSlides: any = undefined;
    let createdImage: any = undefined;

    // Check Note intent: "catatan", "catat", "rangkum", "ringkas", "materi", "note", "simpan"
    const wantsNote =
        lowerUser.includes("catat") ||
        lowerUser.includes("rangkum") ||
        lowerUser.includes("ringkas") ||
        lowerUser.includes("materi") ||
        lowerUser.includes("note") ||
        lowerUser.includes("simpan");

    if (wantsNote) {
        const lines = replyText.split("\n").map((l) => l.trim()).filter(Boolean);
        const headingLine = lines.find((l) => l.startsWith("#"));
        const rawTitle = headingLine
            ? headingLine.replace(/^[#\s*]+/, "").trim()
            : lines[0]?.replace(/^[#\s*]+/, "").slice(0, 60) || "Catatan Materi AI";

        const cleanTitle = rawTitle.replace(/["'{}]/g, "").slice(0, 70);

        createdNote = sanitizeNoteOutput(
            {
                title: cleanTitle || (taskContext?.title ? `Catatan: ${taskContext.title}` : "Catatan Materi AI"),
                content: replyText,
                subject: taskContext?.courseName || "Belajar Mandiri",
                tags: ["AI Copilot", "Rangkuman"],
            },
            replyText,
            taskContext
        );
    }

    // Check To-Do intent: "to-do", "todo", "to do", "daftar tugas", "list tugas", "langkah", "action plan", "jadwal", "rencana"
    const wantsTodo =
        lowerUser.includes("to-do") ||
        lowerUser.includes("todo") ||
        lowerUser.includes("to do") ||
        lowerUser.includes("daftar tugas") ||
        lowerUser.includes("list tugas") ||
        lowerUser.includes("langkah kerja") ||
        lowerUser.includes("action plan") ||
        lowerUser.includes("rencana belajar");

    if (wantsTodo) {
        const lines = replyText.split("\n").map((l) => l.trim()).filter(Boolean);
        const headingLine = lines.find((l) => l.startsWith("#"));
        const rawTitle = headingLine
            ? headingLine.replace(/^[#\s*]+/, "").trim()
            : taskContext?.title ? `Rencana Belajar: ${taskContext.title}` : "Rencana Belajar & Tugas";
        const cleanTitle = rawTitle.replace(/["'{}]/g, "").slice(0, 80);

        const subtasks: { title: string }[] = [];
        for (const line of lines) {
            const numMatch = line.match(/^(\d+[\.\)]\s+|[-*•]\s+)(.+)/);
            if (numMatch && numMatch[2]) {
                const subTitle = numMatch[2]
                    .replace(/\*\*/g, "")
                    .replace(/["'{}]/g, "")
                    .trim();
                if (subTitle.length > 3 && subTitle.length < 150 && !subTitle.startsWith("#")) {
                    subtasks.push({ title: subTitle });
                }
            }
        }

        if (subtasks.length > 0) {
            createdTodo = {
                title: cleanTitle || "Rencana Belajar AI",
                description: `Rencana pengerjaan dengan ${subtasks.length} sub-langkah.`,
                priority: "medium",
                category: taskContext?.courseName || "Belajar AI",
                subtasks: subtasks.slice(0, 10),
            };
        }
    }

    // Check Document intent: "pdf", "word", "docx", "makalah", "dokumen", "excel", "xlsx", "spreadsheet"
    const wantsDocx = lowerUser.includes("word") || lowerUser.includes("docx") || lowerUser.includes(".docx");
    const wantsPdf = lowerUser.includes("pdf") || lowerUser.includes(".pdf");
    const wantsXlsx = lowerUser.includes("excel") || lowerUser.includes("xlsx") || lowerUser.includes(".xlsx") || lowerUser.includes("spreadsheet") || lowerUser.includes("spredsheet") || lowerUser.includes("xlxs");
    if (wantsDocx || wantsPdf || wantsXlsx) {
        const lines = replyText.split("\n").map((l) => l.trim()).filter(Boolean);
        const headingLine = lines.find((l) => l.startsWith("#"));
        const docTitle = headingLine
            ? headingLine.replace(/^[#\s*]+/, "").trim().slice(0, 80)
            : taskContext?.title || (wantsXlsx ? "Tabel Data Spreadsheet" : "Dokumen Materi Belajar");

        const docType: "docx" | "pdf" | "xlsx" = wantsXlsx ? "xlsx" : wantsDocx ? "docx" : "pdf";

        // Prevent conversational greeting from becoming the document content
        let docContent = replyText;
        if (isConversationalFiller(docContent)) {
            const prevAssistantMsgs = (allMessages || []).filter(
                (m) => m.role === "assistant" && m.content && !isConversationalFiller(m.content) && m.content.length > 250
            );
            if (prevAssistantMsgs.length > 0) {
                docContent = prevAssistantMsgs[prevAssistantMsgs.length - 1].content;
            } else if (taskContext) {
                docContent = `# ${docTitle}\n\n## Informasi Tugas & Topik\n- **Topik / Mata Pelajaran:** ${taskContext.courseName || "-"}\n- **Judul Tugas:** ${taskContext.title || "-"}\n${taskContext.dueDateStr ? `- **Batas Waktu:** ${taskContext.dueDateStr}\n` : ""}\n## Deskripsi & Rincian Praktikum\n${taskContext.description || "Berikut adalah naskah dokumen resmi untuk tugas ini."}\n\n${taskContext.customNotes ? `### Catatan Tambahan\n${taskContext.customNotes}\n` : ""}`;
            }
        }

        createdDocument = {
            type: docType,
            title: docTitle,
            content: docContent,
            fileName: `${docTitle.toLowerCase().replace(/[^a-z0-9]+/g, "_")}.${docType}`,
            description: `Dokumen ${docType === "xlsx" ? "Excel Spreadsheet (.xlsx)" : docType === "docx" ? "Word (.docx)" : "PDF (.pdf)"} siap unduh.`,
            subject: taskContext?.courseName,
        };
    }

    // Check Presentation Slides intent: "slide", "presentasi", "ppt", "pptx", "powerpoint"
    const wantsSlides =
        lowerUser.includes("slide") ||
        lowerUser.includes("presentasi") ||
        lowerUser.includes("ppt") ||
        lowerUser.includes("pptx") ||
        lowerUser.includes("powerpoint");

    if (wantsSlides) {
        const rawSections = replyText.split(/(?:^|\n)(?=#+\s*(?:Slide|\d+|Bagian|Topik))/i);
        const parsedSlides: { title: string; bullets: string[]; notes?: string }[] = [];

        for (const sec of rawSections) {
            const secLines = sec.trim().split("\n").map((l) => l.trim()).filter(Boolean);
            if (secLines.length === 0) continue;

            const slideTitle = secLines[0].replace(/^[#\s*]+/, "").slice(0, 70);
            const bullets: string[] = [];
            let notes = "";

            for (let i = 1; i < secLines.length; i++) {
                const l = secLines[i];
                if (l.toLowerCase().startsWith("notes:") || l.toLowerCase().startsWith("catatan:")) {
                    notes = l.replace(/^(notes|catatan):\s*/i, "");
                } else if (/^[-*•\d\.]\s+/.test(l)) {
                    bullets.push(l.replace(/^[-*•\d\.]\s+/, ""));
                } else if (bullets.length < 5 && l.length > 5 && !l.startsWith("#")) {
                    bullets.push(l);
                }
            }

            if (slideTitle && (bullets.length > 0 || parsedSlides.length === 0)) {
                parsedSlides.push({
                    title: slideTitle,
                    bullets: bullets.slice(0, 5),
                    notes: notes || undefined,
                });
            }
        }

        if (parsedSlides.length > 0) {
            createdSlides = {
                title: taskContext?.title || parsedSlides[0]?.title || "Materi Presentasi",
                theme: "indigo",
                slides: parsedSlides.slice(0, 10),
                fileName: `${(taskContext?.title || "presentasi").toLowerCase().replace(/[^a-z0-9]+/g, "_")}.pptx`,
                subject: taskContext?.courseName,
            };
        }
    }

    // Check Image intent: "gambarkan", "buatkan gambar", "ilustrasikan", "generate image", "lukiskan", "gambar"
    const wantsImage =
        lowerUser.includes("gambarkan") ||
        lowerUser.includes("buatkan gambar") ||
        lowerUser.includes("bikin gambar") ||
        lowerUser.includes("ilustrasikan") ||
        lowerUser.includes("generate image") ||
        lowerUser.includes("lukiskan");

    if (wantsImage) {
        const cleanPrompt = lastUserMessage
            .replace(/^(tolong\s+)?(gambarkan|buatkan gambar|bikin gambar|ilustrasikan|generate image|lukiskan)\s+/i, "")
            .trim();

        if (cleanPrompt.length > 3) {
            createdImage = {
                prompt: cleanPrompt,
                caption: cleanPrompt.slice(0, 60),
                aspectRatio: "16:9",
            };
        }
    }

    return { createdNote, createdTodo, createdDocument, createdSlides, createdImage };
}

export async function POST(req: Request) {
    try {
        const { messages, taskContext, userPreferences, aiConfig, studyMode } =
            (await req.json()) as {
                messages: { role: string; content: string }[];
                taskContext?: any;
                userPreferences?: any;
                aiConfig?: AIConfig | null;
                studyMode?: "socratic" | "direct" | "quizzer";
            };

        if (!Array.isArray(messages) || messages.length === 0) {
            return NextResponse.json(
                { error: "Messages array is required" },
                { status: 400 },
            );
        }

        let contextString = "";
        if (taskContext) {
            contextString = `\n--- KONTEKS MATERI / TUGAS AKTIF ---
Judul: ${taskContext.title || "-"}
Mata Pelajaran / Topik: ${taskContext.courseName || "-"}
Deskripsi / Materi: ${taskContext.description || "-"}
${taskContext.dueDateStr ? `Deadline: ${taskContext.dueDateStr}` : ""}
${taskContext.customNotes ? `Catatan Tambahan: ${taskContext.customNotes}` : ""}
------------------------------------`;
        }

        let modeInstruction = "";
        if (studyMode === "socratic") {
            modeInstruction = `\n--- MODE BELAJAR: TUTOR SOKRATIK ---
Bimbing siswa untuk menemukan jawaban sendiri secara kritis. Ajukan pertanyaan reflektif yang membangun logika, berikan petunjuk bertahap (hints), dan hindari memberikan jawaban akhir secara instan sebelum siswa mencoba berpikir.
------------------------------------`;
        } else if (studyMode === "direct") {
            modeInstruction = `\n--- MODE BELAJAR: PENJELASAN RINGKAS & CEPAT ---
Berikan penjelasan yang to-the-point, padat, terstruktur, langsung ke inti permasalahan beserta poin-poin utama atau rumus kunci tanpa bertele-tele.
------------------------------------`;
        } else if (studyMode === "quizzer") {
            modeInstruction = `\n--- MODE BELAJAR: LATIHAN & KUIS EVALUATIF ---
Tantang pemahaman siswa dengan mengajukan 1 sampai 2 soal latihan aplikatif / kuis pilihan ganda interaktif beserta opsi jawaban terkait topik ini, lalu diskusikan pembahasannya.
------------------------------------`;
        }

        let personalizationInstruction = "";
        if (userPreferences) {
            personalizationInstruction = `\n--- PREFERENSI PERSONALISASI SISWA ---
Siswa ini memiliki preferensi:
- Gaya Belajar: ${userPreferences.learningStyle || "Netral"}
- Tingkat Detail Penjelasan: ${userPreferences.explanationDetail || "Netral"}
- Gaya Bahasa AI (Tone): ${userPreferences.aiTone || "Ramah"}
Sesuaikan gaya bahasa (tone), panjang penjelasan, dan metode penyampaian Anda (misalnya visual description vs practical examples) secara ketat sesuai preferensi di atas.
--------------------------------------\n`;
        }

        const systemInstruction = `Anda adalah "Asisten Belajar & Akademik Cerdas IOnLearn" — seorang mentor akademik ahli, tutor pribadi serbabisa, dan spesialis riset yang cerdas, sistematis, ramah, dan suportif. Anda membantu siswa sekolah hingga mahasiswa dan peneliti memahami konsep rumit, menyelesaikan tugas dengan integritas, dan menghasilkan karya akademik berstandar tinggi.
${contextString}
${modeInstruction}
${personalizationInstruction}

### 🧠 PRINSIP & PEDOMAN PEDAGOGIS:
1. **Kejelasan Konseptual (First Principles Thinking)**:
   - Jelaskan konsep dari prinsip dasarnya: *apa itu*, *mengapa penting*, *bagaimana cara kerjanya*, dan *analogi nyata* yang mudah dibayangkan.
   - Jika membahas sains, matematika, atau pemrograman, sertakan penjabaran analitis langkah-demi-langkah (step-by-step) beserta alasan di balik tiap tahap rumus atau baris kode.
2. **Format Markdown Unggulan**:
   - Gunakan heading terstruktur (\`#\`, \`##\`, \`###\`), bullet poin bernomor atau simbol yang rapi, dan blok kode (\`\`\`bahasa) dengan penjelasan fungsi.
   - **Format Tabel Wajib Standar**: Untuk perbandingan atau data terstruktur, selalu gunakan tabel Markdown standar dengan pemisah baris baru (*newline*) yang tegas:
     | No | Parameter / Topik | Penjelasan / Nilai | Catatan |
     |:---|:---|:---|:---|
     | 1  | Data A            | Detail A           | Info A  |
     *DILARANG KERAS menggabungkan baris tabel menjadi satu baris teks.*
3. **Ketepatan Fakta & Grounding Web (Google Search)**:
   - Anda dilengkapi Google Search grounding untuk memvalidasi fakta mutakhir, data statistik resmi, literatur akademik, dan peristiwa riil.
   - Selalu manfaatkan pencarian web agar isi materi, dokumen, slide, dan data tabel tidak pernah berhalusinasi atau usang.
   - Jika terdapat data faktual penting, sebutkan konteks tahun atau rujukan ilmiahnya secara alami di dalam narasi.

---

### ⚡ AKSI OTOMATISASI TERINTEGRASI (FILE & PRODUKTIVITAS):

1. 📝 **DOKUMEN FORMAL WORD (.DOCX) / PDF (.PDF) / SPREADSHEET EXCEL (.XLSX)**:
   *Pemicu: Ketika pengguna meminta dokumen, makalah, laporan, esai, file word/pdf, atau tabel spreadsheet excel/xlsx.*
   Isi field \`createdDocument\` dengan objek:
   - \`type\`: \`"docx"\` (dokumen Word), \`"pdf"\` (dokumen PDF), atau \`"xlsx"\` (spreadsheet Excel).
   - \`title\`: Judul resmi dokumen atau lembar kerja (ringkas, berbobot, maks 8-10 kata).
   - \`subject\`: Mata pelajaran / mata kuliah relevan.
   - \`fileName\`: Nama file rapi berakhiran \`.docx\`, \`.pdf\`, atau \`.xlsx\` (contoh: \`makalah_kecerdasan_buatan.docx\` atau \`analisis_keuangan_proyek.xlsx\`).
   - \`description\`: Ringkasan 1-2 kalimat mengenai cakupan isi dokumen.
   - \`content\`:
     * **Jika \`docx\` / \`pdf\`**: Tuliskan naskah lengkap, kaya, dan tuntas berformat Markdown:
     🚨 ATURAN MUTLAK KONTEN FILE: DILARANG KERAS HANYA MENGISI DENGAN PESAN BASA-BASI/PENGANTAR/TEMPLATE SEPERTI "Tentu saja saya telah menyusun dokumen...", "Berikut adalah file...", "Dokumen siap diunduh". ITU BUKAN DOKUMEN!
     Field 'content' HARUS BERISI NASKAH JAWABAN / LAPORAN / KARYA TULIS TUNTAS YANG SESUNGGUHNYA SECARA LENGKAP DARI AWAL HINGGA AKHIR:
     * **Jika \`docx\` / \`pdf\`**: Tuliskan naskah lengkap, kaya, dan tuntas berformat Markdown (minimal 500 - 1500 kata):
       - \`# Judul Dokumen\`
       - \`## Pendahuluan & Latar Belakang\`
       - \`## Landasan Teori / Konsep Kunci\`
       - \`## Pembahasan Komprehensif\` (pecah menjadi sub-bab \`###\`, sertakan studi kasus atau contoh konkret)
       - \`## Tabel Analisis / Komparasi\`
       - \`## Kesimpulan & Rekomendasi Aksi\`
       - \`## Langkah Praktikum / Pembahasan Komprehensif\` (uraikan langkah demi langkah secara nyata dengan baris perintah/prosedur teknis terinci)
       - \`## Tabel Analisis / Komparasi Data\`
       - \`## Hasil & Analisis Pengujian\`
       - \`## Kesimpulan & Rekomendasi\`
       - \`## Referensi / Daftar Rujukan Akademik\`
     * **Jika \`xlsx\`**: Tuliskan tabel data Markdown yang kaya data, rapi, dan realistis (minimal 5-10 baris dengan 3-6 kolom terstruktur). Sertakan kolom metrik angka yang jelas sehingga saat dikonversi menjadi file Excel siap dianalisis dan diolah.
     * PADA FIELD \`reply\`: Tuliskan ringkasan materi atau ulasan eksekutif dari isi dokumen tersebut, JANGAN hanya 1 baris kalimat template!

2. 📊 **SLIDE PRESENTASI PROFESIONAL POWERPOINT (.PPTX)**:
   *Pemicu: Ketika pengguna meminta slide, presentasi, ppt, powerpoint, atau deck presentasi.*
   Isi field \`createdSlides\` dengan objek:
   - \`title\`: Judul utama topik presentasi.
   - \`theme\`: \`"indigo"\` (umum/akademik), \`"emerald"\` (lingkungan/kesehatan), \`"dark"\` (teknologi/koding), atau \`"amber"\` (kreatif/sejarah).
   - \`fileName\`: Nama file rapi berakhiran \`.pptx\` (contoh: \`presentasi_revolusi_industri.pptx\`).
   - \`slides\`: Daftar slide (antara 4 sampai 8 slide terstruktur):
     * Slide 1: Judul Utama & Sub-judul Pembuka.
     * Slide 2: Latar Belakang / Urgensi Topik.
     * Slide 3-N: Poin Inti Materi (buat 3-5 bullet point terukur dan padat per slide, jangan berupa paragraf panjang).
     * Slide Terakhir: Rangkuman Kunci & Call-to-Action / Kesimpulan.
     * \`notes\`: Catatan pemateri (*speaker notes*) yang memuat kalimat panduan berbicara untuk presenter di atas panggung.

3. 🎨 **GENERATOR GAMBAR & DIAGRAM VISUAL AI (\`createdImage\`)**:
   *Pemicu: Ketika pengguna meminta ilustrasi, gambar visual, gambarkan konsep, atau diagram.*
   Isi field \`createdImage\` dengan objek:
   - \`prompt\`: Prompt berbahasa Inggris yang sangat deskriptif, artistik, dan spesifik untuk model AI Image (contoh: *"High-resolution educational 3D render of human respiratory system with labeled lungs and alveoli, soft studio volumetric lighting, clean medical infographic style, sharp focus, 8k resolution"*).
   - \`caption\`: Keterangan gambar dalam bahasa Indonesia yang ringkas dan informatif.
   - \`aspectRatio\`: \`"16:9"\` (default lanskap/presentasi), \`"1:1"\` (ikon/kotak), atau \`"4:3"\` (diagram standar).

4. 📌 **CATATAN MATERI BARU (\`createdNote\`)**:
   *Pemicu: Ketika pengguna meminta "simpan ke catatan", "catatkan materi ini", atau "buat catatan rangkuman".*
   - \`title\`: HANYA judul topik catatan (maks 60 karakter tanpa awalan simbol/markdown).
   - \`content\`: Rangkuman materi Markdown terstruktur. Dilarang menulis \`### Tag:\` di dalam content.
   - \`subject\`: Mata kuliah / pelajaran asli.
   - \`tags\`: 1-3 kata kunci akademik relevan tanpa tagar.

5. 📋 **RENCANA TO-DO TUNGGAL TERPADU (\`createdTodo\`)**:
   *Pemicu: Ketika pengguna meminta "jadikan to-do", "buat jadwal belajar", atau "buat checklist tugas".*
   - Buat 1 rencana terpadu dengan 3-7 \`subtasks\` yang realistis dan dapat dieksekusi secara terurut.

*PENTING: Jangan membuat atau menyertakan field objek pembuatan (document/slides/image/note/todo) jika pengguna tidak memintanya secara eksplisit. Jawablah pesan biasa dengan percakapan yang cerdas, suportif, dan kaya wawasan.*`;

        const provider = aiConfig?.provider || process.env.AI_PROVIDER?.toLowerCase() || "gemini";
        let responseText = "";
        let groundingSources: { title: string; url: string }[] = [];
        let groundingQueries: string[] = [];

        if (provider === "openai") {
            const baseUrl =
                aiConfig?.baseUrl ||
                process.env.OPENAI_BASE_URL ||
                "https://api.openai.com/v1";
            const apiKey = aiConfig?.apiKey || process.env.OPENAI_API_KEY || "";
            const model = aiConfig?.model || process.env.OPENAI_MODEL || "gpt-4o-mini";

            if (!apiKey) {
                return NextResponse.json(
                    {
                        error: "API Key OpenAI belum diisi. Silakan atur di menu Pengaturan Aplikasi.",
                    },
                    { status: 400 },
                );
            }

            const openAiMessages = [
                {
                    role: "system",
                    content:
                        systemInstruction +
                        '\n\nKEMBALIKAN OUTPUT HARUS HANYA DALAM BENTUK JSON OBJECT YANG VALID SESUAI SKEMA BERIKUT:\n{\n  "reply": "Jawaban Markdown",\n  "suggestedPrompts": ["Pertanyaan 1", "Pertanyaan 2"],\n  "createdNote": { "title": "Judul Singkat", "content": "Isi Markdown", "subject": "Nama Mata Kuliah", "tags": ["Label"] },\n  "createdTodo": { "title": "Judul Rencana", "description": "Deskripsi", "priority": "medium", "category": "Materi", "subtasks": [{ "title": "Langkah 1" }] },\n  "createdDocument": { "type": "docx" | "pdf", "title": "Judul Dokumen", "content": "Isi Markdown", "fileName": "dokumen.docx" },\n  "createdSlides": { "title": "Judul Presentasi", "theme": "indigo", "slides": [{ "title": "Slide 1", "bullets": ["Poin 1"], "notes": "Catatan" }], "fileName": "presentasi.pptx" },\n  "createdImage": { "prompt": "English detailed prompt", "caption": "Keterangan Indonesia", "aspectRatio": "16:9" }\n}',
                },
                ...messages.map((m: any) => {
                    if (m.attachments && Array.isArray(m.attachments) && m.attachments.length > 0) {
                        const contentParts: any[] = [{ type: "text", text: m.content || "Analisis lampiran ini:" }];
                        for (const att of m.attachments) {
                            if (att.dataUrl && att.dataUrl.startsWith("data:image")) {
                                contentParts.push({
                                    type: "image_url",
                                    image_url: { url: att.dataUrl },
                                });
                            } else if (att.extractedText) {
                                contentParts.push({
                                    type: "text",
                                    text: `\n\n[Dokumen Lampiran ${att.name}]:\n${att.extractedText}`,
                                });
                            }
                        }
                        return {
                            role: m.role === "assistant" ? "assistant" : "user",
                            content: contentParts,
                        };
                    }
                    return {
                        role: m.role === "assistant" ? "assistant" : "user",
                        content: m.content,
                    };
                }),
            ];

            const openAiRes = await fetch(`${baseUrl}/chat/completions`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${apiKey}`,
                },
                body: JSON.stringify({
                    model,
                    temperature: 0.7,
                    response_format: { type: "json_object" },
                    messages: openAiMessages,
                }),
            });

            if (!openAiRes.ok) {
                const errText = await openAiRes.text();
                throw new Error(`OpenAI API Error (${openAiRes.status}): ${errText}`);
            }

            const data = await openAiRes.json();
            responseText = data.choices[0].message.content;
        } else {
            // Google Gemini Provider (Custom Key or Default Server Key)
            const apiKey =
                provider === "gemini_custom"
                    ? aiConfig?.apiKey
                    : process.env.GEMINI_API_KEY;

            if (!apiKey) {
                return NextResponse.json(
                    {
                        error:
                            provider === "gemini_custom"
                                ? "API Key Google Gemini belum diisi. Silakan masukkan API Key Anda di menu Pengaturan."
                                : "GEMINI_API_KEY environment variable belum diatur di server.",
                    },
                    { status: 400 },
                );
            }

            const modelName =
                (provider === "gemini_custom" && aiConfig?.model) ||
                process.env.NEXT_PUBLIC_GEMINI_MODEL ||
                "gemini-3.1-flash-lite";

            const ai = new GoogleGenAI({ apiKey });
            const contents = messages.map(
                (m: { role: string; content: string; attachments?: any[] }, idx: number) => {
                    let userText = m.content || "Tolong analisa lampiran ini:";
                    // If this is the latest user message and asks for document/file output:
                    if (m.role === "user" && idx === messages.length - 1) {
                        const lower = userText.toLowerCase();
                        const isDocRequest = lower.includes("pdf") || lower.includes("word") || lower.includes("docx") || lower.includes("xlsx") || lower.includes("excel") || lower.includes("spreadsheet") || lower.includes("makalah") || lower.includes("dokumen") || lower.includes("slide") || lower.includes("ppt");
                        if (isDocRequest) {
                            userText += `\n\n[INSTRUKSI SISTEM: Pengguna meminta Anda membuat file dokumen untuk tugas '${taskContext?.title || "ini"}'. Anda WAJIB MENGERJAKAN DAN MENULISKAN SELURUH JAWABAN/LAPORAN/MATERI LENGKAP SECARA MENDALAM DARI AWAL HINGGA AKHIR (minimal 500-1500 kata untuk docx/pdf, atau tabel data lengkap untuk excel) ke dalam field 'content' pada 'createdDocument' (atau 'slides' pada 'createdSlides') dan intisarinya di 'reply'. DILARANG KERAS hanya menulis kalimat pengantar/template basa-basi!]`;
                        }
                    }
                    const parts: any[] = [{ text: userText }];
                    if (m.attachments && Array.isArray(m.attachments)) {
                        for (const att of m.attachments) {
                            if (att.dataUrl && att.dataUrl.startsWith("data:")) {
                                const commaIdx = att.dataUrl.indexOf(",");
                                const header = att.dataUrl.slice(0, commaIdx);
                                const base64Data = att.dataUrl.slice(commaIdx + 1);
                                const mimeType = header.split(";")[0].replace("data:", "") || "image/jpeg";
                                parts.push({
                                    inlineData: {
                                        mimeType,
                                        data: base64Data,
                                    },
                                });
                            } else if (att.extractedText) {
                                parts.push({
                                    text: `\n\n--- [Dokumen Lampiran: ${att.name}] ---\n${att.extractedText}`,
                                });
                            }
                        }
                    }
                    return {
                        role: m.role === "assistant" ? "model" : "user",
                        parts,
                    };
                },
            );

            // Build Gemini config with structured JSON output
            const generationConfig: any = {
                systemInstruction,
                temperature: 0.7,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        reply: {
                            type: Type.STRING,
                            description:
                                "Jawaban utama dari chatbot dengan format Markdown.",
                        },
                        suggestedPrompts: {
                            type: Type.ARRAY,
                            description:
                                "2-3 pertanyaan tindak lanjut yang spesifik dan dinamis.",
                            items: { type: Type.STRING },
                        },
                        createdNote: {
                            type: Type.OBJECT,
                            description:
                                "Catatan materi baru jika pengguna meminta catatan. Field 'title' HANYA judul singkat (maks 60 karakter), seluruh isi penjelasan masuk ke 'content'.",
                            properties: {
                                title: { type: Type.STRING, description: "Judul singkat topik catatan (maks 60 karakter, HANYA judul)" },
                                content: { type: Type.STRING, description: "Isi lengkap catatan format Markdown terstruktur" },
                                subject: { type: Type.STRING, description: "Mata kuliah atau topik materi" },
                                tags: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Tag materi" },
                            },
                        },
                        createdTodo: {
                            type: Type.OBJECT,
                            description:
                                "1 tugas To-Do utama terpadu yang memuat kumpulan sub-langkah (subtasks) jika pengguna meminta membuat to-do list.",
                            properties: {
                                title: { type: Type.STRING, description: "Judul utama rencana to-do" },
                                description: { type: Type.STRING, description: "Deskripsi to-do" },
                                priority: { type: Type.STRING, description: "Prioritas: high, medium, atau low" },
                                category: { type: Type.STRING, description: "Kategori tugas" },
                                subtasks: {
                                    type: Type.ARRAY,
                                    description: "Daftar sub-langkah / checklist aksi",
                                    items: {
                                        type: Type.OBJECT,
                                        properties: {
                                            title: { type: Type.STRING, description: "Judul sub-langkah" },
                                        },
                                    },
                                },
                            },
                        },
                        createdDocument: {
                            type: Type.OBJECT,
                            description: "HANYA isi jika pengguna SECARA EKSPLISIT meminta dokumen/word/docx/pdf/excel/xlsx/spreadsheet. JANGAN isi jika pengguna hanya minta penjelasan biasa, slide, atau gambar.",
                            properties: {
                                type: { type: Type.STRING, description: "Format dokumen: docx, pdf, atau xlsx" },
                                title: { type: Type.STRING, description: "Judul dokumen atau lembar kerja" },
                                content: { type: Type.STRING, description: "Isi dokumen Markdown lengkap terstruktur. Untuk format xlsx sertakan tabel Markdown rapi dengan data relevan." },
                                fileName: { type: Type.STRING, description: "Nama file dengan ekstensi .docx, .pdf, atau .xlsx" },
                                description: { type: Type.STRING, description: "Keterangan singkat" },
                                subject: { type: Type.STRING, description: "Mata kuliah atau topik" },
                            },
                        },
                        createdSlides: {
                            type: Type.OBJECT,
                            description: "HANYA isi jika pengguna SECARA EKSPLISIT meminta presentasi/slide/ppt/pptx/powerpoint. JANGAN isi jika pengguna minta dokumen word/pdf atau penjelasan biasa.",
                            properties: {
                                title: { type: Type.STRING, description: "Judul utama presentasi" },
                                theme: { type: Type.STRING, description: "Tema warna: indigo, dark, emerald, amber, atau slate" },
                                fileName: { type: Type.STRING, description: "Nama file dengan ekstensi .pptx" },
                                subject: { type: Type.STRING, description: "Mata kuliah atau topik" },
                                slides: {
                                    type: Type.ARRAY,
                                    description: "Daftar slide materi",
                                    items: {
                                        type: Type.OBJECT,
                                        properties: {
                                            title: { type: Type.STRING, description: "Judul slide" },
                                            bullets: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Poin-poin bullet materi" },
                                            notes: { type: Type.STRING, description: "Catatan presenter" },
                                        },
                                    },
                                },
                            },
                        },
                        createdImage: {
                            type: Type.OBJECT,
                            description: "HANYA isi jika pengguna SECARA EKSPLISIT meminta gambar/ilustrasi/diagram/generate image. JANGAN isi jika pengguna minta dokumen, slide, atau penjelasan biasa.",
                            properties: {
                                prompt: { type: Type.STRING, description: "Prompt berbahasa Inggris yang jelas dan deskriptif untuk generator gambar" },
                                caption: { type: Type.STRING, description: "Keterangan gambar dalam bahasa Indonesia" },
                                aspectRatio: { type: Type.STRING, description: "Rasio aspek: 16:9, 1:1, atau 4:3" },
                            },
                        },
                    },
                    required: ["reply", "suggestedPrompts"],
                },
            };

            // Try with Google Search grounding first, fall back to without if model doesn't support it
            let response: any;

            try {
                response = await ai.models.generateContent({
                    model: modelName,
                    contents,
                    config: {
                        ...generationConfig,
                        tools: [{ googleSearch: {} }],
                    },
                });
            } catch (groundingError: any) {
                // If grounding + schema is not supported by this model, retry without grounding
                console.warn("Grounding with schema failed, retrying without grounding:", groundingError.message);
                response = await ai.models.generateContent({
                    model: modelName,
                    contents,
                    config: generationConfig,
                });
            }

            // Extract grounding metadata (search sources & queries) if available
            try {
                const candidate = response?.candidates?.[0];
                const metadata = candidate?.groundingMetadata;
                if (metadata) {
                    if (metadata.groundingChunks && Array.isArray(metadata.groundingChunks)) {
                        groundingSources = metadata.groundingChunks
                            .filter((chunk: any) => chunk?.web?.uri && chunk?.web?.title)
                            .map((chunk: any) => ({
                                title: chunk.web.title,
                                url: chunk.web.uri,
                            }))
                            .slice(0, 5);
                    }
                    if (metadata.webSearchQueries && Array.isArray(metadata.webSearchQueries)) {
                        groundingQueries = metadata.webSearchQueries.slice(0, 3);
                    }
                }
            } catch {
                // Grounding metadata extraction is best-effort
            }

            responseText = response.text || "{}";
        }

        let resultData: any = {};
        try {
            const cleaned = responseText.replace(/^```json\s*/i, "").replace(/\s*```$/i, "").trim();
            resultData = JSON.parse(cleaned);
        } catch (e) {
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                try {
                    resultData = JSON.parse(jsonMatch[0]);
                } catch {
                    resultData = { reply: responseText, suggestedPrompts: [] };
                }
            } else {
                resultData = { reply: responseText, suggestedPrompts: [] };
            }
        }

        const lastUserMsg = [...messages].reverse().find((m: any) => m.role === "user")?.content || "";
        const fallback = extractFallbackActions(lastUserMsg, resultData.reply || responseText, taskContext, messages);

        const finalNote = sanitizeNoteOutput(resultData.createdNote, resultData.reply || responseText, taskContext)
            || fallback.createdNote
            || undefined;
        const finalTodo = resultData.createdTodo || (resultData.createdTodos && resultData.createdTodos.length > 0 ? undefined : fallback.createdTodo) || undefined;
        const finalTodos = resultData.createdTodos || undefined;

        // Validate Gemini response objects before preferring them over fallback
        // If geminiDoc is just conversational filler (e.g. "Tentu saja saya telah membuat..."), rescue the real content!
        const geminiDoc = resultData.createdDocument;
        let isGeminiDocValid = geminiDoc && geminiDoc.title && geminiDoc.content && !isConversationalFiller(geminiDoc.content);

        if (geminiDoc && geminiDoc.title && (!geminiDoc.content || isConversationalFiller(geminiDoc.content))) {
            const prevAssistantMsgs = messages.filter(
                (m: any) => m.role === "assistant" && m.content && !isConversationalFiller(m.content) && m.content.length > 250
            );
            if (!isConversationalFiller(resultData.reply) && resultData.reply.length > 300) {
                geminiDoc.content = resultData.reply;
                isGeminiDocValid = true;
            } else if (prevAssistantMsgs.length > 0) {
                geminiDoc.content = prevAssistantMsgs[prevAssistantMsgs.length - 1].content;
                isGeminiDocValid = true;
            } else if (fallback.createdDocument && !isConversationalFiller(fallback.createdDocument.content)) {
                geminiDoc.content = fallback.createdDocument.content;
                isGeminiDocValid = true;
            }
        }

        const rawDocument = (isGeminiDocValid ? geminiDoc : fallback.createdDocument) || undefined;
        if (rawDocument) {
            const headingMatch = rawDocument.content?.split("\n").find((l: string) => l.trim().startsWith("#"));
            if (headingMatch) {
                const headingTitle = headingMatch.replace(/^[#\s*]+/, "").trim().slice(0, 80);
                if (headingTitle && headingTitle.length > 3) {
                    rawDocument.title = headingTitle;
                }
            } else if (taskContext?.title) {
                rawDocument.title = taskContext.title;
            }
        }

        const geminiSlides = resultData.createdSlides;
        const isGeminiSlidesValid = geminiSlides && Array.isArray(geminiSlides.slides) && geminiSlides.slides.length > 0;
        const rawSlides = (isGeminiSlidesValid ? geminiSlides : fallback.createdSlides) || undefined;

        const geminiImage = resultData.createdImage;
        const isGeminiImageValid = geminiImage && geminiImage.prompt && geminiImage.prompt.trim().length > 0;
        const rawImage = (isGeminiImageValid ? geminiImage : fallback.createdImage) || undefined;

        // Intent-based filtering: only include creation types the user actually asked for
        const lowerMsg = lastUserMsg.toLowerCase();
        const userWantsDocument = lowerMsg.includes("word") || lowerMsg.includes("docx") || lowerMsg.includes("pdf") || lowerMsg.includes("makalah") || lowerMsg.includes("dokumen") || lowerMsg.includes("excel") || lowerMsg.includes("xlsx") || lowerMsg.includes("spreadsheet") || lowerMsg.includes("spredsheet") || lowerMsg.includes("xlxs");
        const userWantsSlides = lowerMsg.includes("slide") || lowerMsg.includes("presentasi") || lowerMsg.includes("ppt") || lowerMsg.includes("powerpoint");
        const userWantsImage = lowerMsg.includes("gambarkan") || lowerMsg.includes("buatkan gambar") || lowerMsg.includes("bikin gambar") || lowerMsg.includes("ilustrasikan") || lowerMsg.includes("generate image") || lowerMsg.includes("lukiskan") || lowerMsg.includes("diagram");
        const userWantsAnyCreation = userWantsDocument || userWantsSlides || userWantsImage;

        // If user explicitly asked for a specific type, only include that type
        // If user didn't ask for anything specific, allow Gemini's judgement
        const finalDocument = (rawDocument && rawDocument.title && (rawDocument.content || rawDocument.title))
            ? (userWantsAnyCreation && !userWantsDocument ? undefined : rawDocument)
            : undefined;

        const finalSlides = (rawSlides && Array.isArray(rawSlides.slides) && rawSlides.slides.length > 0)
            ? (userWantsAnyCreation && !userWantsSlides ? undefined : rawSlides)
            : undefined;

        const finalImage = (rawImage && rawImage.prompt)
            ? (userWantsAnyCreation && !userWantsImage ? undefined : rawImage)
            : undefined;

        if (finalImage && !finalImage.url && finalImage.prompt) {
            const width = finalImage.aspectRatio === "1:1" ? 1024 : finalImage.aspectRatio === "4:3" ? 1024 : 1280;
            const height = finalImage.aspectRatio === "1:1" ? 1024 : finalImage.aspectRatio === "4:3" ? 768 : 720;
            finalImage.url = `https://image.pollinations.ai/prompt/${encodeURIComponent(finalImage.prompt)}?width=${width}&height=${height}&model=flux&nologo=true`;
        }

        return NextResponse.json({
            reply:
                resultData.reply ||
                (typeof responseText === "string" && !responseText.startsWith("{") ? responseText : "Tugas berhasil diproses."),
            suggestedPrompts: Array.isArray(resultData.suggestedPrompts) ? resultData.suggestedPrompts : [],
            createdNote: finalNote,
            createdTodo: finalTodo,
            createdTodos: finalTodos,
            createdDocument: finalDocument,
            createdSlides: finalSlides,
            createdImage: finalImage,
            groundingSources: groundingSources.length > 0 ? groundingSources : undefined,
            groundingQueries: groundingQueries.length > 0 ? groundingQueries : undefined,
            timestamp: Date.now(),
        });
    } catch (error: any) {
        console.error("Error in AI Chat:", error);
        return NextResponse.json(
            {
                error: error.message || "Terjadi kesalahan pada chatbot AI.",
            },
            { status: 500 },
        );
    }
}
