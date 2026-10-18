/**
 * Camada de acesso ao catálogo. Hoje lê o catálogo demonstrativo;
 * troque `source` por uma chamada ao backend real sem alterar as páginas.
 */
import { demoProducts } from "@/data/demo/catalog";
import { departments, OFFERS_SLUG } from "@/data/departments";
import type { Product, Variant } from "@/data/types";

const source: Product[] = demoProducts;

export const normalize = (s: string) =>
  s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

export const effectivePrice = (v: Variant) =>
  v.salePrice != null && v.salePrice < v.price ? v.salePrice : v.price;

export const hasSale = (p: Product) => p.variants.some((v) => v.salePrice != null && v.salePrice < v.price);
export const minPrice = (p: Product) => Math.min(...p.variants.map(effectivePrice));
export const inStock = (p: Product) => p.variants.some((v) => v.stock > 0);

export function getAllProducts() {
  return source;
}
export function getProduct(slug: string) {
  return source.find((p) => p.slug === slug);
}
export function getVariant(variantId: string) {
  for (const p of source) {
    const v = p.variants.find((x) => x.id === variantId);
    if (v) return { product: p, variant: v };
  }
  return undefined;
}
export function getBrands() {
  return [...new Set(source.map((p) => p.brand))].sort();
}

export type SortKey = "relevancia" | "menor-preco" | "maior-preco" | "novidades";
export type ProductQuery = {
  q?: string;
  department?: string;
  category?: string;
  brands?: string[];
  min?: number;
  max?: number;
  attrs?: Record<string, string[]>;
  sort?: SortKey;
  page?: number;
  perPage?: number;
};

function matchesText(p: Product, q: string) {
  const terms = normalize(q).split(/\s+/).filter(Boolean);
  const dept = departments.find((d) => d.slug === p.department);
  const cat = dept?.categories.find((c) => c.slug === p.category);
  const hay = normalize(
    [p.name, p.brand, dept?.name, cat?.name, p.description, ...(p.keywords ?? []), ...Object.values(p.attributes)].join(" "),
  );
  return terms.every((t) => hay.includes(t));
}

function score(p: Product, q: string) {
  const n = normalize(p.name);
  const nq = normalize(q);
  return (n.startsWith(nq) ? 3 : 0) + (n.includes(nq) ? 2 : 0) + (p.featured ? 1 : 0);
}

/** Produtos que satisfazem o escopo (busca/departamento/categoria), antes dos filtros facetados. */
export function scopeProducts(q: ProductQuery) {
  return source.filter((p) => {
    if (q.department === OFFERS_SLUG) {
      if (!hasSale(p)) return false;
    } else if (q.department && p.department !== q.department) return false;
    if (q.category && p.category !== q.category) return false;
    if (q.q && !matchesText(p, q.q)) return false;
    return true;
  });
}

export function queryProducts(q: ProductQuery) {
  const scoped = scopeProducts(q);
  let list = scoped.filter((p) => {
    if (q.brands?.length && !q.brands.includes(p.brand)) return false;
    const price = minPrice(p);
    if (q.min != null && price < q.min) return false;
    if (q.max != null && price > q.max) return false;
    for (const [k, vals] of Object.entries(q.attrs ?? {})) {
      if (vals.length && !vals.includes(p.attributes[k] ?? "")) return false;
    }
    return true;
  });
  const sort = q.sort ?? "relevancia";
  list = [...list].sort((a, b) => {
    if (sort === "menor-preco") return minPrice(a) - minPrice(b);
    if (sort === "maior-preco") return minPrice(b) - minPrice(a);
    if (sort === "novidades") return b.createdAt.localeCompare(a.createdAt);
    if (q.q) return score(b, q.q) - score(a, q.q);
    return Number(!!b.featured) - Number(!!a.featured);
  });
  const perPage = q.perPage ?? 12;
  const page = Math.max(1, q.page ?? 1);
  const total = list.length;
  return {
    total,
    page,
    pages: Math.max(1, Math.ceil(total / perPage)),
    items: list.slice((page - 1) * perPage, page * perPage),
    facets: buildFacets(scoped),
  };
}

export const ATTRIBUTE_LABELS: Record<string, string> = {
  especie: "Espécie",
  idade: "Idade",
  porte: "Porte",
};

function buildFacets(list: Product[]) {
  const brands = [...new Set(list.map((p) => p.brand))].sort();
  const attrs: Record<string, string[]> = {};
  for (const p of list)
    for (const [k, val] of Object.entries(p.attributes)) {
      attrs[k] ??= [];
      if (!attrs[k].includes(val)) attrs[k].push(val);
    }
  const categories = [...new Set(list.map((p) => p.category))];
  return { brands, attrs, categories };
}

export function relatedProducts(p: Product, n = 4) {
  return source.filter((x) => x.id !== p.id && x.department === p.department).slice(0, n);
}
