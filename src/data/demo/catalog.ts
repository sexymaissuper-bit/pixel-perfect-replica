/**
 * CATÁLOGO DEMONSTRATIVO — dados fictícios apenas para teste de navegação.
 * Marcas são nomes inventados. Remover/substituir ao importar o catálogo real
 * (ver DEPLOY.md > "Substituir catálogo").
 */
import type { Product } from "../types";
import dog from "@/assets/p-dogfood.jpg";
import cat from "@/assets/p-catfood.jpg";
import toy from "@/assets/p-toy.jpg";
import shampoo from "@/assets/p-shampoo.jpg";
import bird from "@/assets/p-bird.jpg";
import fish from "@/assets/p-fish.jpg";
import scratch from "@/assets/p-scratch.jpg";
import small from "@/assets/p-small.jpg";

const v = (id: string, label: string, price: number, stock: number, salePrice?: number, gtin?: string) => ({
  id,
  label,
  sku: id.toUpperCase(),
  price,
  salePrice,
  stock,
  gtin,
});

export const demoProducts: Product[] = [
  {
    id: "d1", slug: "racao-caes-adultos-frango-demo", name: "Ração Seca Cães Adultos Frango e Arroz",
    description: "Produto demonstrativo. Ração seca para cães adultos, sabor frango e arroz.",
    brand: "NutriCão (demo)", department: "cachorros", category: "racao", image: dog, images: [dog, toy],
    variants: [v("d1-1", "1 kg", 39.9, 20), v("d1-3", "3 kg", 99.9, 12, 89.9, "7890000000011"), v("d1-15", "15 kg", 389.9, 4)],
    attributes: { especie: "Cão", idade: "Adulto", porte: "Médio" },
    specs: { "Tipo": "Ração seca", "Sabor": "Frango e arroz" },
    ingredients: "Exemplo demonstrativo — os ingredientes reais virão do catálogo.",
    usage: "Exemplo demonstrativo.", keywords: ["racao", "comida", "alimento"], featured: true, createdAt: "2026-09-01", demo: true,
  },
  {
    id: "d2", slug: "racao-caes-filhotes-demo", name: "Ração Seca Cães Filhotes Raças Pequenas",
    description: "Produto demonstrativo para filhotes de raças pequenas.",
    brand: "NutriCão (demo)", department: "cachorros", category: "racao", image: dog, images: [dog],
    variants: [v("d2-1", "1 kg", 44.9, 15), v("d2-3", "3 kg", 119.9, 0)],
    attributes: { especie: "Cão", idade: "Filhote", porte: "Pequeno" }, specs: { "Tipo": "Ração seca" },
    keywords: ["filhote", "racao"], createdAt: "2026-10-01", demo: true,
  },
  {
    id: "d3", slug: "kit-brinquedos-mordedor-corda-demo", name: "Kit Mordedor e Corda para Cães",
    description: "Produto demonstrativo. Kit com mordedor de borracha e corda trançada.",
    brand: "Brinca Pet (demo)", department: "cachorros", category: "brinquedos", image: toy, images: [toy],
    variants: [v("d3-p", "Pequeno", 34.9, 30, 27.9), v("d3-g", "Grande", 44.9, 10)],
    attributes: { especie: "Cão", porte: "Todos" }, specs: { "Material": "Borracha e algodão" },
    keywords: ["brinquedo", "mordedor"], featured: true, createdAt: "2026-08-10", demo: true,
  },
  {
    id: "d4", slug: "petisco-caes-bifinho-demo", name: "Petisco Bifinho Sabor Carne",
    description: "Produto demonstrativo de petisco.",
    brand: "Brinca Pet (demo)", department: "cachorros", category: "petiscos", image: dog, images: [dog],
    variants: [v("d4-1", "65 g", 12.9, 50)], attributes: { especie: "Cão", idade: "Adulto" },
    specs: { "Sabor": "Carne" }, keywords: ["petisco", "snack"], createdAt: "2026-07-01", demo: true,
  },
  {
    id: "d5", slug: "racao-gatos-castrados-salmao-demo", name: "Ração Seca Gatos Castrados Salmão",
    description: "Produto demonstrativo para gatos adultos castrados.",
    brand: "FelinoMax (demo)", department: "gatos", category: "racao", image: cat, images: [cat],
    variants: [v("d5-1", "1 kg", 49.9, 25), v("d5-3", "3 kg", 129.9, 8, 114.9), v("d5-10", "10 kg", 359.9, 3)],
    attributes: { especie: "Gato", idade: "Adulto" }, specs: { "Tipo": "Ração seca", "Sabor": "Salmão" },
    keywords: ["racao", "castrado"], featured: true, createdAt: "2026-09-15", demo: true,
  },
  {
    id: "d6", slug: "racao-gatos-filhotes-demo", name: "Ração Seca Gatos Filhotes Frango",
    description: "Produto demonstrativo para gatos filhotes.",
    brand: "FelinoMax (demo)", department: "gatos", category: "racao", image: cat, images: [cat],
    variants: [v("d6-1", "1 kg", 52.9, 18)], attributes: { especie: "Gato", idade: "Filhote" },
    specs: { "Sabor": "Frango" }, createdAt: "2026-10-05", demo: true,
  },
  {
    id: "d7", slug: "arranhador-torre-gatos-demo", name: "Arranhador Torre com Toca para Gatos",
    description: "Produto demonstrativo. Arranhador com plataformas, toca e rede.",
    brand: "Casa Felina (demo)", department: "gatos", category: "arranhadores", image: scratch, images: [scratch],
    variants: [v("d7-1", "Bege — 1,1 m", 349.9, 5, 299.9)], attributes: { especie: "Gato" },
    specs: { "Altura": "110 cm (demonstrativo)", "Material": "Sisal e pelúcia" }, featured: true, createdAt: "2026-06-20", demo: true,
  },
  {
    id: "d8", slug: "gaiola-passaros-pequenos-demo", name: "Gaiola para Pássaros Pequenos com Comedouro",
    description: "Produto demonstrativo de gaiola.",
    brand: "Voar (demo)", department: "passaros", category: "gaiolas", image: bird, images: [bird],
    variants: [v("d8-1", "Azul", 159.9, 7)], attributes: { especie: "Pássaro" },
    specs: { "Material": "Arame pintado e plástico" }, featured: true, createdAt: "2026-05-01", demo: true,
  },
  {
    id: "d9", slug: "mistura-sementes-calopsita-demo", name: "Mistura de Sementes para Calopsitas",
    description: "Produto demonstrativo de alimentação para pássaros.",
    brand: "Voar (demo)", department: "passaros", category: "alimentacao", image: bird, images: [bird],
    variants: [v("d9-500", "500 g", 19.9, 40), v("d9-1", "1 kg", 34.9, 22)], attributes: { especie: "Pássaro" },
    specs: {}, keywords: ["semente", "alpiste"], createdAt: "2026-08-01", demo: true,
  },
  {
    id: "d10", slug: "aquario-kit-completo-demo", name: "Aquário Kit Completo 20 L",
    description: "Produto demonstrativo de aquário com filtro e iluminação.",
    brand: "AquaVida (demo)", department: "peixes", category: "aquarios", image: fish, images: [fish],
    variants: [v("d10-20", "20 L", 459.9, 3)], attributes: { especie: "Peixe" },
    specs: { "Volume": "20 L (demonstrativo)" }, featured: true, createdAt: "2026-09-25", demo: true,
  },
  {
    id: "d11", slug: "racao-peixes-tropicais-demo", name: "Alimento em Flocos para Peixes Tropicais",
    description: "Produto demonstrativo.", brand: "AquaVida (demo)", department: "peixes", category: "alimentacao",
    image: fish, images: [fish], variants: [v("d11-50", "50 g", 24.9, 30, 19.9)], attributes: { especie: "Peixe" },
    specs: {}, keywords: ["flocos"], createdAt: "2026-04-01", demo: true,
  },
  {
    id: "d12", slug: "casinha-feno-roedores-demo", name: "Casinha de Madeira + Feno para Roedores",
    description: "Produto demonstrativo para hamsters e porquinhos-da-índia.",
    brand: "Roedor Feliz (demo)", department: "pequenos-animais", category: "casinhas", image: small, images: [small],
    variants: [v("d12-1", "Kit único", 89.9, 9)], attributes: { especie: "Roedor" },
    specs: { "Material": "Pinus" }, keywords: ["hamster", "coelho", "porquinho"], featured: true, createdAt: "2026-07-15", demo: true,
  },
  {
    id: "d13", slug: "shampoo-neutro-caes-gatos-demo", name: "Shampoo Neutro para Cães e Gatos",
    description: "Produto demonstrativo de higiene.",
    brand: "Banho Bom (demo)", department: "higiene-beleza", category: "shampoos", image: shampoo, images: [shampoo],
    variants: [v("d13-500", "500 ml", 29.9, 35), v("d13-1", "1 L", 49.9, 0)], attributes: { especie: "Cão e gato" },
    specs: { "Volume": "conforme variante" }, warnings: "Exemplo: manter fora do alcance de crianças.",
    keywords: ["banho", "higiene"], createdAt: "2026-09-10", demo: true,
  },
];
