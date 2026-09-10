/**
 * Math utility to convert raw LaTeX math expressions and symbols into clean,
 * readable Unicode mathematical notation across Web UI, Word (.docx), PDF, and Slides.
 */

// Helper to extract balanced curly-brace group starting at startIndex
function extractBracedGroup(str: string, startIndex: number): { content: string; endIndex: number } | null {
  let i = startIndex;
  while (i < str.length && /\s/.test(str[i])) i++;
  if (i >= str.length || str[i] !== "{") return null;

  let depth = 0;
  const start = i + 1;
  for (let j = i; j < str.length; j++) {
    if (str[j] === "{") depth++;
    else if (str[j] === "}") {
      depth--;
      if (depth === 0) {
        return { content: str.slice(start, j), endIndex: j + 1 };
      }
    }
  }
  return null;
}

export function cleanLatexMath(raw: string): string {
  if (!raw) return "";

  // 0. Protect code blocks from math replacements
  const codeBlocks: string[] = [];
  let text = raw.replace(/(```[\s\S]*?```|`[^`\n]+`)/g, (match) => {
    codeBlocks.push(match);
    return `\uFFF0CB${codeBlocks.length - 1}\uFFF1`;
  });

  // 1. Fractions: \frac{...}{...} and \cfrac{...}{...} handling nested braces iteratively
  let fracRegex = /\\(?:c)?frac/g;
  let match: RegExpExecArray | null;
  while ((match = fracRegex.exec(text)) !== null) {
    const fracStart = match.index;
    const arg1 = extractBracedGroup(text, fracStart + match[0].length);
    if (!arg1) {
      fracRegex.lastIndex = fracStart + match[0].length;
      continue;
    }
    const arg2 = extractBracedGroup(text, arg1.endIndex);
    if (!arg2) {
      fracRegex.lastIndex = arg1.endIndex;
      continue;
    }
    const cleanArg1 = cleanLatexMath(arg1.content.trim());
    const cleanArg2 = cleanLatexMath(arg2.content.trim());
    const replacement = `(${cleanArg1} / ${cleanArg2})`;
    text = text.slice(0, fracStart) + replacement + text.slice(arg2.endIndex);
    fracRegex = /\\(?:c)?frac/g;
    fracRegex.lastIndex = fracStart + replacement.length;
  }

  // 2. Square roots: \sqrt[n]{x} -> n√(x) or \sqrt{x} -> √(x)
  let sqrtRegex = /\\sqrt(?:\[([^\]]+)\])?/g;
  let sqrtMatch: RegExpExecArray | null;
  while ((sqrtMatch = sqrtRegex.exec(text)) !== null) {
    const sqrtStart = sqrtMatch.index;
    const rootIndex = sqrtMatch[1];
    const arg = extractBracedGroup(text, sqrtStart + sqrtMatch[0].length);
    if (!arg) {
      sqrtRegex.lastIndex = sqrtStart + sqrtMatch[0].length;
      continue;
    }
    const cleanArg = cleanLatexMath(arg.content.trim());
    const replacement = rootIndex ? `${rootIndex}√(${cleanArg})` : `√(${cleanArg})`;
    text = text.slice(0, sqrtStart) + replacement + text.slice(arg.endIndex);
    sqrtRegex = /\\sqrt(?:\[([^\]]+)\])?/g;
    sqrtRegex.lastIndex = sqrtStart + replacement.length;
  }
  text = text.replace(/\\sqrt\b/g, "√");

  // 3. Summations, products, integrals
  text = text.replace(
    /\\sum(?:_?\{([^}]+)\}|_([a-zA-Z0-9]))?(?:\^\{([^}]+)\}|\^([a-zA-Z0-9]))?/g,
    (_m, p1, p2, p3, p4) => {
      const lower = (p1 || p2 || "").trim();
      const upper = (p3 || p4 || "").trim();
      if (lower && upper) return `Σ(${lower}..${upper})`;
      if (lower) return `Σ(${lower})`;
      if (upper) return `Σ(..${upper})`;
      return "Σ";
    }
  );
  text = text.replace(/\\sum\b/g, "Σ");

  text = text.replace(
    /\\prod(?:_?\{([^}]+)\}|_([a-zA-Z0-9]))?(?:\^\{([^}]+)\}|\^([a-zA-Z0-9]))?/g,
    (_m, p1, p2, p3, p4) => {
      const lower = (p1 || p2 || "").trim();
      const upper = (p3 || p4 || "").trim();
      if (lower && upper) return `Π(${lower}..${upper})`;
      if (lower) return `Π(${lower})`;
      if (upper) return `Π(..${upper})`;
      return "Π";
    }
  );
  text = text.replace(/\\prod\b/g, "Π");
  text = text.replace(/\\int\b/g, "∫");
  text = text.replace(/\\infty\b/g, "∞");

  // 4. Overlines, bars, hats, vectors: \bar{x} -> x̄, \bar{y} -> ȳ
  text = text.replace(/\\bar\{([a-zA-Z])\}/g, "$1̄");
  text = text.replace(/\\bar\s+([a-zA-Z])/g, "$1̄");
  text = text.replace(/\\overline\{([^{}]+)\}/g, "$1̄");
  text = text.replace(/\\hat\{([a-zA-Z])\}/g, "$1̂");
  text = text.replace(/\\vec\{([a-zA-Z])\}/g, "$1⃗");
  text = text.replace(/\\dot\{([a-zA-Z])\}/g, "$1̇");
  text = text.replace(/\\ddot\{([a-zA-Z])\}/g, "$1̈");

  // 5. Greek letters
  const greekMap: Record<string, string> = {
    alpha: "α", beta: "β", gamma: "γ", Gamma: "Γ",
    delta: "δ", Delta: "Δ", epsilon: "ε", varepsilon: "ε",
    zeta: "ζ", eta: "η", theta: "θ", Theta: "Θ",
    iota: "ι", kappa: "κ", lambda: "λ", Lambda: "Λ",
    mu: "μ", nu: "ν", xi: "ξ", Xi: "Ξ",
    pi: "π", Pi: "Π", rho: "ρ", sigma: "σ",
    Sigma: "Σ", tau: "τ", upsilon: "υ", phi: "φ",
    Phi: "Φ", chi: "χ", psi: "ψ", Psi: "Ψ",
    omega: "ω", Omega: "Ω"
  };
  text = text.replace(/\\([a-zA-Z]+)\b/g, (match, word) => greekMap[word] || match);

  // 6. Common operators and symbols
  const symMap: Record<string, string> = {
    times: "×", cdot: "·", div: "÷", pm: "±", mp: "∓",
    approx: "≈", neq: "≠", ne: "≠", leq: "≤", le: "≤",
    geq: "≥", ge: "≥", equiv: "≡", sim: "~",
    leftarrow: "←", to: "→", rightarrow: "→", Leftarrow: "⇐",
    Rightarrow: "⇒", leftrightarrow: "↔", Leftrightarrow: "⇔",
    in: "∈", notin: "∉", subset: "⊂", subseteq: "⊆",
    cup: "∪", cap: "∩", forall: "∀", exists: "∃",
    partial: "∂", nabla: "∇", degree: "°", circ: "°"
  };
  text = text.replace(/\\([a-zA-Z]+)\b/g, (match, word) => symMap[word] || match);

  // 7. Subscripts and superscripts
  const subMap: Record<string, string> = {
    "0": "₀", "1": "₁", "2": "₂", "3": "₃", "4": "₄",
    "5": "₅", "6": "₆", "7": "₇", "8": "₈", "9": "₉",
    "+": "₊", "-": "₋", "=": "₌", "(": "₍", ")": "₎",
    "a": "ₐ", "e": "ₑ", "h": "ₕ", "i": "ᵢ", "j": "ⱼ",
    "k": "ₖ", "l": "ₗ", "m": "ₘ", "n": "ₙ", "o": "ₒ",
    "p": "ₚ", "r": "ᵣ", "s": "ₛ", "t": "ₜ", "u": "ᵤ",
    "v": "ᵥ", "x": "ₓ"
  };
  const supMap: Record<string, string> = {
    "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴",
    "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹",
    "+": "⁺", "-": "⁻", "=": "⁼", "(": "⁽", ")": "⁾",
    "n": "ⁿ", "i": "ⁱ"
  };

  text = text.replace(/_\{([^}]+)\}/g, (_m, chars) => {
    return chars.split("").map((c: string) => subMap[c] || c).join("");
  });
  text = text.replace(/_([0-9a-zA-Z])/g, (_m, c) => subMap[c] || `_${c}`);

  text = text.replace(/\^\{([^}]+)\}/g, (_m, chars) => {
    return chars.split("").map((c: string) => supMap[c] || c).join("");
  });
  text = text.replace(/\^([0-9a-zA-Z])/g, (_m, c) => supMap[c] || `^${c}`);

  // Common stats variable notation: xi -> xᵢ, yi -> yᵢ, zi -> zᵢ
  text = text.replace(/\bxi\b/g, "xᵢ");
  text = text.replace(/\byi\b/g, "yᵢ");
  text = text.replace(/\bzi\b/g, "zᵢ");

  // 8. Remove formatting wrappers like \text{...}, \mathrm{...}
  text = text.replace(/\\(?:text|mathrm|mathbf|mathit)\{([^}]+)\}/g, "$1");
  text = text.replace(/\\(?:left|right)\b/g, "");
  text = text.replace(/\\(?:quad|qquad|,|;|:)/g, " ");

  // 9. Clean math delimiters: $...$ and $$...$$
  text = text.replace(/\${1,3}([^\$]+)\${1,3}/g, "$1");
  text = text.replace(/\$+/g, "");

  // 10. Clean unescaped curly braces left from LaTeX
  text = text.replace(/\{([^{}]+)\}/g, "$1");

  // 11. Restore protected code blocks
  text = text.replace(/\uFFF0CB(\d+)\uFFF1/g, (_m, idx) => codeBlocks[Number(idx)] || "");

  return text.trim();
}

