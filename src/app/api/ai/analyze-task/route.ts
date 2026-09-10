import { NextResponse } from "next/server";
import { GoogleGenAI, Type } from "@google/genai";
import { AIConfig } from "@/types";

export async function POST(req: Request) {
    try {
        const {
            title,
            description,
            courseName,
            materials,
            userPreferences,
            aiConfig,
        } = (await req.json()) as {
            title: string;
            description?: string;
            courseName?: string;
            materials?: any[];
            userPreferences?: any;
            aiConfig?: AIConfig | null;
        };

        if (!title) {
            return NextResponse.json(
                { error: "Title is required" },
                { status: 400 },
            );
        }

        let materialsContext = "";
        if (Array.isArray(materials) && materials.length > 0) {
            materialsContext =
                "\n\nMateri/Lampiran dari Guru:\n" +
                materials
                    .map((m: any, idx: number) => {
                        if (m.driveFile?.driveFile)
                            return `- File: ${m.driveFile.driveFile.title} (${m.driveFile.driveFile.alternateLink})`;
                        if (m.youtubeVideo)
                            return `- Video: ${m.youtubeVideo.title} (${m.youtubeVideo.alternateLink})`;
                        if (m.link)
                            return `- Link Web: ${m.link.title || m.link.url} (${m.link.url})`;
                        if (m.form)
                            return `- Google Form: ${m.form.title || m.form.formUrl}`;
                        return `- Lampiran #${idx + 1}`;
                    })
                    .join("\n");
        }

        let personalizationInstruction = "";
        if (userPreferences) {
            personalizationInstruction = `\n--- PREFERENSI PERSONALISASI SISWA ---
Siswa ini memiliki preferensi:
- Gaya Belajar: ${userPreferences.learningStyle || "Netral"}
- Tingkat Detail Penjelasan: ${userPreferences.explanationDetail || "Netral"}
- Gaya Bahasa AI (Tone): ${userPreferences.aiTone || "Ramah"}
Harap sesuaikan gaya ringkasan, strategi belajar, dan tone penulisan checklist Anda sesuai preferensi di atas.
--------------------------------------\n`;
        }

        const prompt = `Anda adalah asisten AI akademik dan tutor cerdas untuk siswa/mahasiswa. 
Tugas yang disinkronkan dari Google Classroom:
- Mata Pelajaran / Kelas: ${courseName || "Umum"}
- Judul Tugas: ${title}
- Instruksi & Deskripsi Tugas: ${description || "Tidak ada deskripsi rinci."}
${materialsContext}
${personalizationInstruction}

TUGAS ANDA:
1. Buat ringkasan tugas yang jelas dan mudah dipahami dalam 1-2 kalimat.
2. Estimasi waktu pengerjaan (dalam menit) dan tingkat kesulitan (Mudah / Sedang / Menantang).
3. Identifikasi konsep-konsep kunci (key concepts) yang perlu dipahami murid untuk mengerjakan tugas ini.
4. Buat daftar checklist langkah pengerjaan yang terstruktur dan dapat dicentang satu per satu.
5. Rekomendasikan 3-5 sumber belajar terpercaya (website tutorial, dokumentasi resmi, jurnal/artikel edukasi, ensiklopedia atau platform belajar seperti Khan Academy, GeeksforGeeks, Dicoding, Kemdikbud, Ruangguru, dsb). Pastikan menyertakan URL valid atau link pencarian terarah.
6. Rekomendasikan 2-4 video YouTube atau topik video edukasi YouTube spesifik yang sangat relevan. Berikan keyword pencarian YouTube yang akurat, channel rekomendasi, alasan kenapa video ini membantu, dan poin penting yang bisa dipelajari.
7. Berikan tips belajar dan strategi pengerjaan terbaik agar mendapat nilai maksimal.

Harap hasilkan output dalam format JSON sesuai schema yang ditentukan, dengan bahasa Indonesia yang ramah, jelas, edukatif, dan memotivasi.`;

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
                    messages: [
                        {
                            role: "system",
                            content:
                                'Anda adalah tutor dan asisten belajar AI profesional berbahasa Indonesia. Berikan rekomendasi belajar yang akurat, relevan dengan materi sekolah/kuliah, dan mudah dipraktikkan oleh siswa.\n\nKEMBALIKAN OUTPUT HARUS HANYA DALAM BENTUK JSON OBJECT YANG VALID SESUAI SKEMA BERIKUT:\n{\n  "summary": "String",\n  "estimatedMinutes": Number,\n  "difficulty": "Mudah" | "Sedang" | "Menantang",\n  "keyConcepts": ["String"],\n  "checklist": [{ "id": "String", "text": "String", "done": Boolean }],\n  "sources": [{ "title": "String", "url": "String", "domain": "String", "description": "String", "type": "doc"|"article"|"tool"|"tutorial"|"academic" }],\n  "youtubeVideos": [{ "title": "String", "channel": "String", "searchQuery": "String", "searchUrl": "String", "reason": "String", "keyTakeaways": ["String"] }],\n  "studyTips": ["String"],\n  "recommendedStrategy": "String"\n}',
                        },
                        { role: "user", content: prompt },
                    ],
                }),
            });

            if (!openAiRes.ok) {
                const errText = await openAiRes.text();
                throw new Error(`OpenAI API Error (${openAiRes.status}): ${errText}`);
            }

            const data = await openAiRes.json();
            responseText = data.choices[0].message.content;
        } else {
            // Google Gemini Provider (Custom API Key or Default Server Key)
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
            const response = await ai.models.generateContent({
                model: modelName,
                contents: prompt,
                config: {
                    systemInstruction:
                        "Anda adalah tutor dan asisten belajar AI profesional berbahasa Indonesia. Berikan rekomendasi belajar yang akurat, relevan dengan materi sekolah/kuliah, dan mudah dipraktikkan oleh siswa.",
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            summary: { type: Type.STRING },
                            estimatedMinutes: { type: Type.NUMBER },
                            difficulty: {
                                type: Type.STRING,
                                enum: ["Mudah", "Sedang", "Menantang"],
                            },
                            keyConcepts: {
                                type: Type.ARRAY,
                                items: { type: Type.STRING },
                            },
                            checklist: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        id: { type: Type.STRING },
                                        text: { type: Type.STRING },
                                        done: { type: Type.BOOLEAN },
                                    },
                                    required: ["id", "text", "done"],
                                },
                            },
                            sources: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        title: { type: Type.STRING },
                                        url: { type: Type.STRING },
                                        domain: { type: Type.STRING },
                                        description: { type: Type.STRING },
                                        type: {
                                            type: Type.STRING,
                                            enum: [
                                                "doc",
                                                "article",
                                                "tool",
                                                "tutorial",
                                                "academic",
                                            ],
                                        },
                                    },
                                    required: [
                                        "title",
                                        "url",
                                        "domain",
                                        "description",
                                        "type",
                                    ],
                                },
                            },
                            youtubeVideos: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        title: { type: Type.STRING },
                                        channel: { type: Type.STRING },
                                        searchQuery: { type: Type.STRING },
                                        searchUrl: { type: Type.STRING },
                                        reason: { type: Type.STRING },
                                        keyTakeaways: {
                                            type: Type.ARRAY,
                                            items: { type: Type.STRING },
                                        },
                                    },
                                    required: [
                                        "title",
                                        "channel",
                                        "searchQuery",
                                        "searchUrl",
                                        "reason",
                                        "keyTakeaways",
                                    ],
                                },
                            },
                            studyTips: {
                                type: Type.ARRAY,
                                items: { type: Type.STRING },
                            },
                            recommendedStrategy: { type: Type.STRING },
                        },
                        required: [
                            "summary",
                            "estimatedMinutes",
                            "difficulty",
                            "keyConcepts",
                            "checklist",
                            "sources",
                            "youtubeVideos",
                            "studyTips",
                            "recommendedStrategy",
                        ],
                    },
                },
            });
            responseText = response.text || "{}";
        }

        const parsed = JSON.parse(responseText);

        if (Array.isArray(parsed.checklist)) {
            parsed.checklist = parsed.checklist.map((item: any, i: number) => ({
                id: item.id || `step-${i + 1}`,
                text: item.text,
                done: Boolean(item.done),
            }));
        }

        if (Array.isArray(parsed.youtubeVideos)) {
            parsed.youtubeVideos = parsed.youtubeVideos.map((yt: any) => ({
                ...yt,
                searchUrl:
                    yt.searchUrl ||
                    `https://www.youtube.com/results?search_query=${encodeURIComponent(yt.searchQuery || yt.title)}`,
            }));
        }

        parsed.generatedAt = new Date().toISOString();

        return NextResponse.json(parsed);
    } catch (error: any) {
        console.error("Error analyzing task with AI:", error);
        return NextResponse.json(
            {
                error:
                    error.message ||
                    "Gagal menganalisis tugas dengan AI. Silakan coba lagi.",
            },
            { status: 500 },
        );
    }
}
