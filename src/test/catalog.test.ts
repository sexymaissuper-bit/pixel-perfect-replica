import { describe, expect, it } from "vitest";
import { getAllProducts, getVariant, normalize, queryProducts } from "@/lib/catalog";
import { departments } from "@/data/departments";

describe("catálogo", () => {
  it("normaliza acentos e maiúsculas", () => {
    expect(normalize("RAÇÃO Pássaros")).toBe("racao passaros");
  });
  it("encontra os produtos importados por nome e preserva variantes no carrinho", () => {
    expect(getAllProducts()).toHaveLength(895);
    expect(getAllProducts().some((p) => p.slug === "biodex-com-20-comprimidos")).toBe(false);
    const results = queryProducts({ q: "churu atum" });
    expect(results.total).toBeGreaterThan(0);
    const item = results.items[0]!;
    expect(getVariant(item.variants[0]!.id)?.product.id).toBe(item.id);
  });
  it("não publica rastreadores, links antigos, avaliações ou preços promocionais herdados", () => {
    const products = getAllProducts();
    expect(products.length).toBeGreaterThan(0);
    expect(
      /\b(?:supers?\s*petz|petlove|petdog|cobasi|amazon)\b|utm_|__l5e|data:image|https?:\/\//i.test(
        JSON.stringify(products),
      ),
    ).toBe(false);
    for (const p of products) {
      expect(p.image).toMatch(/^\/produtos\//);
      expect(p.demo).not.toBe(true);
      expect(p.variants.length).toBeGreaterThan(0);
      expect(
        departments
          .find((d) => d.slug === p.department)
          ?.categories.some((c) => c.slug === p.category),
      ).toBe(true);
      for (const v of p.variants) {
        expect(v.id.length).toBeLessThanOrEqual(64);
        expect(v.price).toBeGreaterThan(0);
        expect(v.salePrice).toBeUndefined();
      }
    }
  });
  it("não duplica produtos ou variantes e permite filtrar higiene sem tirar produtos do seu pet", () => {
    const products = getAllProducts();
    expect(new Set(products.map((p) => p.slug)).size).toBe(products.length);
    const ids = products.flatMap((p) => p.variants.map((v) => v.id));
    expect(new Set(ids).size).toBe(ids.length);
    expect(queryProducts({ department: "higiene-beleza" }).total).toBeGreaterThan(0);
  });
  it("retorna zero resultados para uma busca inexistente", () => {
    expect(queryProducts({ q: "produto-inexistente-xyz-987" }).total).toBe(0);
  });
});
