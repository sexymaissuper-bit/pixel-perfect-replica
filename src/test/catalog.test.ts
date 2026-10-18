import { describe, expect, it } from "vitest";
import { queryProducts, minPrice } from "@/lib/catalog";

describe("catálogo", () => {
  it("busca ignora acentos e maiúsculas", () => {
    expect(queryProducts({ q: "PASSAROS" }).total).toBeGreaterThan(0);
    expect(queryProducts({ q: "ração" }).total).toBe(queryProducts({ q: "racao" }).total);
  });
  it("filtro por marca restringe resultados", () => {
    const r = queryProducts({ brands: ["FelinoMax (demo)"] });
    expect(r.items.every((p) => p.brand === "FelinoMax (demo)")).toBe(true);
  });
  it("ordenação por menor preço", () => {
    const r = queryProducts({ sort: "menor-preco", perPage: 100 });
    const prices = r.items.map(minPrice);
    expect(prices).toEqual([...prices].sort((a, b) => a - b));
  });
  it("ofertas só contém produtos em promoção", () => {
    const r = queryProducts({ department: "ofertas", perPage: 100 });
    expect(r.items.every((p) => p.variants.some((v) => v.salePrice != null && v.salePrice < v.price))).toBe(true);
  });
});
