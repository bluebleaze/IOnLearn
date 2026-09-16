import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { AIConfig } from "@/types";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const action = body.action as "breakdown_task" | "summarize_note" | "generate_quiz";
    const payload = body.payload || body.task || body.note;
    const userPreferences = body.userPreferences || body.preferences;
    const aiConfig = body.aiConfig as AIConfig | null | undefined;

    if (!action || !payload) {
      return NextResponse.json(
        { error: "Action and payload (or task/note) are required" },
        { status: 400 }
      );
    }

    let prompt = "";
    if (action === "breakdown_task") {
      prompt = `Anda adalah asisten AI perencana belajar (Study Planner) untuk siswa.
Tugas:
- Judul: ${payload.title}
- Mata Pelajaran: ${payload.courseName || "Umum"}
- Deskripsi: ${payload.description || "Tidak ada deskripsi rinci."}

Pecah tugas di atas menjadi 3 sampai 6 to-do item langkah kerja yang realistis, terukur, dan berurutan agar siswa tidak kewalahan.
Format output JSON:
{
  "todos": [
    {
      "title": "Nama langkah aksi ringkas",
      "priority": "high" | "medium" | "low",
      "estimatedMinutes": 30
    }
  ]
}
Hanya berikan JSON murni.`;
    } else if (action === "summarize_note") {
      prompt = `Anda adalah asisten AI tutor. Buatkan ringkasan intisari materi yang rapi, padat, dan mudah dipahami dari catatan berikut:
Judul Catatan: ${payload.title || "Catatan Belajar"}
Mata Pelajaran: ${payload.subject || "Umum"}
Isi Catatan:
${payload.content}

Format output JSON:
{
  "summary": "Teks ringkasan menyeluruh dalam 2-3 paragraf/bullet point yang menyoroti konsep inti."
}
Hanya berikan JSON murni.`;
    } else if (action === "generate_quiz") {
      prompt = `Anda adalah asisten AI pembuat kuis evaluasi materi belajar.
Buatkan 3 sampai 5 soal pilihan ganda evaluatif untuk menguji pemahaman siswa berdasarkan materi catatan berikut:
Judul Catatan: ${payload.title || "Catatan Belajar"}
Isi Catatan:
${payload.content}

Format output JSON:
{
  "quiz": [
    {
      "id": "q1",
      "question": "Pertanyaan evaluasi...",
      "options": ["Pilihan A", "Pilihan B", "Pilihan C", "Pilihan D"],
      "correctAnswer": 0, // indeks jawaban yang benar (0, 1, 2, atau 3)
      "explanation": "Penjelasan singkat mengapa jawaban ini benar."
    }
  ]
}
Hanya berikan JSON murni.`;
    }

    const provider = aiConfig?.provider || process.env.AI_PROVIDER?.toLowerCase() || "gemini";
    let responseText = "";

    if (provider === "openai") {
      const apiKey = aiConfig?.apiKey || process.env.OPENAI_API_KEY;
      const baseUrl = (aiConfig?.baseUrl || process.env.OPENAI_BASE_URL || "https://api.openai.com/v1").replace(/\/+$/, "");
      const model = aiConfig?.model || process.env.OPENAI_MODEL || "gpt-4o-mini";

      if (!apiKey) {
        return NextResponse.json(
          { error: "API Key OpenAI belum dikonfigurasi di pengaturan." },
          { status: 400 }
        );
      }

      const res = await fetch(`${baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: "system",
              content: "Anda adalah asisten AI akademik pintar. Hasilkan respons dalam format JSON murni.",
            },
            { role: "user", content: prompt },
          ],
          response_format: { type: "json_object" },
          temperature: 0.4,
        }),
      });

      if (!res.ok) {
        const errBody = await res.text();
        throw new Error(`OpenAI API error (${res.status}): ${errBody}`);
      }

      const data = await res.json();
      responseText = data.choices?.[0]?.message?.content || "";
    } else {
      // Gemini provider
      const apiKey = aiConfig?.apiKey || process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
      if (!apiKey) {
        return NextResponse.json(
          { error: "API Key Gemini belum tersedia di environment atau pengaturan." },
          { status: 400 }
        );
      }

      const ai = new GoogleGenAI({ apiKey });
      const rawModel = aiConfig?.model || process.env.NEXT_PUBLIC_GEMINI_MODEL || "gemini-3.6-flash";
      const modelName = rawModel.startsWith("gemini-2.5") ? "gemini-3.6-flash" : rawModel;

      const response = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.4,
        },
      });

      responseText = response.text || "";
    }

    const cleanedText = responseText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    let parsedData: any = {};
    try {
      parsedData = JSON.parse(cleanedText);
    } catch {
      parsedData = { raw: cleanedText };
    }

    if (action === "breakdown_task") {
      if (Array.isArray(parsedData.todos) && !parsedData.subtasks) {
        parsedData.subtasks = parsedData.todos.map((t: any, idx: number) => ({
          id: `sub-${idx}-${Date.now()}`,
          title: typeof t === "string" ? t : t.title || `Langkah ${idx + 1}`,
          isCompleted: false,
          priority: t.priority || "medium",
          estimatedMinutes: t.estimatedMinutes || 30,
        }));
      }
      if (!parsedData.title && payload.title) {
        parsedData.title = payload.title;
      }
    }

    return NextResponse.json({ success: true, data: parsedData });
  } catch (error: any) {
    console.error("AI tools endpoint error:", error);
    return NextResponse.json(
      { error: error.message || "Gagal memproses permintaan AI" },
      { status: 500 }
    );
  }
}
