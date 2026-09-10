import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { AIConfig } from "@/types";

export async function POST(req: Request) {
  try {
    const { prompt, aspectRatio = "16:9", caption, aiConfig } = (await req.json()) as {
      prompt: string;
      aspectRatio?: "1:1" | "16:9" | "4:3" | "9:16";
      caption?: string;
      aiConfig?: AIConfig | null;
    };

    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
      return NextResponse.json({ error: "Prompt gambar diperlukan." }, { status: 400 });
    }

    const cleanPrompt = prompt.trim();
    let width = 1024;
    let height = 768;

    if (aspectRatio === "1:1") {
      width = 1024;
      height = 1024;
    } else if (aspectRatio === "16:9") {
      width = 1280;
      height = 720;
    } else if (aspectRatio === "4:3") {
      width = 1024;
      height = 768;
    } else if (aspectRatio === "9:16") {
      width = 720;
      height = 1280;
    }

    const provider = aiConfig?.provider || process.env.AI_PROVIDER?.toLowerCase() || "gemini";

    // 1. Try OpenAI DALL-E 3 if user configured OpenAI provider
    if (provider === "openai" && (aiConfig?.apiKey || process.env.OPENAI_API_KEY)) {
      try {
        const baseUrl = aiConfig?.baseUrl || process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";
        const apiKey = aiConfig?.apiKey || process.env.OPENAI_API_KEY;

        const openAiRes = await fetch(`${baseUrl}/images/generations`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: "dall-e-3",
            prompt: cleanPrompt,
            n: 1,
            size: aspectRatio === "1:1" ? "1024x1024" : "1792x1024",
            response_format: "url",
          }),
        });

        if (openAiRes.ok) {
          const data = await openAiRes.json();
          if (data.data && data.data[0]?.url) {
            return NextResponse.json({
              url: data.data[0].url,
              prompt: cleanPrompt,
              caption: caption || cleanPrompt.slice(0, 50),
              aspectRatio,
              provider: "openai-dalle",
            });
          }
        }
      } catch (e) {
        console.warn("DALL-E generation failed, falling back to Pollinations FLUX:", e);
      }
    }

    // 2. Try Google Imagen if user has Gemini Key and requested Imagen
    const geminiKey = provider === "gemini_custom" ? aiConfig?.apiKey : process.env.GEMINI_API_KEY;
    if (geminiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey: geminiKey });
        // @ts-ignore
        if (ai.models && typeof ai.models.generateImages === "function") {
          // @ts-ignore
          const imagenRes = await ai.models.generateImages({
            model: "imagen-3.0-generate-002",
            prompt: cleanPrompt,
            config: {
              numberOfImages: 1,
              aspectRatio: aspectRatio === "16:9" ? "16:9" : aspectRatio === "1:1" ? "1:1" : "4:3",
              outputMimeType: "image/jpeg",
            },
          });

          if (imagenRes?.generatedImages?.[0]?.image?.imageBytes) {
            const base64 = imagenRes.generatedImages[0].image.imageBytes;
            return NextResponse.json({
              url: `data:image/jpeg;base64,${base64}`,
              prompt: cleanPrompt,
              caption: caption || cleanPrompt.slice(0, 50),
              aspectRatio,
              provider: "google-imagen",
            });
          }
        }
      } catch (e) {
        console.warn("Gemini Imagen generation failed or unsupported, using high-res fallback:", e);
      }
    }

    // 3. High-Quality Fallback: Pollinations AI (FLUX model, zero API key requirement, instant)
    // Enhancing educational illustration prompts
    const enhancedPrompt = `${cleanPrompt}, clean high resolution, educational diagram, clear lighting, detailed visual illustration`;
    const seed = Math.floor(Math.random() * 1000000);
    const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(
      enhancedPrompt
    )}?width=${width}&height=${height}&seed=${seed}&model=flux&nologo=true`;

    return NextResponse.json({
      url: pollinationsUrl,
      prompt: cleanPrompt,
      caption: caption || cleanPrompt.slice(0, 50),
      aspectRatio,
      provider: "pollinations-flux",
    });
  } catch (err: any) {
    console.error("Error generating image:", err);
    return NextResponse.json({ error: err.message || "Gagal membuat gambar." }, { status: 500 });
  }
}

