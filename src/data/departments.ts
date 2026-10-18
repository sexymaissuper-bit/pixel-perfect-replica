import type { Department } from "./types";

/** Departamentos e categorias — editar aqui (ou substituir por fonte de dados) quando o catálogo definitivo chegar. */
export const departments: Department[] = [
  {
    slug: "cachorros",
    name: "Cachorros",
    categories: [
      { slug: "racao", name: "Ração" },
      { slug: "petiscos", name: "Petiscos" },
      { slug: "brinquedos", name: "Brinquedos" },
      { slug: "camas-casinhas", name: "Camas e casinhas" },
    ],
  },
  {
    slug: "gatos",
    name: "Gatos",
    categories: [
      { slug: "racao", name: "Ração" },
      { slug: "areia", name: "Areia e higiene" },
      { slug: "arranhadores", name: "Arranhadores" },
    ],
  },
  {
    slug: "passaros",
    name: "Pássaros",
    categories: [
      { slug: "alimentacao", name: "Alimentação" },
      { slug: "gaiolas", name: "Gaiolas e acessórios" },
    ],
  },
  {
    slug: "peixes",
    name: "Peixes",
    categories: [
      { slug: "alimentacao", name: "Alimentação" },
      { slug: "aquarios", name: "Aquários" },
    ],
  },
  {
    slug: "pequenos-animais",
    name: "Pequenos animais",
    categories: [
      { slug: "alimentacao", name: "Alimentação" },
      { slug: "casinhas", name: "Casinhas e acessórios" },
    ],
  },
  {
    slug: "higiene-beleza",
    name: "Higiene e beleza",
    categories: [
      { slug: "shampoos", name: "Shampoos e condicionadores" },
      { slug: "tapetes", name: "Tapetes higiênicos" },
    ],
  },
  {
    slug: "farmacia",
    name: "Farmácia pet",
    categories: [{ slug: "antipulgas", name: "Antipulgas e carrapatos" }],
  },
];

/** "ofertas" é um departamento virtual: produtos com preço promocional válido. */
export const OFFERS_SLUG = "ofertas";

export function getDepartment(slug: string) {
  return departments.find((d) => d.slug === slug);
}
