import { describe, expect, it } from "vitest";
import { normalize, queryProducts } from "@/lib/catalog";

describe("catálogo", () => {
  it("normaliza acentos e maiúsculas", () => {
    expect(normalize("RAÇÃO Pássaros")).toBe("racao passaros");
  });
  it("catálogo vazio retorna zero resultados", () => {
    expect(queryProducts({ q: "racao" }).total).toBe(0);
  });
});
