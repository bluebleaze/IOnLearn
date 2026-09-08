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

function extractFallbackActions(
    lastUserMessage: string,
    replyText: string,
    taskContext?: any
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

    // Check Document intent: "pdf", "word", "docx", "makalah", "dokumen"
    const wantsDocx = lowerUser.includes("word") || lowerUser.includes("docx") || lowerUser.includes(".docx");
    const wantsPdf = lowerUser.includes("pdf") || lowerUser.includes(".pdf");
    if (wantsDocx || wantsPdf) {
        const lines = replyText.split("\n").map((l) => l.trim()).filter(Boolean);
        const headingLine = lines.find((l) => l.startsWith("#"));
        const docTitle = headingLine
            ? headingLine.replace(/^[#\s*]+/, "").trim().slice(0, 80)
            : taskContext?.title || "Dokumen Materi Belajar";

        createdDocument = {
            type: wantsDocx ? "docx" : "pdf",
            title: docTitle,
            content: replyText,
            fileName: `${docTitle.toLowerCase().replace(/[^a-z0-9]+/g, "_")}.${wantsDocx ? "docx" : "pdf"}`,
            description: `Dokumen ${wantsDocx ? "Word (.docx)" : "PDF (.pdf)"} siap unduh.`,
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

        const systemInstruction = `Anda adalah "Asisten Belajar Cerdas AI", teman belajar dan tutor pribadi siswa yang ramah, sabar, cerdas, dan suportif.
${contextString}
${modeInstruction}
${personalizationInstruction}

Pedoman Anda:
1. Bantu pengguna memahami konsep materi, memecah instruksi rumit, merumuskan ide, memberi contoh, atau mengecek langkah kerja.
2. Gunakan format Markdown yang rapi dan terstruktur: gunakan poin-poin, blok kode (\`\`\`) lengkap dengan tag bahasa pemrograman, dan TABEL Markdown standar dengan pemisah baris baru (newline) yang jelas di setiap barisnya (| Header 1 | Header 2 |\\n|:---|:---|\\n| Data 1 | Data 2 |). JANGAN menggabungkan baris tabel menjadi satu baris.
3. Gunakan bahasa Indonesia yang santun, bersahabat, dan memotivasi.

Fitur Otomatisasi Terintegrasi (Actions):
- KETIKA PENGGUNA MEMINTA MEMBUATKAN CATATAN / MENYIMPAN CATATAN MATERI (misal: "buatkan catatan materi tentang...", "simpan ini ke catatan", "catatkan rangkuman ini"):
  Isi field "createdNote" dengan objek:
  {
    "title": "Judul Singkat Catatan (Maks 6-8 kata, contoh: 'Konsep Momen Inersia & Rotasi', HANYA judul topik tanpa markdown/prefix)",
    "content": "Isi lengkap materi format Markdown terstruktur. PENTING: JANGAN menambahkan baris '### Tag: ...' atau hashtag di akhir teks content, karena tag sudah terpisah di field 'tags'.",
    "subject": "Nama Mata Pelajaran/Kuliah Asli (Contoh: Fisika, Matematika, Biologi, Kimia, Algoritma, BUKAN 'Belajar AI')",
    "tags": ["Label1", "Label2"] (1-3 label akademik relevan tanpa simbol '#', contoh: ["Mekanika", "UAS", "Rumus"])
  }
- KETIKA PENGGUNA MEMINTA MEMBUATKAN TO-DO LIST / DAFTAR TUGAS / ACTION PLAN (misal: "buatkan to-do list belajar...", "jadikan to-do", "buat langkah to-do"):
  PENTING: Buat menjadi 1 tugas utama terpadu yang memuat kumpulan sub-langkah (subtasks). JANGAN membuat banyak tugas terpisah.
  Isi field "createdTodo" dengan objek:
  {
    "title": "Judul Utama Rencana Belajar / Topik Tugas",
    "description": "Deskripsi singkat rencana kerja",
    "priority": "high" | "medium" | "low",
    "category": "Kategori / Mata Pelajaran",
    "subtasks": [
      { "title": "Sub-langkah 1: ..." },
      { "title": "Sub-langkah 2: ..." }
    ]
  }
- KETIKA PENGGUNA MEMINTA DOKUMEN DALAM BENTUK WORD (.DOCX) ATAU PDF (.PDF) (misal: "kirim dalam bentuk pdf", "buatkan makalah word", "format docx", "buat file pdf"):
  Isi field "createdDocument" dengan objek:
  {
    "type": "docx" | "pdf",
    "title": "Judul Dokumen (Contoh: 'Makalah Perkembangan Revolusi Industri')",
    "content": "Isi lengkap materi format Markdown terstruktur dengan heading, poin, dan tabel jika ada",
    "fileName": "nama_dokumen.docx" (atau .pdf),
    "description": "Keterangan singkat isi dokumen"
  }
- KETIKA PENGGUNA MEMINTA SLIDE / PRESENTASI (misal: "buatkan presentasi slide tentang...", "bikin ppt", "buatkan slide powerpoint", "buat 5 slide"):
  Isi field "createdSlides" dengan objek:
  {
    "title": "Judul Utama Presentasi",
    "theme": "indigo" | "dark" | "emerald" | "amber",
    "slides": [
      {
        "title": "Judul Slide 1",
        "bullets": ["Poin materi 1", "Poin materi 2", "Poin materi 3"],
        "notes": "Catatan pembicara singkat untuk slide ini"
      }
    ],
    "fileName": "nama_presentasi.pptx"
  }
- KETIKA PENGGUNA MEMINTA GAMBAR / ILUSTRASI / DIAGRAM VISUAL (misal: "gambarkan struktur sel", "buatkan gambar ilustrasi fotosintesis", "generate image of..."):
  Isi field "createdImage" dengan objek:
  {
    "prompt": "Deskripsi prompt dalam bahasa Inggris yang detail dan jelas untuk AI image generator (contoh: 'Detailed scientific diagram of plant cell anatomy with chloroplasts and nucleus, educational modern style, high resolution')",
    "caption": "Keterangan gambar dalam bahasa Indonesia (contoh: 'Diagram Anatomi Sel Tumbuhan')",
    "aspectRatio": "16:9" | "1:1" | "4:3"
  }
- Jika pengguna tidak meminta membuat catatan, to-do, dokumen, presentasi slide, atau gambar, jangan sertakan field-field tersebut (kosongkan/abaikan).`;

        const provider = aiConfig?.provider || process.env.AI_PROVIDER?.toLowerCase() || "gemini";
        let responseText = "";

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
                (m: { role: string; content: string; attachments?: any[] }) => {
                    const parts: any[] = [{ text: m.content || "Tolong analisa lampiran ini:" }];
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

            const response = await ai.models.generateContent({
                model: modelName,
                contents,
                config: {
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
                                description: "Dokumen Word (.docx) atau PDF (.pdf) jika pengguna meminta dokumen/makalah/file.",
                                properties: {
                                    type: { type: Type.STRING, description: "Format: docx atau pdf" },
                                    title: { type: Type.STRING, description: "Judul dokumen" },
                                    content: { type: Type.STRING, description: "Isi dokumen Markdown lengkap terstruktur" },
                                    fileName: { type: Type.STRING, description: "Nama file dengan ekstensi .docx atau .pdf" },
                                    description: { type: Type.STRING, description: "Keterangan singkat" },
                                    subject: { type: Type.STRING, description: "Mata kuliah atau topik" },
                                },
                            },
                            createdSlides: {
                                type: Type.OBJECT,
                                description: "Slide presentasi (.pptx) jika pengguna meminta presentasi/slide/ppt.",
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
                                description: "Prompt pembuatan gambar visual/diagram jika pengguna meminta gambar/ilustrasi.",
                                properties: {
                                    prompt: { type: Type.STRING, description: "Prompt berbahasa Inggris yang jelas dan deskriptif untuk generator gambar" },
                                    caption: { type: Type.STRING, description: "Keterangan gambar dalam bahasa Indonesia" },
                                    aspectRatio: { type: Type.STRING, description: "Rasio aspek: 16:9, 1:1, atau 4:3" },
                                },
                            },
                        },
                        required: ["reply", "suggestedPrompts"],
                    },
                },
            });
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
        const fallback = extractFallbackActions(lastUserMsg, resultData.reply || responseText, taskContext);

        const finalNote = sanitizeNoteOutput(resultData.createdNote, resultData.reply || responseText, taskContext)
            || fallback.createdNote
            || undefined;
        const finalTodo = resultData.createdTodo || (resultData.createdTodos && resultData.createdTodos.length > 0 ? undefined : fallback.createdTodo) || undefined;
        const finalTodos = resultData.createdTodos || undefined;

        const finalDocument = resultData.createdDocument || fallback.createdDocument || undefined;
        const finalSlides = resultData.createdSlides || fallback.createdSlides || undefined;
        const finalImage = resultData.createdImage || fallback.createdImage || undefined;

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
