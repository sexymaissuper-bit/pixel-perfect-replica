import { describe, expect, it } from "vitest";
import { selectBrandLogos } from "@/lib/brand-logos";

describe("logos do carrossel", () => {
  it("omite marcas sem logo real e nomes vazios", () => {
    expect(selectBrandLogos(["", "Marca sem logo", "Diversos"]).length).toBe(0);
  });
  it("exibe apenas logos disponíveis que têm produtos no catálogo", () => {
    const logos = selectBrandLogos(["Purina", "WHISKAS", "Marca sem logo", "Purina"]);
    expect(logos.map((logo) => logo.name)).toEqual(["Purina", "Whiskas"]);
    expect(logos.every((logo) => logo.image.startsWith("/marcas/"))).toBe(true);
  });
});
