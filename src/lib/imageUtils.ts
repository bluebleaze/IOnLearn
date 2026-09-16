import { GoogleGenAI } from "@google/genai";

export type ImageStylePreset = "scientific" | "photorealistic" | "digital_art" | "isometric";

/**
 * Attempts to generate a high-fidelity image directly using Google GenAI models:
 * 1. gemini-3.1-flash-image (flagship multimodal image generator)
 * 2. imagen-4.0-generate-001 (Imagen 4 GA)
 * 3. imagen-4.0-fast-generate-001 (Imagen 4 Fast)
 * 4. gemini-2.5-flash-image (legacy fallback)
 * Returns a base64 data URL on success, or null on failure (fallback to Pollinations).
 */
export async function generateGoogleImagenImage(
  apiKey: string,
  prompt: string,
  aspectRatio: "16:9" | "1:1" | "4:3" | "9:16" = "16:9"
): Promise<string | null> {
  if (!apiKey || !prompt || typeof prompt !== "string") return null;

  try {
    const ai = new GoogleGenAI({ apiKey });
    // Sanitize prompt for image models: remove abstract "flowchart/table diagram" phrasing that confuses diffusion models
    const cleanPrompt = prompt
      .replace(/\b(detailed\s+scientific\s+)?flowchart\s+diagram\s+(illustrating\s+)?/gi, "clear educational illustration of ")
      .replace(/\bflowchart\b/gi, "educational visual scene")
      .replace(/\b(table|spreadsheet|chart|data table)\s+diagram\b/gi, "futuristic 3D data analytics visualization, glowing charts")
      .trim();

    const formattedRatio: "1:1" | "4:3" | "9:16" | "16:9" =
      aspectRatio === "1:1" ? "1:1" : aspectRatio === "4:3" ? "4:3" : aspectRatio === "9:16" ? "9:16" : "16:9";

    // 1. Try gemini-3.1-flash-image (Flagship multimodal image model)
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-image",
        contents: cleanPrompt,
        config: {
          responseModalities: ["IMAGE"],
          imageConfig: {
            aspectRatio: formattedRatio,
          },
        },
      });

      const parts = response.candidates?.[0]?.content?.parts;
      if (parts && Array.isArray(parts)) {
        for (const part of parts) {
          if (part.inlineData?.data) {
            const mime = part.inlineData.mimeType || "image/jpeg";
            return `data:${mime};base64,${part.inlineData.data}`;
          }
        }
      }
    } catch (g3Err: any) {
      console.warn("gemini-3.1-flash-image attempt failed, trying imagen-4.0:", g3Err?.message || g3Err);
    }

    // 2. Try imagen-4.0-generate-001 (Imagen 4 GA)
    try {
      const response = await ai.models.generateImages({
        model: "imagen-4.0-generate-001",
        prompt: cleanPrompt,
        config: {
          numberOfImages: 1,
          outputMimeType: "image/jpeg",
          aspectRatio: formattedRatio,
        },
      });

      if (response.generatedImages && response.generatedImages.length > 0) {
        const bytes = response.generatedImages[0].image?.imageBytes;
        if (bytes) {
          return `data:image/jpeg;base64,${bytes}`;
        }
      }
    } catch (img4Err: any) {
      console.warn("imagen-4.0-generate-001 attempt failed, trying imagen-4.0-fast:", img4Err?.message || img4Err);
    }

    // 3. Try imagen-4.0-fast-generate-001
    try {
      const response = await ai.models.generateImages({
        model: "imagen-4.0-fast-generate-001",
        prompt: cleanPrompt,
        config: {
          numberOfImages: 1,
          outputMimeType: "image/jpeg",
          aspectRatio: formattedRatio,
        },
      });

      if (response.generatedImages && response.generatedImages.length > 0) {
        const bytes = response.generatedImages[0].image?.imageBytes;
        if (bytes) {
          return `data:image/jpeg;base64,${bytes}`;
        }
      }
    } catch (fastErr: any) {
      console.warn("imagen-4.0-fast-generate-001 attempt failed, trying gemini-2.5-flash-image:", fastErr?.message || fastErr);
    }

    // 4. Try gemini-2.5-flash-image
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-image",
        contents: cleanPrompt,
        config: {
          responseModalities: ["IMAGE"],
          imageConfig: {
            aspectRatio: formattedRatio,
          },
        },
      });

      const parts = response.candidates?.[0]?.content?.parts;
      if (parts && Array.isArray(parts)) {
        for (const part of parts) {
          if (part.inlineData?.data) {
            const mime = part.inlineData.mimeType || "image/jpeg";
            return `data:${mime};base64,${part.inlineData.data}`;
          }
        }
      }
    } catch (legacyErr: any) {
      console.warn("gemini-2.5-flash-image attempt failed:", legacyErr?.message || legacyErr);
    }
  } catch (err: any) {
    console.warn("Google visual generation failed (will use fallback):", err?.message || err);
  }

  return null;
}

