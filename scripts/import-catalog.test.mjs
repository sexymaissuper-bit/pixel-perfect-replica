import { test } from "node:test";
import assert from "node:assert/strict";
import {
  cleanText,
  convertProduct,
  resolveLocalImage,
  selectPublishedProducts,
} from "./catalog-import.mjs";

const fixture = {
  id: "old-id",
  slug: "racao-teste",
  title: "Ração Golden para Cães",
  brand: "Golden",
  category: "cachorros",
  subcategory: "Ração Seca",
  description: '<p>Compre na SUPERSPETZ! <a href="https://amazon.com/?utm_source=x">Oferta</a></p>',
  seo_title: "SUPERSPETZ",
  rating: 5,
  reviews_count: 900,
  specs: {
    ingredientes: ["Milho", "Vitamina E"],
    modo_de_uso: "Oferecer 30 g por dia.",
    precaucoes: "Não exceder a dose.",
    fabricante: "SUPERSPETZ",
  },
  variants: [
    {
      id: "x".repeat(100),
      label: "1 kg",
      price: 20,
      list_price: 30,
      availability: "in_stock",
      gtin: "7891234567895",
    },
  ],
};

test("removes scripts, links, tracking and old shop identity from text", () => {
  assert.equal(
    cleanText("<script>alert(1)</script><p>da SUPERSPETZ — https://amazon.com/?utm_source=x</p>"),
    "—",
  );
  assert.equal(
    cleanText("Frango &amp; arroz &lt;script&gt;alert(1)&lt;/script&gt;"),
    "Frango & arroz",
  );
});
test("imports actual product data without inherited marketing or long checkout identifiers", () => {
  const p = convertProduct(fixture);
  assert.equal(p.brand, "Golden");
  assert.equal(p.department, "cachorros");
  assert.equal(p.category, "racao-seca");
  assert.equal(p.variants[0].price, 20);
  assert.equal(p.variants[0].gtin, "7891234567895");
  assert.ok(p.variants[0].id.length <= 64);
  assert.equal(p.variants[0].salePrice, undefined);
  assert.equal(p.rating, undefined);
  assert.equal(p.seo_title, undefined);
  assert.equal(p.ingredients, "Milho; Vitamina E");
  assert.equal(p.usage, "Oferecer 30 g por dia.");
  assert.equal(p.warnings, "Não exceder a dose.");
  assert.doesNotMatch(JSON.stringify(p), /superspetz|amazon|utm_|<[^>]+>/i);
});
test("uses known manufacturer in title instead of an old shop posing as manufacturer", () => {
  const p = convertProduct({ ...fixture, title: "Petisco Churu para Gatos", brand: "SUPERSPETZ" });
  assert.equal(p.brand, "Churu");
  assert.equal(p.specs.fabricante, undefined);
});
test("does not invent stock quantities, promotional prices or manufacturer", () => {
  const p = convertProduct({
    ...fixture,
    title: "Brinquedo sem marca",
    brand: "SUPERSPETZ",
    variants: [{ label: "Único", price: 12, availability: "out_of_stock" }],
  });
  assert.equal(p.brand, "");
  assert.equal(p.variants[0].stock, 0);
  assert.equal(p.variants[0].salePrice, undefined);
});
test("rejects missing or invalid price instead of generating a purchasable free item", () => {
  assert.throws(() => convertProduct({ ...fixture, variants: [{ price: -1 }] }), /preço/i);
});
test("only resolves exact normalized images, never a similar but different product", () => {
  const files = ["/images/ração-teste.jpg", "/images/racao-teste-grande.jpg"];
  assert.equal(resolveLocalImage({ slug: "racao-teste" }, files), "/images/ração-teste.jpg");
  assert.equal(resolveLocalImage({ slug: "racao-outra" }, files), undefined);
});
test("uses a product manufacturer instead of an adjective incorrectly stored as a brand", () => {
  const p = convertProduct({
    ...fixture,
    title: "Peitoral Aerado Urban Puppy",
    brand: "Aerado",
    specs: { fabricante: "Urban Puppy" },
  });
  assert.equal(p.brand, "Urban Puppy");
  const unknown = convertProduct({
    ...fixture,
    title: "Peitoral sem marca",
    brand: "Peitoral",
    specs: {},
  });
  assert.equal(unknown.brand, "");
});
test("rejects hypothetical manufacturers and inherited promotional specifications", () => {
  const p = convertProduct({
    ...fixture,
    brand: "Mais Vendidos",
    title: "Produto sem marca",
    specs: {
      fabricante: "Mais Vendidos (Marca hipotética para este produto)",
      promocao: "Frete grátis na loja antiga",
      preco: "Oferta 50%",
    },
  });
  assert.equal(p.brand, "");
  assert.equal(p.specs.fabricante, undefined);
  assert.equal(p.specs.promocao, undefined);
  assert.equal(p.specs.preco, undefined);
});
test("preserves factual country of origin while dropping source URLs", () => {
  const p = convertProduct({
    ...fixture,
    specs: { origem: "Brasil", source_url: "https://amazon.com/item" },
  });
  assert.equal(p.specs.origem, "Brasil");
  assert.equal(p.specs["source url"], undefined);
});
test("honors the source store's explicit blocked-product list without executing code", () => {
  const source = 'export const MEDICAMENTOS_BLOQUEADOS = new Set(["retirado"]);';
  assert.deepEqual(selectPublishedProducts([{ slug: "ativo" }, { slug: "retirado" }], source), [
    { slug: "ativo" },
  ]);
});
