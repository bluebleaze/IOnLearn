/**
 * Image generation utilities & prompt enhancement for high-resolution visual output.
 */

/**
 * Enhances a raw user or AI image prompt with rich English descriptive keywords,
 * cinematic lighting, and modern rendering parameters suited for FLUX.1 / SDXL models.
 */
export function enhanceImagePrompt(rawPrompt: string): string {
  if (!rawPrompt || typeof rawPrompt !== "string") return "";

  let prompt = rawPrompt.trim();

  // Remove common conversational prefixes in Indonesian or English
  prompt = prompt
    .replace(
      /^(tolong\s+)?(buatkan\s+|bikin\s+)?(gambar(kan)?|ilustrasi(kan)?|diagram|foto|lukis(kan)?|visualisasikan|generate image)\s*(tentang|mengenai|dari|untuk|proses|tahapan)?\s*/i,
      ""
    )
    .replace(/^(proses|tahapan|skema|bagan)\s+(tentang|dari)?\s*/i, "")
    .trim();

  // Indonesian to English dictionary for common academic, scientific, and cultural concepts
  const conceptTranslations: [RegExp, string][] = [
    [/\bfotosintesis\b/gi, "photosynthesis process in a green plant leaf cell, chloroplasts and sunlight"],
    [/\bsel hewan\b/gi, "animal cell structure with labeled nucleus, mitochondria, cytoplasm, organelles"],
    [/\bsel tumbuhan\b/gi, "plant cell anatomy with cell wall, chloroplast, large vacuole"],
    [/\bjantung manusia\b|\bjantung\b/gi, "human heart anatomical structure, ventricles, atria, aorta, blood circulation"],
    [/\botak manusia\b|\botak\b/gi, "human brain anatomy, neural networks, cerebral cortex, glowing synapses"],
    [/\btata surya\b/gi, "solar system with sun and planets in orbital planes, cosmic space backdrop"],
    [/\bgempa bumi\b/gi, "earthquake tectonic plates shifting along fault line, seismic shockwaves"],
    [/\bgunung berapi\b|\bgunung meletus\b/gi, "volcano eruption cross-section, magma chamber, lava flow, ash plume"],
    [/\bsiklus air\b/gi, "water cycle diagram showing evaporation, condensation, precipitation, clouds, rivers"],
    [/\bekosistem\b/gi, "natural balanced ecosystem, diverse flora and fauna, lush environmental food web"],
    [/\brantai makanan\b/gi, "ecological food chain diagram from producers to apex predators"],
    [/\batom\b|\bmolekul\b/gi, "atomic structure with nucleus, protons, neutrons, and orbiting electron cloud"],
    [/\bdna\b/gi, "DNA double helix molecular structure, genetic code, glowing chemical bonds"],
    [/\brevolusi industri 4\.0\b|\brevolusi industri\b/gi, "industrial revolution technology progression, cyber-physical systems, smart automation, robotics"],
    [/\bkecerdasan buatan\b|\bai\b/gi, "artificial intelligence glowing neural network, cybernetic core, futuristic computing"],
    [/\bjaringan komputer\b/gi, "computer network architecture, servers, routers, data transmission streams"],
    [/\bsistem pernapasan\b/gi, "human respiratory system anatomy, trachea, lungs, alveoli gas exchange"],
    [/\bsistem pencernaan\b/gi, "human digestive system anatomy from esophagus to stomach and intestines"],
  ];

  for (const [regex, translation] of conceptTranslations) {
    prompt = prompt.replace(regex, translation);
  }

  // Detect style intent
  const isInfographic = /diagram|infografis|bagan|skema|anatomi|struktur|proses|siklus|chart|anatomy/i.test(rawPrompt);
  const isTech = /koding|programming|jaringan|komputer|robot|cyber|ai|server|algoritma|digital|automation/i.test(rawPrompt);
  const isHistorical = /sejarah|zaman|perang|kuno|abad|revolusi|tradisional|budaya/i.test(rawPrompt);

  let styleModifier = "highly detailed, professional studio volumetric lighting, 8k resolution, sharp focus, masterpiece composition, clean elegant colors";

  if (isInfographic) {
    styleModifier = "crisp 3D scientific educational infographic, clear visual hierarchy, vibrant studio lighting, octane render, 8k UHD, clean modern scientific illustration style";
  } else if (isTech) {
    styleModifier = "futuristic clean 3D isometric render, glowing volumetric neon lighting, raytracing, unreal engine 5 render, 8k resolution, sleek industrial aesthetic";
  } else if (isHistorical) {
    styleModifier = "cinematic atmospheric historical lighting, photorealistic textures, dynamic cinematic wide angle, National Geographic photography style, 8k resolution";
  }

  // Avoid duplicate quality tokens if already present
  if (!prompt.toLowerCase().includes("8k") && !prompt.toLowerCase().includes("octane render") && !prompt.toLowerCase().includes("photorealistic")) {
    prompt = `${prompt}, ${styleModifier}`;
  }

  return prompt;
}

/**
 * Builds an ultra-high quality Pollinations FLUX image URL with enhancement parameters.
 */
export function buildPollinationsImageUrl(
  prompt: string,
  aspectRatio: "16:9" | "1:1" | "4:3" | "9:16" = "16:9"
): string {
  const enhanced = enhanceImagePrompt(prompt);
  let width = 1280;
  let height = 720;

  if (aspectRatio === "1:1") {
    width = 1024;
    height = 1024;
  } else if (aspectRatio === "4:3") {
    width = 1024;
    height = 768;
  } else if (aspectRatio === "9:16") {
    width = 720;
    height = 1280;
  }

  const seed = Math.floor(Math.random() * 1000000);
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(
    enhanced
  )}?width=${width}&height=${height}&seed=${seed}&model=flux&enhance=true&nologo=true`;
}
