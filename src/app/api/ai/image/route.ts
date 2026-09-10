import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { AIConfig } from "@/types";
import { buildPollinationsImageUrl, ImageStylePreset } from "@/lib/imageUtils";

async function optimizeImagePromptWithGemini(
  rawPrompt: string,
  style?: ImageStylePreset,
  apiKey?: string
): Promise<{ prompt: string; caption?: string }> {
  if (!apiKey) return { prompt: "" };

  try {
    const ai = new GoogleGenAI({ apiKey });
    const model = process.env.NEXT_PUBLIC_GEMINI_MODEL || "gemini-3.5-flash-lite";

    let styleInstruction = "crisp 3D scientific educational infographic, accurate anatomy, clean modern octane render, 8k resolution, studio volumetric lighting, ultra-sharp focus";
    if (style === "photorealistic") {
      styleInstruction = "hyper-realistic National Geographic photography, natural textures, 35mm lens, f/1.8 aperture, cinematic natural lighting, 8k resolution, ultra-detailed";
    } else if (style === "digital_art") {
      styleInstruction = "vibrant modern digital concept art, artistic educational illustration, rich vivid color palette, trending on artstation, masterpiece";
    } else if (style === "isometric") {
      styleInstruction = "futuristic clean 3D isometric render, unreal engine 5 render, raytracing, sleek volumetric ambient occlusion, high precision geometric detail";
    }

    const systemInstruction = `You are a master AI prompt engineer for state-of-the-art text-to-image models (FLUX.1, Midjourney v6, SDXL).
Your task is to transform the user's educational/academic query into an exquisite, highly descriptive, professional prompt in English.
Target visual style: ${styleInstruction}.

Return a JSON object with:
1. "prompt": The final detailed English prompt (40 to 70 words). Specify subject anatomy/components, materials, volumetric lighting, camera perspective, and 8k UHD sharpness.
2. "caption": A concise, informative Indonesian explanation of the visual (10-15 words).

Output ONLY raw valid JSON without markdown fences.`;

    const res = await ai.models.generateContent({
      model,
      contents: [{ role: "user", parts: [{ text: rawPrompt }] }],
      config: {
        systemInstruction,
        temperature: 0.6,
        maxOutputTokens: 250,
      },
    });

    const text = res.text?.trim() || "";
    try {
      const cleanJson = text.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/i, "").trim();
      const parsed = JSON.parse(cleanJson);
      if (parsed.prompt && typeof parsed.prompt === "string") {
        return {
          prompt: parsed.prompt.trim(),
          caption: typeof parsed.caption === "string" ? parsed.caption.trim() : undefined,
        };
      }
    } catch {
      // If raw text returned without JSON
      if (text.length > 20) {
        return { prompt: text };
      }
    }
  } catch (err) {
    console.warn("Gemini prompt optimization failed, falling back to rule-based:", err);
  }

  return { prompt: "" };
}

export async function POST(req: Request) {
  try {
    const { prompt, aspectRatio = "16:9", caption, style = "scientific", aiConfig } = (await req.json()) as {
      prompt: string;
      aspectRatio?: "1:1" | "16:9" | "4:3" | "9:16";
      caption?: string;
      style?: ImageStylePreset;
      aiConfig?: AIConfig | null;
    };

    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
      return NextResponse.json({ error: "Prompt gambar diperlukan." }, { status: 400 });
    }

    const cleanPrompt = prompt.trim();
    const provider = aiConfig?.provider || process.env.AI_PROVIDER?.toLowerCase() || "gemini";
    const geminiKey = provider === "gemini_custom" ? aiConfig?.apiKey : process.env.GEMINI_API_KEY;

    // Synthesize an ultra-high quality, descriptive English prompt using Gemini
    let optimizedPrompt = "";
    let autoCaption = caption;

    if (geminiKey) {
      const optResult = await optimizeImagePromptWithGemini(cleanPrompt, style, geminiKey);
      if (optResult.prompt) {
        optimizedPrompt = optResult.prompt;
      }
      if (!autoCaption && optResult.caption) {
        autoCaption = optResult.caption;
      }
    }

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
            prompt: optimizedPrompt || cleanPrompt,
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
              prompt: optimizedPrompt || cleanPrompt,
              originalPrompt: cleanPrompt,
              caption: autoCaption || cleanPrompt.slice(0, 50),
              aspectRatio,
              provider: "openai-dalle",
            });
          }
        }
      } catch (e) {
        console.warn("DALL-E generation failed, falling back to Pollinations FLUX:", e);
      }
    }

    // 2. High-Quality Generation: Pollinations AI FLUX with Masterpiece Prompt
    const pollinationsUrl = buildPollinationsImageUrl(cleanPrompt, aspectRatio, style, optimizedPrompt);

    return NextResponse.json({
      url: pollinationsUrl,
      prompt: optimizedPrompt || cleanPrompt,
      originalPrompt: cleanPrompt,
      caption: autoCaption || cleanPrompt.slice(0, 50),
      aspectRatio,
      style,
      provider: "pollinations-flux-enhanced",
    });
  } catch (err: any) {
    console.error("Error generating image:", err);
    return NextResponse.json({ error: err.message || "Gagal membuat gambar." }, { status: 500 });
  }
}