/**
 * Enhances a raw user or AI image prompt with rich English descriptive keywords,
 * removes abstract diagram/flowchart traps that cause hallucinations, and injects
 * cinematic lighting and modern rendering parameters suited for FLUX.1 / SDXL models.
 */
export function enhanceImagePrompt(
  rawPrompt: string,
  stylePreset?: ImageStylePreset
): string {
  if (!rawPrompt || typeof rawPrompt !== "string") return "";

  let prompt = rawPrompt.trim();

  // Remove common conversational prefixes in Indonesian or English
  prompt = prompt
    .replace(
      /^(tolong\s+)?(buatkan\s+|bikin\s+|jadikan\s+)?(jadi\s+)?(gambar(kan)?|ilustrasi(kan)?|diagram|foto|lukis(kan)?|visualisasikan|generate image)?\s*(tentang|mengenai|dari|untuk|proses|tahapan|alur(nya)?|bagan|skema|jelasin\s+alur(nya)?|tunjukkan\s+alur(nya)?)?\s*/i,
      ""
    )
    .replace(/^(proses|tahapan|skema|bagan|alur|diagram\s+alur|flowchart)\s+(tentang|dari|alur(nya)?)?\s*/i, "")
    .trim();

  // Clean out abstract flowchart/diagram requests that cause diffusion models to hallucinate blue flares/smudges
  prompt = prompt
    .replace(/\b(jelasin\s+alur(nya)?|alur\s+proses|bagan\s+alur|diagram\s+alur|flowchart|peta\s+konsep|mind\s+map)\b/gi, "educational visual concept")
    .trim();

  // Comprehensive Indonesian to English dictionary for academic, scientific, biological, health, and physical concepts
  const conceptTranslations: [RegExp, string][] = [
    [/\b(kesehatan\s+reproduksi|reproduksi\s+remaja)\b/gi, "adolescent health education in modern school clinic, human biology educational model, professional medical atmosphere"],
    [/\b(femboy|identitas\s+gender|ekspresi\s+gender)\b/gi, "youth health counseling consultation, empathetic supportive discussion with high school counselor, warm clinical setting"],
    [/\b(konseling|bimbingan\s+konseling|bk|psikososial|stres\s+minoritas)\b/gi, "school guidance counselor talking empathetically with teenage student in bright modern clinic office"],
    [/\b(smk\s+telkom|smk|sekolah)\b/gi, "modern technology high school campus setting"],
    [/\bfotosintesis\b/gi, "photosynthesis process in green plant leaf cross-section, showing chloroplasts, sunlight rays, water and carbon dioxide inputs"],
    [/\bsel hewan\b/gi, "animal cell anatomical cross-section with labeled nucleus, mitochondria, endoplasmic reticulum, golgi apparatus, cytoplasm"],
    [/\bsel tumbuhan\b/gi, "plant cell cross-section anatomy with rigid cell wall, chloroplasts, large central vacuole, nucleus"],
    [/\bsel darah merah\b|\beritrosit\b/gi, "erythrocyte red blood cells flowing through vascular micro-capillary, biconcave disc shape, macro photography"],
    [/\bsel darah putih\b|\bleukosit\b/gi, "white blood cell leukocyte engulfing pathogen, immune defense microscopic view"],
    [/\bmitosis\b|\bpembelahan sel\b/gi, "mitosis cellular division stages, chromosome separation during metaphase and anaphase, glowing spindle fibers"],
    [/\bsiklus krebs\b/gi, "Krebs citric acid cycle metabolic biochemistry diagram, mitochondrial cellular respiration pathway"],
    [/\bjantung manusia\b|\bjantung\b/gi, "human heart anatomical structure, superior vena cava, ventricles, atria, aorta, blood circulation system"],
    [/\botak manusia\b|\botak\b/gi, "human brain anatomical structure, neural networks, cerebral cortex, hippocampus, glowing synaptic transmission"],
    [/\bneuron\b|\bsel saraf\b/gi, "biological neuron structure, axon, dendrites, myelin sheath, glowing synaptic terminal neurotransmitters"],
    [/\btata surya\b/gi, "solar system with sun, planets in precise orbital planes, asteroid belt, realistic cosmic space backdrop"],
    [/\bgerhana matahari\b/gi, "solar eclipse showing moon passing between sun and earth, glowing diamond ring corona effect"],
    [/\bgerhana bulan\b/gi, "lunar eclipse showing blood moon in earth's umbra shadow, stars in cosmic background"],
    [/\bgempa bumi\b/gi, "earthquake tectonic plates shifting along geological fault line, seismic shockwaves radiating through earth strata"],
    [/\bgunung berapi\b|\bgunung meletus\b/gi, "volcano eruption anatomical cross-section, magma chamber, conduit, lava flow, ash plume"],
    [/\bsiklus air\b|\bsiklus hidrologi\b/gi, "hydrological water cycle diagram showing evaporation, condensation, precipitation, transpiration, rivers"],
    [/\bekosistem\b/gi, "natural balanced ecosystem biodiversity, forest canopy, pristine river, rich flora and fauna food web"],
    [/\brantai makanan\b|\bjaring-jaring makanan\b/gi, "ecological trophic food chain diagram from primary producers, herbivores to apex predators"],
    [/\batom\b|\bmolekul\b/gi, "atomic structure with central proton-neutron nucleus, quantum electron orbital cloud"],
    [/\btabel periodik\b/gi, "modern 3D periodic table of elements with glowing element cards, atomic numbers, electron shells"],
    [/\bdna\b|\brna\b/gi, "DNA double helix molecular structure, nitrogenous base pairs, glowing chemical bonds, genetic code"],
    [/\bmedan magnet\b|\belektromagnetik\b/gi, "magnetic field flux lines radiating from north to south poles of magnet, iron filings pattern"],
    [/\bpembiasan cahaya\b|\bprisma\b/gi, "light refraction and dispersion through transparent triangular glass prism, splitting into rainbow spectrum"],
    [/\bhukum newton\b|\bgravitasi\b/gi, "Newton classical physics mechanics, gravity force vectors, falling apple, motion physics"],
    [/\blapisan bumi\b|\bstruktur bumi\b/gi, "planet Earth geological cutaway cross-section showing crust, mantle, liquid outer core, solid inner core"],
    [/\blempeng tektonik\b/gi, "tectonic plates geological boundary, subduction zone, continental drift, oceanic crust collision"],
    [/\bmetamorfosis\b/gi, "complete butterfly metamorphosis life cycle stages: egg, caterpillar larva, chrysalis pupa, adult butterfly"],
    [/\bginjal\b|\bsistem ekskresi\b/gi, "human kidney anatomical cross-section, renal cortex, medulla, nephron filtration tubules"],
    [/\bmata manusia\b/gi, "human eye anatomy cross-section, cornea, iris, pupil, crystalline lens, retina, optic nerve"],
    [/\btelinga manusia\b/gi, "human ear anatomy showing outer ear, auditory canal, eardrum tympanic membrane, cochlea"],
    [/\bsistem pernapasan\b/gi, "human respiratory system anatomy, trachea, bronchial branches, lungs, microscopic alveoli gas exchange"],
    [/\bsistem pencernaan\b/gi, "human digestive system anatomy from esophagus, stomach, liver, pancreas, small and large intestines"],
    [/\brevolusi industri 4\.0\b|\brevolusi industri\b/gi, "industrial technology evolution, cyber-physical systems, smart automation, collaborative robotics"],
    [/\bkecerdasan buatan\b|\bai\b|\bdeep learning\b/gi, "artificial intelligence deep neural network nodes, cybernetic core, glowing data streams, futuristic computing"],
    [/\bjaringan komputer\b|\barkitektur jaringan\b/gi, "computer network architecture topology, cloud servers, routers, data transmission packets"],
    [/\barsitektur komputer\b|\bcpu\b/gi, "von Neumann computer architecture diagram, CPU, ALU, registers, memory bus, control unit"],
    [/\b(tabel\s+data|tabel\s+statistik|data\s+tabel|tabel|diagram\s+tabel)\b/gi, "futuristic 3D holographic data analytics visualization floating in space, glowing neon bar graphs, charts, clean glowing metrics, high tech educational laboratory"],
  ];

  for (const [regex, translation] of conceptTranslations) {
    prompt = prompt.replace(regex, translation);
  }

  // Determine style modifier
  let styleModifier = "crisp 3D scientific educational infographic, clear visual hierarchy, vibrant studio lighting, octane render, 8k UHD, clean modern scientific illustration style, ultra-sharp focus";

  if (stylePreset === "photorealistic") {
    styleModifier = "hyper-realistic National Geographic photography, award-winning cinematography, ultra-high resolution 8k, natural textures, 35mm lens, f/1.8 aperture, dramatic volumetric lighting, masterpiece";
  } else if (stylePreset === "digital_art") {
    styleModifier = "vibrant modern digital painting, artistic educational concept art, rich vivid color grading, smooth lighting, trending on artstation, masterpiece";
  } else if (stylePreset === "isometric") {
    styleModifier = "futuristic clean 3D isometric render, unreal engine 5 render, raytracing, sleek volumetric ambient occlusion, sleek high-tech aesthetic, 8k resolution";
  } else if (!stylePreset) {
    const isPhoto = /foto|kamera|realistis|asli|nyata|landscape|pemandangan|konseling|dokter|klinik/i.test(rawPrompt);
    const isTech = /koding|programming|jaringan|komputer|robot|cyber|ai|server|algoritma|digital|automation/i.test(rawPrompt);
    const isArt = /lukisan|kartun|anime|vektor|seni|gambar tangan/i.test(rawPrompt);

    if (isPhoto) {
      styleModifier = "hyper-realistic National Geographic photography, 8k UHD, natural textures, 35mm lens, cinematic natural lighting, masterpiece";
    } else if (isTech) {
      styleModifier = "futuristic clean 3D isometric render, glowing volumetric neon lighting, raytracing, unreal engine 5 render, 8k resolution, sleek industrial aesthetic";
    } else if (isArt) {
      styleModifier = "vibrant digital concept art, smooth painterly aesthetic, vivid colors, masterpiece composition";
    }
  }

  // Avoid duplicate quality tokens if already present
  if (!prompt.toLowerCase().includes("8k") && !prompt.toLowerCase().includes("octane render") && !prompt.toLowerCase().includes("photorealistic")) {
    prompt = `${prompt}, ${styleModifier}`;
  }

  return prompt;
}

