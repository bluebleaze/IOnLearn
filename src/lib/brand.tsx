
export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "IOnLearn";
export const APP_TAGLINE = process.env.NEXT_PUBLIC_APP_TAGLINE || "Produktivitas Akademik & Asisten Belajar";
export const APP_DESCRIPTION = process.env.NEXT_PUBLIC_APP_DESCRIPTION || "Platform produktivitas akademik terhubung Google Classroom dengan kurasi materi dan tutor AI";

/**
 * Helper to render the brand name with stylized accents.
 */
export function BrandText({ name = APP_NAME, className = "" }: { name?: string; className?: string }) {
  if (name === "IOnLearn") {
    return (
      <span className={className}>
        I<span className="text-[#818cf8]">On</span>Learn
      </span>
    );
  }
  if (name === "Ubur Ubur") {
    return (
      <span className={className}>
        Ubur <span className="text-[#818cf8]">Ubur</span>
      </span>
    );
  }
  if (name.length > 2 && name.endsWith("AI")) {
    const base = name.slice(0, -2);
    return (
      <span className={className}>
        {base}<span className="text-[#818cf8]">AI</span>
      </span>
    );
  }
  return <span className={className}>{name}</span>;
}
