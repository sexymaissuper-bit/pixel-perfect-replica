import logoFiles from "@/data/brand-logos.json";

export type BrandLogo = { name: string; image: string; source: string; background?: string };
const normalized = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();

/** Only verified local logos belonging to brands that actually have products. */
export function selectBrandLogos(catalogBrands: string[]): BrandLogo[] {
  const present = new Set(catalogBrands.filter(Boolean).map(normalized));
  return logoFiles.filter((logo) => present.has(normalized(logo.name)));
}
