import { NextResponse } from "next/server";
import { GoogleGenAI, Type } from "@google/genai";
import { AIConfig } from "@/types";

export async function POST(req: Request) {
    try {
        const { messages, taskContext, userPreferences, aiConfig } =
            (await req.json()) as {
                messages: { role: string; content: string }[];
                taskContext?: any;
                userPreferences?: any;
                aiConfig?: AIConfig | null;
            };

        if (!Array.isArray(messages) || messages.length === 0) {
            return NextResponse.json(
                { error: "Messages array is required" },
                { status: 400 },
            );
        }

        let contextString = "";
        if (taskContext) {
            contextString = `\n--- KONTEKS TUGAS AKTIF ---
Judul Tugas: ${taskContext.title || "-"}
Mata Pelajaran / Kelas: ${taskContext.courseName || "-"}
Deskripsi Tugas: ${taskContext.description || "-"}
Deadline: ${taskContext.dueDateStr || "Tidak ada"}
${taskContext.customNotes ? `Catatan Tambahan Pengguna: ${taskContext.customNotes}` : ""}
---------------------------`;
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
${personalizationInstruction}

Pedoman Anda:
1. Bantu pengguna memahami konsep materi, memecah instruksi rumit, merumuskan ide, memberi contoh, atau mengecek langkah kerja.
2. Jangan hanya memberikan jawaban instan secara mentah bila itu tugas esai/pemikiran, melainkan bimbing alur logika dan metodologinya (pendekatan Sokratik yang suportif), kecuali jika pengguna meminta penjelasan konsep spesifik, rumus, atau perbaikan sintaks.
3. Berikan jawaban dalam format Markdown yang rapi, terstruktur, gunakan poin-poin, tabel jika relevan, serta blok kode (\`\`\`) bila membahas pemrograman/matematika.
4. Jika relevan, sarankan kata kunci pencarian YouTube atau sumber bacaan terpercaya untuk mendalami topik yang ditanyakan.
5. Gunakan bahasa Indonesia yang santun, bersahabat, dan memotivasi.`;

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
                        '\n\nKEMBALIKAN OUTPUT HARUS HANYA DALAM BENTUK JSON OBJECT YANG VALID SESUAI SKEMA BERIKUT:\n{\n  "reply": "Jawaban Markdown",\n  "suggestedPrompts": ["Pertanyaan 1", "Pertanyaan 2"]\n}',
                },
                ...messages.map((m: any) => ({
                    role: m.role === "assistant" ? "assistant" : "user",
                    content: m.content,
                })),
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
                (m: { role: string; content: string }) => ({
                    role: m.role === "assistant" ? "model" : "user",
                    parts: [{ text: m.content }],
                }),
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
                                type: "STRING",
                                description:
                                    "Jawaban utama dari chatbot dengan format Markdown.",
                            },
                            suggestedPrompts: {
                                type: "ARRAY",
                                description:
                                    "2-3 pertanyaan tindak lanjut yang spesifik dan dinamis.",
                                items: { type: "STRING" },
                            },
                        },
                        required: ["reply", "suggestedPrompts"],
                    },
                },
            });
            responseText = response.text || "{}";
        }

        let resultData;
        try {
            resultData = JSON.parse(responseText);
        } catch (e) {
            resultData = { reply: responseText, suggestedPrompts: [] };
        }

        return NextResponse.json({
            reply:
                resultData.reply ||
                "Maaf, saya tidak dapat menghasilkan respon saat ini.",
            suggestedPrompts: resultData.suggestedPrompts || [],
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
