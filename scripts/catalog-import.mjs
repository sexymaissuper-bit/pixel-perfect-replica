import { createHash } from "node:crypto";
import path from "node:path";

const shops = /\b(?:supers?\s*petz|petdog|petlove|cobasi|amazon)\b/gi;
const normalize = (s = "") =>
  String(s)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
export const slugify = (s) =>
  normalize(s)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
const fingerprint = (s) => createHash("sha256").update(String(s)).digest("hex").slice(0, 20);

export function selectPublishedProducts(products, blockedSource = "") {
  const list = blockedSource.match(/new Set\s*\(\s*\[([\s\S]*?)\]/)?.[1] ?? "";
  const blocked = new Set([...list.matchAll(/"([^"\r\n]+)"/g)].map((match) => match[1]));
  return products.filter((product) => !blocked.has(product.slug));
}

export function cleanText(value) {
  if (value == null) return "";
  let text = typeof value === "string" ? value : String(value);
  const entities = {
    amp: "&",
    lt: "<",
    gt: ">",
    quot: '"',
    apos: "'",
    nbsp: " ",
    aacute: "á",
    eacute: "é",
    iacute: "í",
    oacute: "ó",
    uacute: "ú",
    atilde: "ã",
    otilde: "õ",
    ccedil: "ç",
    acirc: "â",
    ecirc: "ê",
    ocirc: "ô",
  };
  for (let i = 0; i < 3; i++)
    text = text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (whole, e) => {
      if (e.startsWith("#")) {
        const n = e[1].toLowerCase() === "x" ? parseInt(e.slice(2), 16) : Number(e.slice(1));
        return n > 0 && n <= 0x10ffff ? String.fromCodePoint(n) : "";
      }
      return entities[e.toLowerCase()] ?? whole;
    });
  return text
    .replace(/<(script|style|iframe)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, "")
    .replace(/<\/?(?:p|li|div|br|h[1-6]|tr)\b[^>]*>/gi, " ")
    .replace(/<[^>]*>/g, "")
    .replace(/(?:https?:\/\/|www\.)[^\s<>]+/gi, "")
    .replace(
      /\b(?:da|do|na|no|pela|pelo)\s+(?=(?:supers?\s*petz|petdog|petlove|cobasi|amazon)\b)/gi,
      "",
    )
    .replace(shops, "")
    .replace(/\b(?:utm_[a-z_]+|gclid|fbclid)=[^\s&]+/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

function textValue(value) {
  if (Array.isArray(value)) return value.map(textValue).filter(Boolean).join("; ");
  if (value && typeof value === "object")
    return Object.entries(value)
      .map(([k, v]) => `${cleanText(k.replace(/_/g, " "))}: ${textValue(v)}`)
      .join("; ");
  return cleanText(value);
}

const brands = [
  "Pet Society",
  "Soft Care",
  "Royal Canin",
  "Hill’s",
  "Hill's",
  "Hills",
  "PremierPet",
  "Premier",
  "Golden",
  "GranPlus",
  "Whiskas",
  "Dreamies",
  "Friskies",
  "Optimum",
  "Churu",
  "Nutrisco",
  "Nutrilus",
  "NuTrópica",
  "Alcon",
  "Poytara",
  "Bravecto",
  "NexGard",
  "Simparic",
  "Frontline",
  "Furacão Pet",
  "Animalíssimo",
  "Animalissimo",
  "Pet Games",
  "Sanol",
  "Vetreska",
  "Bassar",
  "SmartBones",
  "Pedigree",
  "Purina",
  "Origens",
  "Zootekna",
  "Ourofino",
  "Organnact",
  "Ferplast",
  "Urban Puppy",
  "MyHug",
  "Petix",
  "Petmais",
  "Pet Mais",
  "Flicks",
  "Jambo",
  "Alvorada",
  "BioBone",
  "Savana",
  "Keldog",
  "Origem Natural",
  "Joy",
  "Fórmula Natural",
  "Formula Natural",
  "Special Dog",
  "Vitta Natural",
  "Biofresh",
  "Guabi Natural",
  "Labcon",
  "Barritas",
  "Bom Amigo",
  "Zee.Dog",
  "Zee Dog",
  "Seresto",
  "Scalibor",
  "Apoquel",
  "Bichinho Chic",
  "Fábrica Pet",
  "Fabrica Pet",
  "LL Pet",
  "Kadi",
  "Bilisko",
  "Papaya Pets",
  "Chalesco",
  "Dentalight",
  "Bona Pet",
  "Prodac",
  "Dingo",
  "Bio dog",
  "Emporium Distripet",
  "Nutricon",
  "Granado",
  "Beeps",
  "German Hart",
  "Mokoi",
  "Mr Dry",
  "Dog Chow",
  "Mega Food",
  "Zenrelia",
  "Super Secão",
  "Dogs Care",
  "Procanine",
  "Slick",
  "Barkkies",
  "Petiscao",
  "Dogfy",
  "Mastig",
  "Nutravit",
  "Nutral",
  "Vigo Ar",
  "Top Gard",
  "São Pet",
  "Zetta Pet",
];
const invalidIdentity = (s) =>
  !s ||
  /\b(?:supers?\s*petz|petdog|petlove|cobasi|amazon|mais vendidos|restored)\b|hipotetic|nao informad|desconhecid|marca comercial|a confirmar|consultar|varia conforme/i.test(
    normalize(s),
  );
const genericIdentity =
  /^(de|do|e|para|pet|dog|natural|special|formula|mini|no|vinil|osso|mordedor|bola|coleira|medicamento|tag|peitoral|aerado|exposicao|hamster|substituto|anti-inflamatorio|pedra|protein|racao|gaiola|bebedouro|comedouro)$/;
function manufacturer(p) {
  const title = normalize(p.title);
  const known = [...brands]
    .sort((a, b) => b.length - a.length)
    .find((b) => title.includes(normalize(b)));
  if (known) return known;
  const stated = p.specs?.fabricante;
  if (
    typeof stated === "string" &&
    !invalidIdentity(stated) &&
    !genericIdentity.test(normalize(stated)) &&
    stated.length <= 100
  )
    return cleanText(stated);
  const candidate = p.brand;
  if (invalidIdentity(candidate) || genericIdentity.test(normalize(candidate))) return "";
  return brands.find((b) => normalize(b) === normalize(candidate)) ?? "";
}

export function convertProduct(p) {
  const name = cleanText(p.title);
  const slug = slugify(cleanText(p.slug || name));
  const brand = manufacturer(p);
  const specs = {};
  function flatten(obj, prefix = "") {
    for (const [key, value] of Object.entries(obj ?? {})) {
      if (
        /url|link|seo|rating|review|feed|merchant|utm|copyright|source|loja|promoc|preco|desconto|frete|assinatura/i.test(
          normalize(key),
        )
      )
        continue;
      if (
        /fabricante|marca/i.test(key) &&
        (invalidIdentity(textValue(value)) ||
          invalidIdentity(JSON.stringify(value)) ||
          genericIdentity.test(normalize(textValue(value))))
      )
        continue;
      if (value && !Array.isArray(value) && typeof value === "object") {
        flatten(value, `${prefix}${cleanText(key.replace(/_/g, " "))} — `);
        continue;
      }
      const v = textValue(value);
      if (
        /r\$|varejista|promocoes|promocao|frete gratis|desconto|assinant|hipotetic/i.test(
          normalize(v),
        )
      )
        continue;
      if (v) specs[`${prefix}${cleanText(key.replace(/_/g, " "))}`] = v;
    }
  }
  flatten(p.specs);
  const findSpec = (pattern) =>
    [
      ...new Set(
        Object.entries(specs)
          .filter(([k]) => pattern.test(normalize(k)))
          .map(([, v]) => v),
      ),
    ].join("\n\n") || undefined;
  const variants = p.variants.map((v, i) => {
    const price = Number(v.price);
    if (!Number.isFinite(price) || price <= 0)
      throw new Error(`Preço inválido: ${slug}, opção ${i + 1}`);
    const gtin = cleanText(v.gtin || p.gtin).replace(/\D/g, "");
    return {
      id: `v-${fingerprint(`${p.id}:${i}:${v.id ?? v.label}`)}`,
      label: cleanText(v.label) || "Único",
      sku: `SKU-${fingerprint(`${p.id}:${i}`).toUpperCase()}`,
      ...([8, 12, 13, 14].includes(gtin.length) ? { gtin } : {}),
      price,
      // The source supplies availability, not counted inventory. One-unit cap
      // prevents inventing a sellable quantity. Real stock must be configured.
      stock: v.availability === "in_stock" ? 1 : 0,
    };
  });
  if (!variants.length) throw new Error(`Produto sem variantes: ${slug}`);
  const department = slugify(p.category);
  const category = slugify(cleanText(p.subcategory)) || "geral";
  const indication = findSpec(/(?:^|— )indicacao$/);
  const description = [
    `${name}${brand && !normalize(name).includes(normalize(brand)) ? `, da marca ${brand}` : ""}.`,
    indication ? `Indicação do produto: ${indication}` : "",
    variants.length > 1
      ? `Confira as ${variants.length} opções disponíveis e selecione a apresentação desejada.`
      : `Apresentação cadastrada: ${variants[0].label}.`,
    "Consulte as características e as orientações do fabricante antes de utilizar.",
  ]
    .filter(Boolean)
    .join(" ");
  const attributes = {};
  for (const key of ["idade", "porte"]) {
    const val = cleanText(p.specs?.[key]);
    if (val) attributes[key] = val;
  }
  const species = {
    cachorros: "Cachorros",
    gatos: "Gatos",
    passaros: "Pássaros",
    peixes: "Peixes",
    "pequenos-animais": "Pequenos animais",
  };
  if (species[department]) attributes.especie = species[department];
  return {
    id: `p-${fingerprint(p.id || slug)}`,
    slug,
    name,
    description,
    brand,
    department,
    category,
    image: "/produtos/imagem-indisponivel.svg",
    images: [],
    variants,
    attributes,
    specs,
    ingredients: findSpec(/ingredientes|composicao(?!.*analitica)/),
    nutrition: findSpec(/nutric|analitica|niveis de garantia/),
    usage: findSpec(/modo de uso|recomendacoes|consumo diario|posologia/),
    warnings: findSpec(/precauc|advert|contraindic|cuidados|conservacao/),
    createdAt: "2026-10-17T00:00:00.000Z",
  };
}

export function resolveLocalImage(p, files) {
  const key = (s) => normalize(s).replace(/[^a-z0-9]/g, "");
  const keys = [
    p.slug,
    p.title,
    p.image_link
      ?.split("/")
      .at(-1)
      ?.split("?")[0]
      ?.replace(/\.[^.]+$/, ""),
  ]
    .filter(Boolean)
    .map(key);
  return files.find((f) => keys.includes(key(path.basename(f).replace(/\.[^.]+$/, ""))));
}
