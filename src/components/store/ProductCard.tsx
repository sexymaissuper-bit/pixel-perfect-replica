import { Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import type { Product } from "@/data/types";
import { effectivePrice, hasSale, inStock, minPrice } from "@/lib/catalog";
import { formatBRL } from "@/lib/format";
import { useShop } from "@/lib/shop-state";
import { Button } from "@/components/ui/button";

export function ProductCard({ product }: { product: Product }) {
  const { favorites, toggleFavorite, add, setDrawerOpen } = useShop();
  const fav = favorites.includes(product.id);
  const multi = product.variants.length > 1;
  const single = product.variants[0]!;
  const available = inStock(product);
  const sale = !multi && single.salePrice != null && single.salePrice < single.price;

  return (
    <article className="group relative flex flex-col rounded-lg border bg-card p-3 shadow-card transition-shadow hover:border-primary/40">
      <button
        type="button"
        onClick={() => toggleFavorite(product.id)}
        aria-pressed={fav}
        aria-label={fav ? "Remover dos favoritos" : "Adicionar aos favoritos"}
        className="absolute right-2 top-2 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-background/90 text-primary"
      >
        <Heart className={fav ? "h-5 w-5 fill-current" : "h-5 w-5"} />
      </button>
      <Link to="/produto/$slug" params={{ slug: product.slug }} className="flex flex-1 flex-col">
        <div className="aspect-square overflow-hidden rounded-md bg-muted">
          <img src={product.image} alt={product.name} loading="lazy" width={400} height={400} className="h-full w-full object-contain" />
        </div>
        <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{product.brand}</p>
        <h3 className="mt-1 line-clamp-2 text-sm font-medium text-foreground">{product.name}</h3>
        {multi && <p className="mt-1 text-xs text-muted-foreground">{product.variants.length} opções</p>}
        <div className="mt-auto pt-2">
          {sale && <p className="text-xs text-muted-foreground line-through">{formatBRL(single.price)}</p>}
          <p className={`text-lg font-bold ${hasSale(product) ? "text-sale" : "text-foreground"}`}>
            {multi && <span className="text-xs font-normal text-muted-foreground">a partir de </span>}
            {formatBRL(multi ? minPrice(product) : effectivePrice(single))}
          </p>
          {!available && <p className="text-xs font-medium text-destructive">Indisponível</p>}
        </div>
      </Link>
      {multi ? (
        <Button asChild variant="outline" className="mt-3 w-full">
          <Link to="/produto/$slug" params={{ slug: product.slug }}>Escolher opção</Link>
        </Button>
      ) : (
        <Button
          className="mt-3 w-full"
          disabled={!available}
          onClick={() => {
            add(single.id);
            toast.success("Adicionado ao carrinho");
            setDrawerOpen(true);
          }}
        >
          {available ? "Comprar" : "Indisponível"}
        </Button>
      )}
    </article>
  );
}

export function ProductGrid({ products }: { products: Product[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
