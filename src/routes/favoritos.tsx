import { createFileRoute } from "@tanstack/react-router";
import { seo } from "@/config/store";
import { useShop } from "@/lib/shop-state";
import { getAllProducts } from "@/lib/catalog";
import { ProductGrid } from "@/components/store/ProductCard";

export const Route = createFileRoute("/favoritos")({
  head: () => seo({ title: "Favoritos", description: "Produtos que você salvou." }),
  component: Favs,
});

function Favs() {
  const { favorites } = useShop();
  const items = getAllProducts().filter((p) => favorites.includes(p.id));
  return (
    <div className="mx-auto max-w-7xl px-3 py-6">
      <h1 className="mb-4 text-2xl font-extrabold">Favoritos</h1>
      {items.length ? <ProductGrid products={items} /> : <p className="text-muted-foreground">Você ainda não favoritou produtos.</p>}
    </div>
  );
}
