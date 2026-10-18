import { Link } from "@tanstack/react-router";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useShop } from "@/lib/shop-state";
import { effectivePrice, getVariant } from "@/lib/catalog";
import { formatBRL } from "@/lib/format";

export function CartLines({ compact = false }: { compact?: boolean }) {
  const { lines, setQty, remove } = useShop();
  if (!lines.length) return <p className="py-8 text-center text-muted-foreground">Seu carrinho está vazio.</p>;
  return (
    <ul className="divide-y">
      {lines.map((l) => {
        const f = getVariant(l.variantId);
        if (!f) return null;
        const { product, variant } = f;
        return (
          <li key={l.variantId} className="flex gap-3 py-3">
            <img src={product.image} alt="" width={72} height={72} loading="lazy" className="h-18 w-18 shrink-0 rounded border object-contain" />
            <div className="min-w-0 flex-1">
              <Link to="/produto/$slug" params={{ slug: product.slug }} className="line-clamp-2 text-sm font-medium hover:underline">
                {product.name}
              </Link>
              <p className="text-xs text-muted-foreground">{variant.label}</p>
              <div className="mt-2 flex items-center justify-between gap-2">
                <div className="flex items-center rounded-md border">
                  <button className="p-2" aria-label="Diminuir quantidade" onClick={() => setQty(l.variantId, l.qty - 1)}><Minus className="h-4 w-4" /></button>
                  <span className="w-8 text-center text-sm" aria-live="polite">{l.qty}</span>
                  <button className="p-2 disabled:opacity-40" aria-label="Aumentar quantidade" disabled={l.qty >= variant.stock} onClick={() => setQty(l.variantId, l.qty + 1)}><Plus className="h-4 w-4" /></button>
                </div>
                <span className="font-semibold">{formatBRL(effectivePrice(variant) * l.qty)}</span>
                {!compact && (
                  <button className="p-2 text-muted-foreground hover:text-destructive" aria-label="Remover item" onClick={() => remove(l.variantId)}>
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export function CartDrawer() {
  const { drawerOpen, setDrawerOpen, subtotal, count } = useShop();
  return (
    <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
      <SheetContent className="flex w-full flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Carrinho ({count})</SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-4"><CartLines /></div>
        {count > 0 && (
          <div className="border-t p-4">
            <div className="mb-3 flex justify-between font-semibold"><span>Subtotal</span><span>{formatBRL(subtotal)}</span></div>
            <div className="grid gap-2">
              <Button asChild onClick={() => setDrawerOpen(false)}><Link to="/checkout">Finalizar compra</Link></Button>
              <Button asChild variant="outline" onClick={() => setDrawerOpen(false)}><Link to="/carrinho">Ver carrinho</Link></Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
