import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronDown, Heart, MapPin, Menu, Search, ShoppingCart, User } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { departments, OFFERS_SLUG } from "@/data/departments";
import { useShop } from "@/lib/shop-state";
import { formatCep, onlyDigits } from "@/lib/format";
import { Logo } from "./Logo";

function SearchBox({ id }: { id: string }) {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  return (
    <form
      role="search"
      className="relative w-full"
      onSubmit={(e) => {
        e.preventDefault();
        if (q.trim()) navigate({ to: "/busca", search: { q: q.trim() } });
      }}
    >
      <label htmlFor={id} className="sr-only">Buscar produtos</label>
      <input
        id={id}
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="O que seu pet precisa hoje?"
        className="h-11 w-full rounded-full border bg-muted pl-4 pr-12 text-sm text-foreground placeholder:text-muted-foreground"
      />
      <button type="submit" aria-label="Buscar" className="absolute right-1 top-1 flex h-9 w-9 items-center justify-center rounded-full bg-accent text-accent-foreground">
        <Search className="h-4 w-4" />
      </button>
    </form>
  );
}

function CepButton() {
  const { cep, setCep } = useShop();
  const [open, setOpen] = useState(false);
  const [val, setVal] = useState("");
  return (
    <div className="relative hidden lg:block">
      <button onClick={() => { setVal(cep); setOpen((o) => !o); }} className="flex items-center gap-1 text-left text-xs text-primary" aria-expanded={open}>
        <MapPin className="h-5 w-5" aria-hidden />
        <span>{cep ? <>Entregar em<br /><b>{formatCep(cep)}</b></> : <>Informe<br /><b>seu CEP</b></>}</span>
      </button>
      {open && (
        <form
          className="absolute left-0 top-full z-50 mt-2 w-64 rounded-lg border bg-popover p-3 text-popover-foreground shadow-card"
          onSubmit={(e) => { e.preventDefault(); if (onlyDigits(val).length === 8) { setCep(onlyDigits(val)); setOpen(false); } }}
        >
          <label htmlFor="cep-h" className="text-sm font-medium">CEP de entrega</label>
          <input id="cep-h" inputMode="numeric" value={formatCep(val)} onChange={(e) => setVal(e.target.value)} placeholder="00000-000" className="mt-1 h-10 w-full rounded-md border px-3 text-sm" />
          <button className="mt-2 h-9 w-full rounded-md bg-primary text-sm font-semibold text-primary-foreground">Salvar</button>
        </form>
      )}
    </div>
  );
}

export function Header() {
  const { count, setDrawerOpen } = useShop();
  const [menu, setMenu] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b bg-background text-primary shadow-card">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-2 px-3 py-2 lg:flex-nowrap lg:gap-6 lg:py-4">
        <button className="lg:hidden" aria-label="Abrir menu de departamentos" onClick={() => setMenu(true)}><Menu className="h-6 w-6" /></button>
        <div className="order-first flex w-full justify-center py-1 lg:hidden"><Logo compact /></div>
        <div className="hidden lg:block"><Logo /></div>
        <div className="hidden flex-1 lg:block"><SearchBox id="search-desktop" /></div>
        <CepButton />
        <nav aria-label="Atalhos" className="ml-auto flex items-center gap-1 lg:ml-0">
          <Link to="/conta" className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-secondary" aria-label="Minha conta"><User className="h-5 w-5" /></Link>
          <Link to="/favoritos" className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-secondary" aria-label="Favoritos"><Heart className="h-5 w-5" /></Link>
          <button onClick={() => setDrawerOpen(true)} className="relative flex h-11 w-11 items-center justify-center rounded-full hover:bg-secondary" aria-label={`Carrinho com ${count} itens`}>
            <ShoppingCart className="h-5 w-5" />
            {count > 0 && <span className="absolute right-0 top-0 min-w-5 rounded-full bg-accent px-1 text-center text-xs font-bold text-accent-foreground">{count}</span>}
          </button>
        </nav>
      </div>
      <div className="px-3 pb-2 lg:hidden"><SearchBox id="search-mobile" /></div>
      <nav aria-label="Departamentos" className="hidden border-t bg-background lg:block">
        <ul className="mx-auto flex max-w-7xl items-center gap-1 px-3">
          {departments.map((d) => (
            <li key={d.slug} className="group relative">
              <Link to="/departamento/$slug" params={{ slug: d.slug }} className="flex items-center gap-1 px-3 py-2.5 text-sm font-semibold hover:bg-secondary">
                {d.name} <ChevronDown className="h-3.5 w-3.5" aria-hidden />
              </Link>
              <div className="invisible absolute left-0 top-full z-50 min-w-56 rounded-b-lg border bg-popover p-2 text-popover-foreground opacity-0 shadow-card group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
                {d.categories.map((c) => (
                  <Link key={c.slug} to="/departamento/$slug" params={{ slug: d.slug }} search={{ categoria: c.slug }} className="block rounded px-3 py-2 text-sm hover:bg-secondary">
                    {c.name}
                  </Link>
                ))}
              </div>
            </li>
          ))}
          <li><Link to="/departamento/$slug" params={{ slug: OFFERS_SLUG }} className="block px-3 py-2.5 text-sm font-bold text-sale">Ofertas</Link></li>
        </ul>
      </nav>

      <Sheet open={menu} onOpenChange={setMenu}>
        <SheetContent side="left" className="w-[85vw] max-w-sm overflow-y-auto">
          <SheetHeader><SheetTitle>Departamentos</SheetTitle></SheetHeader>
          <ul className="px-4 pb-6">
            {departments.map((d) => (
              <li key={d.slug} className="border-b py-2">
                <Link to="/departamento/$slug" params={{ slug: d.slug }} onClick={() => setMenu(false)} className="block py-2 font-semibold">{d.name}</Link>
                <ul className="pl-3">
                  {d.categories.map((c) => (
                    <li key={c.slug}>
                      <Link to="/departamento/$slug" params={{ slug: d.slug }} search={{ categoria: c.slug }} onClick={() => setMenu(false)} className="block py-2 text-sm text-muted-foreground">{c.name}</Link>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
            <li className="py-3"><Link to="/departamento/$slug" params={{ slug: OFFERS_SLUG }} onClick={() => setMenu(false)} className="font-bold text-sale">Ofertas</Link></li>
          </ul>
        </SheetContent>
      </Sheet>
    </header>
  );
}