/**
 * Builds a reliable, high quality Pollinations image URL.
 * Automatically strips abstract flowchart/text-heavy phrases to prevent diffusion model hallucinations.
 */
export function buildPollinationsImageUrl(
  prompt: string,
  aspectRatio: "16:9" | "1:1" | "4:3" | "9:16" = "16:9",
  stylePreset?: ImageStylePreset,
  preOptimizedPrompt?: string
): string {
  let finalPrompt = preOptimizedPrompt && preOptimizedPrompt.trim().length > 10
    ? preOptimizedPrompt.trim()
    : enhanceImagePrompt(prompt, stylePreset);

  // Anti-hallucination filter: sanitize abstract flowchart/diagram phrases that cause Sana/FLUX to produce flares or abstract smudges
  finalPrompt = finalPrompt
    .replace(/\b(detailed\s+scientific\s+)?flowchart\s+diagram\s+(illustrating\s+)?/gi, "educational visual concept of ")
    .replace(/\bflowchart\b/gi, "educational visual scene")
    .replace(/\b(psychological\s+and\s+physiological\s+path\s+from\s+femboy\s+gender\s+expression\s+to\s+reproductive\s+health\s+in\s+adolescents)\b/gi, "adolescent health counseling session in a school clinic, counselor speaking with a student, medical posters, realistic photography")
    .replace(/\b(mind\s+map|concept\s+map|schema\s+diagram)\b/gi, "educational illustration")
    .replace(/\b(table|spreadsheet|data table|statistical table)\s+(diagram|drawing|image)?\b/gi, "futuristic 3D data analytics visualization with glowing holographic graphs")
    .trim();

  // Safe dimensions that don't trigger OOM or rate limits
  let width = 1024;
  let height = 576;

  if (aspectRatio === "1:1") {
    width = 768;
    height = 768;
  } else if (aspectRatio === "4:3") {
    width = 1024;
    height = 768;
  } else if (aspectRatio === "9:16") {
    width = 576;
    height = 1024;
  }

  const seed = Math.floor(Math.random() * 1000000);

  // Use model=turbo and nologo=1 for fast, reliable delivery without 0-byte connection drops
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(
    finalPrompt
  )}?width=${width}&height=${height}&seed=${seed}&model=turbo&nologo=1`;
}
