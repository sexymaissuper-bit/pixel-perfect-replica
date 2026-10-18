export type Variant = {
  id: string;
  label: string; // ex.: "3 kg", "Sabor frango"
  sku: string;
  gtin?: string;
  price: number; // em reais
  salePrice?: number; // promocional opcional (deve ser < price)
  stock: number;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  description: string;
  brand: string;
  department: string; // slug do departamento
  category: string; // slug da categoria
  image: string;
  images: string[];
  variants: Variant[];
  /** Atributos filtráveis: especie, idade, porte etc. */
  attributes: Record<string, string>;
  specs: Record<string, string>;
  ingredients?: string;
  nutrition?: string;
  usage?: string;
  warnings?: string;
  keywords?: string[];
  featured?: boolean;
  createdAt: string; // ISO
  /** true para itens do catálogo demonstrativo */
  demo?: boolean;
};

export type Category = { slug: string; name: string };
export type Department = { slug: string; name: string; categories: Category[] };
