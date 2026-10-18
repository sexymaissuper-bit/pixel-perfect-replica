/** Estado local do carrinho/favoritos/CEP (persistido em localStorage — modo demonstrativo). */
import type React from "react";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { getVariant, effectivePrice } from "./catalog";

export type CartLine = { variantId: string; qty: number };
type Ctx = {
  lines: CartLine[];
  count: number;
  subtotal: number;
  add: (variantId: string, qty?: number) => void;
  setQty: (variantId: string, qty: number) => void;
  remove: (variantId: string) => void;
  clear: () => void;
  favorites: string[];
  toggleFavorite: (productId: string) => void;
  cep: string;
  setCep: (c: string) => void;
  drawerOpen: boolean;
  setDrawerOpen: (o: boolean) => void;
};

// Mantém o mesmo contexto entre recargas de módulo (HMR) para evitar provider/consumer divergentes.
const g = globalThis as unknown as { __mlpShopCtx?: React.Context<Ctx | null> };
const ShopCtx = (g.__mlpShopCtx ??= createContext<Ctx | null>(null));
const KEY = "mlp:v1";

export function ShopProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [cep, setCep] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const s = JSON.parse(raw);
        setLines((s.lines ?? []).filter((l: CartLine) => getVariant(l.variantId)));
        setFavorites(s.favorites ?? []);
        setCep(s.cep ?? "");
      }
    } catch {
      /* ignora estado corrompido */
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) localStorage.setItem(KEY, JSON.stringify({ lines, favorites, cep }));
  }, [lines, favorites, cep, loaded]);

  const clampQty = (variantId: string, qty: number) => {
    const stock = getVariant(variantId)?.variant.stock ?? 0;
    return Math.max(0, Math.min(qty, stock));
  };

  const add = useCallback((variantId: string, qty = 1) => {
    setLines((ls) => {
      const cur = ls.find((l) => l.variantId === variantId);
      const next = clampQty(variantId, (cur?.qty ?? 0) + qty);
      if (next === 0) return ls;
      return cur ? ls.map((l) => (l.variantId === variantId ? { ...l, qty: next } : l)) : [...ls, { variantId, qty: next }];
    });
  }, []);
  const setQty = useCallback((variantId: string, qty: number) => {
    setLines((ls) =>
      ls.flatMap((l) => (l.variantId === variantId ? (clampQty(variantId, qty) > 0 ? [{ ...l, qty: clampQty(variantId, qty) }] : []) : [l])),
    );
  }, []);
  const remove = useCallback((variantId: string) => setLines((ls) => ls.filter((l) => l.variantId !== variantId)), []);
  const clear = useCallback(() => setLines([]), []);
  const toggleFavorite = useCallback(
    (id: string) => setFavorites((f) => (f.includes(id) ? f.filter((x) => x !== id) : [...f, id])),
    [],
  );

  const value = useMemo<Ctx>(() => {
    const subtotal = lines.reduce((s, l) => {
      const v = getVariant(l.variantId);
      return s + (v ? effectivePrice(v.variant) * l.qty : 0);
    }, 0);
    return {
      lines, count: lines.reduce((s, l) => s + l.qty, 0), subtotal, add, setQty, remove, clear,
      favorites, toggleFavorite, cep, setCep, drawerOpen, setDrawerOpen,
    };
  }, [lines, favorites, cep, drawerOpen, add, setQty, remove, clear, toggleFavorite]);

  return <ShopCtx.Provider value={value}>{children}</ShopCtx.Provider>;
}

export function useShop() {
  const c = useContext(ShopCtx);
  if (!c) throw new Error("useShop fora do ShopProvider");
  return c;
}
