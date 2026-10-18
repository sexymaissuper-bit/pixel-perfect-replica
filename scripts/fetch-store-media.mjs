import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = path.resolve(import.meta.dirname, "..");
const logos = [
  {
    name: "Purina",
    image: "/marcas/purina.webp",
    source: "https://purina.com.br/themes/custom/purina/purina/Content/img/logo/red/logo.png",
  },
  {
    name: "Dog Chow",
    image: "/marcas/dog-chow.webp",
    source: "https://purina.com.br/sites/default/files/2024-03/DogChow_BR.png",
  },
  {
    name: "Whiskas",
    image: "/marcas/whiskas.webp",
    background: "#602080",
    source: "https://www.whiskas.com.br/sites/g/files/fnmzdf8986/files/logo_2_1.png",
  },
  {
    name: "Pedigree",
    image: "/marcas/pedigree.webp",
    background: "#ffcf00",
    source: "https://www.pedigree.com.br/sites/g/files/fnmzdf2401/files/pedigree_logo_blue.png",
  },
  {
    name: "Keldog",
    image: "/marcas/keldog.webp",
    source: "https://www.kelcopetcare.com.br/wp-content/uploads/2019/11/logo-keldog.jpg",
  },
];
await fs.mkdir(path.join(root, "public/marcas"), { recursive: true });
for (const logo of logos) {
  const r = await fetch(logo.source, { signal: AbortSignal.timeout(20000) });
  if (!r.ok) throw new Error(`${logo.name}: HTTP ${r.status}`);
  const bytes = Buffer.from(await r.arrayBuffer());
  await sharp(bytes)
    .rotate()
    .resize({ width: 400, height: 200, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 95 })
    .toFile(path.join(root, "public", logo.image));
  console.log(
    logo.name,
    await sharp(path.join(root, "public", logo.image))
      .metadata()
      .then(({ width, height }) => ({ width, height })),
  );
}
const royalUrl = "https://www.royalcanin.com/br";
const royalHtml = await fetch(royalUrl).then((r) => r.text());
let royalSvg = [...royalHtml.matchAll(/<svg\b[^>]*>[\s\S]*?<\/svg>/gi)]
  .map((m) => m[0])
  .find((svg) => /aria-label="Royal Canin"/.test(svg));
if (!royalSvg) throw new Error("Logo oficial Royal Canin não encontrado");
royalSvg = royalSvg.replace(
  "<svg",
  '<svg xmlns="http://www.w3.org/2000/svg" fill="#e2001a" color="#e2001a"',
);
await sharp(Buffer.from(royalSvg), { density: 192 })
  .resize({ width: 400 })
  .webp({ quality: 95 })
  .toFile(path.join(root, "public/marcas/royal-canin.webp"));
logos.unshift({ name: "Royal Canin", image: "/marcas/royal-canin.webp", source: royalUrl });
await fs.writeFile(
  path.join(root, "src/data/brand-logos.json"),
  JSON.stringify(logos, null, 2) + "\n",
);

// Higher-resolution photo of the same Blue Premium 82x60 cm / 30-unit pack.
const blueUrl =
  "https://cobasi.vteximg.com.br/arquivos/ids/1046928-1500-1500/tapete-higienico-blue-premium-30-unidades-lado.webp?v=638828425432770000";
const response = await fetch(blueUrl, { signal: AbortSignal.timeout(20000) });
if (!response.ok) throw new Error(`Blue Premium: HTTP ${response.status}`);
const blue = Buffer.from(await response.arrayBuffer());
const products = JSON.parse(
  await fs.readFile(path.join(root, "src/data/catalog/products.json"), "utf8"),
);
const p = products.find((p) => p.slug === "tapete-higienico-blue-premium-82x60cm-para-caes");
if (!p) throw new Error("Produto Blue Premium não encontrado");
const previousImage = p.image;
const highResolutionImage = `/produtos/${p.id}-blue-premium-hd.webp`;
await sharp(blue)
  .rotate()
  .resize({ width: 1500, height: 1500, fit: "inside", withoutEnlargement: true })
  .webp({ quality: 94 })
  .toFile(path.join(root, "public", highResolutionImage));
p.image = highResolutionImage;
p.images = p.images.map(image => image === previousImage ? highResolutionImage : image);
await fs.writeFile(path.join(root, "src/data/catalog/products.json"), JSON.stringify(products, null, 2) + "\n");
console.log(
  "Blue Premium",
  await sharp(path.join(root, "public", p.image))
    .metadata()
    .then(({ width, height }) => ({ width, height })),
);
