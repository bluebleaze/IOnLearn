export type ImageStylePreset = "scientific" | "photorealistic" | "digital_art" | "isometric";

/**
 * Enhances a raw user or AI image prompt with rich English descriptive keywords,
 * cinematic lighting, and modern rendering parameters suited for FLUX.1 / SDXL models.
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
      /^(tolong\s+)?(buatkan\s+|bikin\s+)?(gambar(kan)?|ilustrasi(kan)?|diagram|foto|lukis(kan)?|visualisasikan|generate image)\s*(tentang|mengenai|dari|untuk|proses|tahapan)?\s*/i,
      ""
    )
    .replace(/^(proses|tahapan|skema|bagan)\s+(tentang|dari)?\s*/i, "")
    .trim();

  // Comprehensive Indonesian to English dictionary for academic, scientific, biological, and physical concepts
  const conceptTranslations: [RegExp, string][] = [
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
    const isPhoto = /foto|kamera|realistis|asli|nyata|landscape|pemandangan/i.test(rawPrompt);
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
 * Builds an ultra-high quality Pollinations FLUX image URL.
 * Uses exact model parameters without 'enhance=true' to prevent external hallucinated prompt mangling.
 */
export function buildPollinationsImageUrl(
  prompt: string,
  aspectRatio: "16:9" | "1:1" | "4:3" | "9:16" = "16:9",
  stylePreset?: ImageStylePreset,
  preOptimizedPrompt?: string
): string {
  const finalPrompt = preOptimizedPrompt && preOptimizedPrompt.trim().length > 10
    ? preOptimizedPrompt.trim()
    : enhanceImagePrompt(prompt, stylePreset);

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
    finalPrompt
  )}?width=${width}&height=${height}&seed=${seed}&model=flux&nologo=true`;
}
