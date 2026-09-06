import { NextResponse } from "next/server";
import { GoogleGenAI, Type } from "@google/genai";
import { AIConfig } from "@/types";
function extractFallbackActions(
    lastUserMessage: string,
    replyText: string,
    taskContext?: any
): { createdNote?: any; createdTodo?: any } {
    if (!replyText || replyText.length < 15) return {};

    const lowerUser = (lastUserMessage || "").toLowerCase();
    let createdNote: any = undefined;
    let createdTodo: any = undefined;

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

        const cleanTitle = rawTitle.replace(/["'{}]/g, "").slice(0, 80);

        createdNote = {
            title: cleanTitle || (taskContext?.title ? `Catatan: ${taskContext.title}` : "Catatan Materi AI"),
            content: replyText,
            subject: taskContext?.courseName || "Belajar Mandiri",
            tags: ["AI Copilot", "Rangkuman"],
        };
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

    return { createdNote, createdTodo };
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
2. Gunakan format Markdown yang rapi, terstruktur, gunakan poin-poin, tabel jika relevan, serta blok kode (\`\`\`) lengkap dengan tag bahasa pemrograman bila membahas coding/sains.
3. Gunakan bahasa Indonesia yang santun, bersahabat, dan memotivasi.

Fitur Otomatisasi Terintegrasi (Actions):
- KETIKA PENGGUNA MEMINTA MEMBUATKAN CATATAN / MENYIMPAN CATATAN MATERI (misal: "buatkan catatan materi tentang...", "simpan ini ke catatan", "catatkan rangkuman ini"):
  Isi field "createdNote" dengan objek { "title": "Judul Catatan", "content": "Isi lengkap catatan format Markdown terstruktur", "subject": "Nama Mata Pelajaran/Topik", "tags": ["tag1", "tag2"] }.
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
- Jika pengguna tidak meminta membuat catatan atau to-do, jangan sertakan field createdNote atau createdTodo (kosongkan/abaikan).`;

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
                        '\n\nKEMBALIKAN OUTPUT HARUS HANYA DALAM BENTUK JSON OBJECT YANG VALID SESUAI SKEMA BERIKUT:\n{\n  "reply": "Jawaban Markdown",\n  "suggestedPrompts": ["Pertanyaan 1", "Pertanyaan 2"],\n  "createdNote": { "title": "Judul", "content": "Isi Markdown", "subject": "Mata Kuliah", "tags": ["tag"] },\n  "createdTodo": { "title": "Judul Rencana", "description": "Deskripsi", "priority": "medium", "category": "Materi", "subtasks": [{ "title": "Langkah 1" }, { "title": "Langkah 2" }] }\n}',
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
                                    "Catatan materi baru yang otomatis dibuatkan dan disimpan jika pengguna meminta membuat catatan.",
                                properties: {
                                    title: { type: Type.STRING, description: "Judul catatan materi" },
                                    content: { type: Type.STRING, description: "Isi lengkap catatan dalam Markdown" },
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

        const finalNote = resultData.createdNote || fallback.createdNote || undefined;
        const finalTodo = resultData.createdTodo || (resultData.createdTodos && resultData.createdTodos.length > 0 ? undefined : fallback.createdTodo) || undefined;
        const finalTodos = resultData.createdTodos || undefined;

        return NextResponse.json({
            reply:
                resultData.reply ||
                (typeof responseText === "string" && !responseText.startsWith("{") ? responseText : "Tugas berhasil diproses."),
            suggestedPrompts: Array.isArray(resultData.suggestedPrompts) ? resultData.suggestedPrompts : [],
            createdNote: finalNote,
            createdTodo: finalTodo,
            createdTodos: finalTodos,
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
