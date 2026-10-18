import type { Department } from "./types";
import importedDepartments from "./catalog/departments.json";

/** Categorias reais importadas junto com o catálogo. */
export const departments: Department[] = importedDepartments;

/** "ofertas" é um departamento virtual: produtos com preço promocional válido. */
export const OFFERS_SLUG = "ofertas";

export function getDepartment(slug: string) {
  return departments.find((d) => d.slug === slug);
}
