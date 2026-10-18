// One-time migration tool. Install its optional dependency with:
// npm install --no-save --package-lock=false sharp
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import {
  cleanText,
  convertProduct,
  resolveLocalImage,
  selectPublishedProducts,
  slugify,
} from "./catalog-import.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourceRoot = path.resolve(process.argv[2] ?? "../furry-finds-hq");
const origin = process.argv[3];
if (!origin || new URL(origin).protocol !== "https:")
  throw new Error("Informe a origem HTTPS dos arquivos como segundo argumento.");
const sourceProducts = JSON.parse(
  await fs.readFile(path.join(sourceRoot, "src/data/products-b64.json"), "utf8"),
);
let blockedSource = "";
try {
  blockedSource = await fs.readFile(
    path.join(sourceRoot, "src/data/medicamentos-bloqueados.ts"),
    "utf8",
  );
} catch (error) {
  if (error.code !== "ENOENT") throw error;
}
const raw = selectPublishedProducts(sourceProducts, blockedSource);
async function walk(dir) {
  const out = [];
  for (const e of await fs.readdir(dir, { withFileTypes: true })) {
    const f = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...(await walk(f)));
    else out.push(f);
  }
  return out;
}
const localFiles = (await walk(path.join(sourceRoot, "public"))).filter((f) =>
  /\.(jpe?g|png|webp)$/i.test(f),
);
const assetFiles = (await walk(path.join(sourceRoot, "src/assets"))).filter((f) =>
  f.endsWith(".asset.json"),
);
const assetIndex = new Map();
for (const file of assetFiles) {
  const asset = JSON.parse(await fs.readFile(file, "utf8"));
  assetIndex.set(slugify(asset.original_filename?.replace(/\.[^.]+$/, "") ?? ""), asset.url);
}
const imageDir = path.join(root, "public/produtos");
await fs.mkdir(imageDir, { recursive: true });
await fs.mkdir(path.join(root, "src/data/catalog"), { recursive: true });
await fs.mkdir(path.join(root, "docs"), { recursive: true });
const report = {
  sourceProducts: sourceProducts.length,
  excludedBySource: sourceProducts
    .filter((product) => !raw.some((active) => active.slug === product.slug))
    .map((product) => product.slug),
  products: raw.length,
  variants: 0,
  images: 0,
  missingImages: [],
  imageErrors: [],
  manufacturerReview: [],
  invalidGTIN: [],
  availabilityOnly: true,
  visualReviewRequired: true,
  technicalDataReviewRequired: true,
  metadataVerified: true,
};
const products = [];
const productIds = new Set(),
  slugs = new Set(),
  variantIds = new Set();

async function imageBuffer(url) {
  if (url?.startsWith("data:image/")) return Buffer.from(url.split(",")[1], "base64");
  const source = new URL(url, origin);
  if (source.protocol !== "https:") throw new Error("Origem de imagem precisa usar HTTPS");
  const r = await fetch(source, { signal: AbortSignal.timeout(25000) });
  if (!r.ok || !r.headers.get("content-type")?.startsWith("image/"))
    throw new Error(`Resposta de imagem inválida: ${r.status}`);
  const body = Buffer.from(await r.arrayBuffer());
  if (body.length > 20 * 1024 * 1024) throw new Error("Imagem excede 20 MB");
  return body;
}

