import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { Heart, Minus, Plus } from "lucide-react";
import { toast } from "sonner";
import { getProduct, relatedProducts, effectivePrice } from "@/lib/catalog";
import { getDepartment } from "@/data/departments";
import { seo, absoluteUrl, storeConfig } from "@/config/store";
import { formatBRL, formatCep, onlyDigits } from "@/lib/format";
import { useShop } from "@/lib/shop-state";
import { Button } from "@/components/ui/button";
import { ProductGrid } from "@/components/store/ProductCard";
import { DemoNotice } from "@/components/store/Footer";

export const Route = createFileRoute("/produto/$slug")({
  loader: ({ params }) => {
    const p = getProduct(params.slug);
    if (!p) throw notFound();
    return { slug: p.slug, name: p.name, description: p.description };
  },
  head: ({ loaderData }) =>
    loaderData
      ? seo({ title: loaderData.name, description: loaderData.description.slice(0, 155), path: `/produto/${loaderData.slug}` })
      : { meta: [{ title: "Produto não encontrado" }, { name: "robots", content: "noindex" }] },
  component: ProductPage,
});

function ProductPage() {
  const { slug } = Route.useParams();
  const p = getProduct(slug)!;
  const { add, toggleFavorite, favorites, setDrawerOpen, cep, setCep } = useShop();
  const [variantId, setVariantId] = useState(p.variants.find((v) => v.stock > 0)?.id ?? p.variants[0].id);
  const [img, setImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [cepInput, setCepInput] = useState("");
  const [cepMsg, setCepMsg] = useState("");
  const v = p.variants.find((x) => x.id === variantId)!;
  const dept = getDepartment(p.department);
  const cat = dept?.categories.find((c) => c.slug === p.category);
  const sale = v.salePrice != null && v.salePrice < v.price;
  const fav = favorites.includes(p.id);
  const buy = () => { add(v.id, qty); toast.success("Adicionado ao carrinho"); setDrawerOpen(true); };

  const jsonLd = {
    "@context": "https://schema.org", "@type": "Product", name: p.name, description: p.description,
    brand: { "@type": "Brand", name: p.brand }, sku: v.sku, ...(v.gtin ? { gtin13: v.gtin } : {}),
    offers: { "@type": "Offer", priceCurrency: "BRL", price: effectivePrice(v).toFixed(2), availability: v.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock", ...(absoluteUrl(`/produto/${p.slug}`) ? { url: absoluteUrl(`/produto/${p.slug}`) } : {}), seller: { "@type": "Organization", name: storeConfig.name } },
  };

  return (
    <div className="mx-auto max-w-7xl px-3 py-4 pb-28 lg:pb-4">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <nav aria-label="Trilha de navegação" className="text-xs text-muted-foreground">
        <Link to="/" className="hover:underline">Início</Link> /{" "}
        {dept && <><Link to="/departamento/$slug" params={{ slug: dept.slug }} className="hover:underline">{dept.name}</Link> / </>}
        {cat && dept && <><Link to="/departamento/$slug" params={{ slug: dept.slug }} search={{ categoria: cat.slug }} className="hover:underline">{cat.name}</Link> / </>}
        <span>{p.name}</span>
      </nav>
      {p.demo && <div className="mt-3"><DemoNotice>este é um produto fictício do catálogo de exemplo.</DemoNotice></div>}

      <div className="mt-4 grid gap-8 lg:grid-cols-2">
        <div>
          <div className="aspect-square overflow-hidden rounded-lg border bg-muted">
            <img src={p.images[img] ?? p.image} alt={p.name} width={800} height={800} className="h-full w-full object-contain" />
          </div>
          {p.images.length > 1 && (
            <div className="mt-3 flex gap-2">
              {p.images.map((src, i) => (
                <button key={i} onClick={() => setImg(i)} aria-label={`Ver imagem ${i + 1}`} aria-current={i === img} className={`h-20 w-20 overflow-hidden rounded-md border-2 ${i === img ? "border-primary" : "border-transparent"}`}>
                  <img src={src} alt="" loading="lazy" width={80} height={80} className="h-full w-full object-contain" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{p.brand}</p>
          <h1 className="mt-1 text-2xl font-extrabold sm:text-3xl">{p.name}</h1>
          <p className="mt-1 text-xs text-muted-foreground">SKU: {v.sku}{v.gtin && ` · GTIN: ${v.gtin}`}</p>

          {p.variants.length > 1 && (
            <fieldset className="mt-5">
              <legend className="mb-2 text-sm font-semibold">Opção</legend>
              <div className="flex flex-wrap gap-2">
                {p.variants.map((x) => (
                  <button key={x.id} onClick={() => { setVariantId(x.id); setQty(1); }} aria-pressed={x.id === variantId}
                    className={`min-h-11 rounded-md border-2 px-4 text-sm font-medium ${x.id === variantId ? "border-primary bg-secondary text-primary" : "border-border"} ${x.stock === 0 ? "text-muted-foreground line-through" : ""}`}>
                    {x.label}
                  </button>
                ))}
              </div>
            </fieldset>
          )}

          <div className="mt-5">
            {sale && <p className="text-sm text-muted-foreground line-through">{formatBRL(v.price)}</p>}
            <p className={`text-3xl font-extrabold ${sale ? "text-sale" : ""}`}>{formatBRL(effectivePrice(v))}</p>
            <p className={`mt-1 text-sm font-medium ${v.stock > 0 ? "text-success" : "text-destructive"}`}>{v.stock > 0 ? "Disponível" : "Indisponível nesta opção"}</p>
          </div>

          <div className="mt-5 flex items-center gap-3">
            <div className="flex items-center rounded-md border">
              <button className="p-3" aria-label="Diminuir quantidade" onClick={() => setQty((q) => Math.max(1, q - 1))}><Minus className="h-4 w-4" /></button>
              <span className="w-10 text-center" aria-live="polite">{qty}</span>
              <button className="p-3" aria-label="Aumentar quantidade" onClick={() => setQty((q) => Math.min(v.stock || 1, q + 1))}><Plus className="h-4 w-4" /></button>
            </div>
            <Button size="lg" className="h-12 flex-1" disabled={v.stock === 0} onClick={buy}>Adicionar ao carrinho</Button>
            <Button size="lg" variant="outline" className="h-12 w-12 p-0" aria-pressed={fav} aria-label={fav ? "Remover dos favoritos" : "Favoritar"} onClick={() => toggleFavorite(p.id)}>
              <Heart className={fav ? "fill-current text-primary" : ""} />
            </Button>
          </div>

          <form className="mt-6 rounded-lg border p-4" onSubmit={(e) => {
            e.preventDefault();
            const d = onlyDigits(cepInput);
            if (d.length !== 8) { setCepMsg("Informe um CEP válido com 8 dígitos."); return; }
            setCep(d);
            setCepMsg("Cálculo de frete ainda não está disponível: a integração com transportadora não foi configurada.");
          }}>
            <label htmlFor="cep-p" className="text-sm font-semibold">Consultar entrega</label>
            <div className="mt-2 flex gap-2">
              <input id="cep-p" inputMode="numeric" placeholder={cep ? formatCep(cep) : "00000-000"} value={formatCep(cepInput)} onChange={(e) => setCepInput(e.target.value)} className="h-10 flex-1 rounded-md border px-3" />
              <Button type="submit" variant="outline">Calcular</Button>
            </div>
            {cepMsg && <p className="mt-2 text-sm text-muted-foreground" role="status">{cepMsg}</p>}
          </form>
        </div>
      </div>

      <section className="mt-10 grid gap-6 lg:grid-cols-2">
        <div><h2 className="text-lg font-bold">Descrição</h2><p className="mt-2 text-sm leading-relaxed">{p.description}</p></div>
        {Object.keys(p.specs).length > 0 && (
          <div>
            <h2 className="text-lg font-bold">Características</h2>
            <dl className="mt-2 divide-y rounded-lg border text-sm">
              {Object.entries(p.specs).map(([k, val]) => (
                <div key={k} className="grid grid-cols-2 gap-2 p-2"><dt className="font-medium">{k}</dt><dd>{val}</dd></div>
              ))}
            </dl>
          </div>
        )}
        {p.ingredients && <div><h2 className="text-lg font-bold">Ingredientes</h2><p className="mt-2 text-sm">{p.ingredients}</p></div>}
        {p.nutrition && <div><h2 className="text-lg font-bold">Informações nutricionais</h2><p className="mt-2 text-sm">{p.nutrition}</p></div>}
        {p.usage && <div><h2 className="text-lg font-bold">Recomendações de uso</h2><p className="mt-2 text-sm">{p.usage}</p></div>}
        {p.warnings && <div><h2 className="text-lg font-bold">Advertências</h2><p className="mt-2 text-sm">{p.warnings}</p></div>}
      </section>

      {relatedProducts(p).length > 0 && (
        <section className="mt-10"><h2 className="mb-4 text-xl font-extrabold">Produtos relacionados</h2><ProductGrid products={relatedProducts(p)} /></section>
      )}

      <div className="fixed inset-x-0 bottom-0 z-30 flex items-center gap-3 border-t bg-background p-3 lg:hidden">
        <div className="min-w-0 flex-1"><p className="truncate text-xs text-muted-foreground">{v.label}</p><p className="font-bold">{formatBRL(effectivePrice(v) * qty)}</p></div>
        <Button className="h-11" disabled={v.stock === 0} onClick={buy}>Adicionar</Button>
      </div>
    </div>
  );
}
