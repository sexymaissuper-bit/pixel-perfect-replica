import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ATTRIBUTE_LABELS, queryProducts, type SortKey } from "@/lib/catalog";
import { getDepartment } from "@/data/departments";
import { ProductGrid } from "./ProductCard";

export type ListingSearch = {
  q?: string;
  categoria?: string;
  marca?: string[];
  min?: number;
  max?: number;
  especie?: string[];
  idade?: string[];
  porte?: string[];
  ordem?: SortKey;
  pagina?: number;
};

const arr = (v: unknown) => (Array.isArray(v) ? v.map(String) : typeof v === "string" && v ? [v] : undefined);
const num = (v: unknown) => (v === undefined || v === "" || isNaN(Number(v)) ? undefined : Number(v));
const SORTS: SortKey[] = ["relevancia", "menor-preco", "maior-preco", "novidades"];

export function parseListingSearch(s: Record<string, unknown>): ListingSearch {
  return {
    q: typeof s.q === "string" ? s.q.slice(0, 100) : undefined,
    categoria: typeof s.categoria === "string" ? s.categoria : undefined,
    marca: arr(s.marca),
    min: num(s.min),
    max: num(s.max),
    especie: arr(s.especie),
    idade: arr(s.idade),
    porte: arr(s.porte),
    ordem: SORTS.includes(s.ordem as SortKey) ? (s.ordem as SortKey) : undefined,
    pagina: num(s.pagina),
  };
}

type Props = { search: ListingSearch; department?: string; title: string; crumbs: { label: string; to?: string }[]; to: "/busca" | "/departamento/$slug" };

export function Listing({ search, department, title, crumbs, to }: Props) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const result = queryProducts({
    q: search.q, department, category: search.categoria, brands: search.marca, min: search.min, max: search.max,
    attrs: { especie: search.especie ?? [], idade: search.idade ?? [], porte: search.porte ?? [] },
    sort: search.ordem, page: search.pagina,
  });
  const dept = department ? getDepartment(department) : undefined;

  const update = (patch: Partial<ListingSearch>) =>
    navigate({ to, params: department ? { slug: department } : undefined, search: (prev: ListingSearch) => ({ ...prev, ...patch, pagina: patch.pagina }) } as never);

  const toggle = (key: "marca" | "especie" | "idade" | "porte", val: string) => {
    const cur = search[key] ?? [];
    update({ [key]: cur.includes(val) ? cur.filter((x) => x !== val) : [...cur, val] });
  };

  const filters = (
    <div className="space-y-6 text-sm">
      {dept && (
        <fieldset>
          <legend className="mb-2 font-bold">Categoria</legend>
          <ul className="space-y-1">
            <li><button className={!search.categoria ? "font-semibold text-primary" : ""} onClick={() => update({ categoria: undefined })}>Todas</button></li>
            {dept.categories.filter((c) => result.facets.categories.includes(c.slug) || search.categoria === c.slug).map((c) => (
              <li key={c.slug}><button className={search.categoria === c.slug ? "font-semibold text-primary" : ""} onClick={() => update({ categoria: c.slug })}>{c.name}</button></li>
            ))}
          </ul>
        </fieldset>
      )}
      {result.facets.brands.length > 0 && (
        <fieldset>
          <legend className="mb-2 font-bold">Marca</legend>
          {result.facets.brands.map((b) => (
            <label key={b} className="flex min-h-9 items-center gap-2">
              <input type="checkbox" className="h-4 w-4 accent-primary" checked={search.marca?.includes(b) ?? false} onChange={() => toggle("marca", b)} /> {b}
            </label>
          ))}
        </fieldset>
      )}
      {(["especie", "idade", "porte"] as const).map((k) =>
        result.facets.attrs[k]?.length ? (
          <fieldset key={k}>
            <legend className="mb-2 font-bold">{ATTRIBUTE_LABELS[k]}</legend>
            {result.facets.attrs[k].map((v) => (
              <label key={v} className="flex min-h-9 items-center gap-2">
                <input type="checkbox" className="h-4 w-4 accent-primary" checked={search[k]?.includes(v) ?? false} onChange={() => toggle(k, v)} /> {v}
              </label>
            ))}
          </fieldset>
        ) : null,
      )}
      <fieldset>
        <legend className="mb-2 font-bold">Preço (R$)</legend>
        <form className="flex items-end gap-2" onSubmit={(e) => {
          e.preventDefault();
          const f = new FormData(e.currentTarget);
          update({ min: num(f.get("min")), max: num(f.get("max")) });
        }}>
          <label className="flex-1"><span className="sr-only">Preço mínimo</span><input name="min" inputMode="decimal" defaultValue={search.min} placeholder="Mín." className="h-10 w-full rounded-md border px-2" /></label>
          <label className="flex-1"><span className="sr-only">Preço máximo</span><input name="max" inputMode="decimal" defaultValue={search.max} placeholder="Máx." className="h-10 w-full rounded-md border px-2" /></label>
          <Button type="submit" size="sm" variant="outline" className="h-10">OK</Button>
        </form>
      </fieldset>
      <Button variant="ghost" size="sm" onClick={() => navigate({ to, params: department ? { slug: department } : undefined, search: { q: search.q } } as never)}>Limpar filtros</Button>
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-3 py-4">
      <nav aria-label="Trilha de navegação" className="text-xs text-muted-foreground">
        <ol className="flex flex-wrap gap-1">
          <li><Link to="/" className="hover:underline">Início</Link> /</li>
          {crumbs.map((c, i) => <li key={i}>{c.label}{i < crumbs.length - 1 && " /"}</li>)}
        </ol>
      </nav>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold">{title}</h1>
          <p className="text-sm text-muted-foreground" aria-live="polite">{result.total} {result.total === 1 ? "produto" : "produtos"}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="lg:hidden" onClick={() => setOpen(true)}><SlidersHorizontal className="h-4 w-4" /> Filtros</Button>
          <label className="text-sm"><span className="sr-only">Ordenar por</span>
            <select value={search.ordem ?? "relevancia"} onChange={(e) => update({ ordem: e.target.value as SortKey })} className="h-10 rounded-md border bg-background px-2">
              <option value="relevancia">Relevância</option>
              <option value="menor-preco">Menor preço</option>
              <option value="maior-preco">Maior preço</option>
              <option value="novidades">Novidades</option>
            </select>
          </label>
        </div>
      </div>
      <div className="mt-4 grid gap-6 lg:grid-cols-[220px_1fr]">
        <aside className="hidden lg:block" aria-label="Filtros">{filters}</aside>
        <div>
          {result.total === 0 ? (
            <div className="rounded-lg border p-10 text-center">
              <p className="font-semibold">Nenhum produto encontrado.</p>
              <p className="mt-1 text-sm text-muted-foreground">Tente outros termos ou remova filtros.</p>
            </div>
          ) : (
            <ProductGrid products={result.items} />
          )}
          {result.pages > 1 && (
            <nav aria-label="Paginação" className="mt-6 flex justify-center gap-2">
              {Array.from({ length: result.pages }, (_, i) => i + 1).map((n) => (
                <Button key={n} size="sm" variant={n === result.page ? "default" : "outline"} aria-current={n === result.page ? "page" : undefined} onClick={() => update({ pagina: n })}>{n}</Button>
              ))}
            </nav>
          )}
        </div>
      </div>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-[85vw] max-w-sm overflow-y-auto">
          <SheetHeader><SheetTitle>Filtros</SheetTitle></SheetHeader>
          <div className="px-4 pb-6">{filters}</div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