async function importOne(p) {
  const product = convertProduct(p);
  if (productIds.has(product.id) || slugs.has(product.slug))
    throw new Error(`Produto duplicado: ${product.slug}`);
  productIds.add(product.id);
  slugs.add(product.slug);
  for (const v of product.variants) {
    if (variantIds.has(v.id)) throw new Error(`Variante duplicada: ${v.id}`);
    variantIds.add(v.id);
  }
  if (!product.brand) report.manufacturerReview.push(product.slug);
  const primaryLocal = resolveLocalImage(p, localFiles);
  const additional = [
    ...new Set([
      ...(p.additional_images ?? []),
      ...(Array.isArray(p.images) ? p.images.filter((x) => typeof x === "string") : []),
    ]),
  ].filter((x) => x !== p.image_link);
  const inputs = [p.image_link, ...additional];
  const images = [];
  for (const [index, input] of inputs.entries()) {
    const outputName = `${product.id}-${index + 1}.webp`;
    const dest = path.join(imageDir, outputName);
    if (process.argv.includes("--reuse-images")) {
      try {
        const meta = await sharp(dest).metadata();
        if (
          meta.format === "webp" &&
          !meta.exif &&
          !meta.iptc &&
          !meta.xmp &&
          !meta.icc &&
          !meta.comments?.length
        ) {
          images.push(`/produtos/${outputName}`);
          report.images++;
          continue;
        }
      } catch {
        /* Missing or invalid images are regenerated below. */
      }
    }
    let success = false;
    const local = index === 0 ? primaryLocal : resolveLocalImage({ image_link: input }, localFiles);
    const fallback = index === 0 ? assetIndex.get(slugify(p.slug)) : undefined;
    for (const attempt of [
      ...(local ? [{ local }] : []),
      ...(input ? [{ url: input }] : []),
      ...(fallback ? [{ url: fallback }] : []),
    ]) {
      try {
        const buffer = attempt.local
          ? await fs.readFile(attempt.local)
          : await imageBuffer(attempt.url);
        // sharp strips metadata by default. Do not use keepMetadata/withMetadata.
        await sharp(buffer, { limitInputPixels: 40_000_000 })
          .rotate()
          .resize({ width: 1200, height: 1200, fit: "inside", withoutEnlargement: true })
          .webp({ quality: 88 })
          .toFile(dest);
        const meta = await sharp(dest).metadata();
        if (meta.exif || meta.iptc || meta.xmp || meta.icc || meta.comments?.length)
          throw new Error("Metadados inesperados no arquivo de saída");
        images.push(`/produtos/${outputName}`);
        report.images++;
        success = true;
        break;
      } catch (e) {
        report.imageErrors.push({ product: product.slug, image: index + 1, error: e.message });
      }
    }
    if (!success && index === 0) report.missingImages.push(product.slug);
  }
  product.image = images[0] ?? "/produtos/imagem-indisponivel.svg";
  product.images = images;
  for (const [i, v] of p.variants.entries()) {
    if (v.gtin && !product.variants[i].gtin)
      report.invalidGTIN.push({ product: product.slug, option: i + 1 });
  }
  report.variants += product.variants.length;
  return product;
}

for (let start = 0; start < raw.length; start += 6) {
  products.push(...(await Promise.all(raw.slice(start, start + 6).map(importOne))));
  if (start % 60 === 0)
    console.log(`${Math.min(start + 6, raw.length)}/${raw.length} produtos processados`);
}
const names = {
  cachorros: "Cachorros",
  gatos: "Gatos",
  passaros: "Pássaros",
  peixes: "Peixes",
  "pequenos-animais": "Pequenos animais",
  farmacia: "Farmácia pet",
};
const departments = Object.entries(names).map(([slug, name]) => ({
  slug,
  name,
  categories: [
    ...new Map(
      raw
        .filter((p) => slugify(p.category) === slug)
        .map((p) => [
          slugify(cleanText(p.subcategory)) || "geral",
          cleanText(p.subcategory) || "Geral",
        ]),
    ).entries(),
  ].map(([slug, name]) => ({ slug, name })),
}));
// Keep the site's cross-department hygiene navigation populated too.
const hygieneCategory =
  /higien|shampoo|condicionador|banheir|fralda|tapete|colonia|perfume|odor|limpeza|cuidado-oral|hidratante|escova|pente|banho/;
departments.splice(departments.length - 1, 0, {
  slug: "higiene-beleza",
  name: "Higiene e beleza",
  categories: [
    ...new Map(
      raw
        .filter((p) => hygieneCategory.test(slugify(p.subcategory || "")))
        .map((p) => [slugify(cleanText(p.subcategory)), cleanText(p.subcategory)]),
    ).entries(),
  ].map(([slug, name]) => ({ slug, name })),
});
await fs.writeFile(
  path.join(root, "src/data/catalog/products.json"),
  JSON.stringify(products, null, 2) + "\n",
);
await fs.writeFile(
  path.join(root, "src/data/catalog/departments.json"),
  JSON.stringify(departments, null, 2) + "\n",
);
await fs.writeFile(
  path.join(root, "docs/catalog-import-report.json"),
  JSON.stringify(report, null, 2) + "\n",
);
console.log(
  JSON.stringify({
    products: products.length,
    variants: report.variants,
    images: report.images,
    missingImages: report.missingImages.length,
    manufacturerReview: report.manufacturerReview.length,
  }),
);
