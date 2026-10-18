import { createFileRoute, Link } from "@tanstack/react-router";
import { seo } from "@/config/store";
import { useShop } from "@/lib/shop-state";
import { CartLines } from "@/components/store/CartDrawer";
import { Button } from "@/components/ui/button";
import { formatBRL } from "@/lib/format";

export const Route = createFileRoute("/carrinho")({
  head: () => seo({ title: "Carrinho", description: "Revise os produtos do seu carrinho." }),
  component: Cart,
});

function Cart() {
  const { count, subtotal, clear } = useShop();
  return (
    <div className="mx-auto max-w-5xl px-3 py-6">
      <h1 className="text-2xl font-extrabold">Carrinho</h1>
      <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="rounded-lg border p-4">
          <CartLines />
          {count > 0 && <Button variant="ghost" size="sm" onClick={clear}>Esvaziar carrinho</Button>}
        </div>
        <aside className="h-fit rounded-lg border p-4">
          <h2 className="font-bold">Resumo</h2>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between"><dt>Produtos ({count})</dt><dd>{formatBRL(subtotal)}</dd></div>
            <div className="flex justify-between"><dt>Frete</dt><dd className="text-muted-foreground">A calcular</dd></div>
            <div className="flex justify-between border-t pt-2 text-base font-bold"><dt>Total</dt><dd>{formatBRL(subtotal)}</dd></div>
          </dl>
          <Button asChild className="mt-4 w-full" disabled={!count}>
            {count ? <Link to="/checkout">Continuar</Link> : <span>Continuar</span>}
          </Button>
          <Button asChild variant="outline" className="mt-2 w-full"><Link to="/">Continuar comprando</Link></Button>
        </aside>
      </div>
    </div>
  );
}
