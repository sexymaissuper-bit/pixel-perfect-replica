import { createFileRoute, Link } from "@tanstack/react-router";
import { Bird, Cat, Dog, Fish, Rabbit, Sparkles, Pill, Tag } from "lucide-react";
import hero from "@/assets/hero.jpg";
import { seo, storeConfig } from "@/config/store";
import { departments, OFFERS_SLUG } from "@/data/departments";
import { getAllProducts, getBrands, hasSale } from "@/lib/catalog";
import { ProductGrid } from "@/components/store/ProductCard";

export const Route = createFileRoute("/")({
  head: () => seo({ title: "Produtos para cães, gatos e outros pets", description: `${storeConfig.name}: ração, petiscos, brinquedos, higiene e acessórios para o seu pet.`, path: "/" }),
  component: Home,
});

const shortcuts = [
  { slug: "cachorros", label: "Cachorros", Icon: Dog },
  { slug: "gatos", label: "Gatos", Icon: Cat },
  { slug: "passaros", label: "Pássaros", Icon: Bird },
  { slug: "peixes", label: "Peixes", Icon: Fish },
  { slug: "pequenos-animais", label: "Pequenos animais", Icon: Rabbit },
  { slug: "higiene-beleza", label: "Higiene", Icon: Sparkles },
  { slug: "farmacia", label: "Farmácia", Icon: Pill },
  { slug: OFFERS_SLUG, label: "Ofertas", Icon: Tag },
];

function Section({ title, to, children }: { title: string; to?: string; children: React.ReactNode }) {
  return (
    <section className="mx-auto mt-10 max-w-7xl px-3">
      <div className="mb-4 flex items-end justify-between">
        <h2 className="text-xl font-extrabold text-foreground sm:text-2xl">{title}</h2>
        {to && <Link to="/departamento/$slug" params={{ slug: to }} className="text-sm font-semibold text-primary hover:underline">Ver todos</Link>}
      </div>
      {children}
    </section>
  );
}

function Home() {
  const all = getAllProducts();
  const offers = all.filter(hasSale).slice(0, 5);
  const featured = all.filter((p) => p.featured).slice(0, 10);
  return (
    <>
      <section className="relative overflow-hidden bg-muted">
        <img src={hero} alt="Cachorro e gato juntos" width={1600} height={640} className="h-56 w-full object-cover object-right sm:h-80 lg:h-[420px]" />
        <div className="absolute inset-0 mx-auto flex max-w-7xl items-center px-4">
          <div className="max-w-[55%] sm:max-w-md">
            <h1 className="text-2xl font-extrabold leading-tight text-primary-strong sm:text-4xl lg:text-5xl">Tudo para o seu pet</h1>
            <p className="mt-2 text-sm text-foreground sm:text-lg">Ração, higiene, brinquedos e acessórios em um só lugar.</p>
            <Link to="/departamento/$slug" params={{ slug: "cachorros" }} className="mt-4 inline-flex h-11 items-center rounded-full bg-accent px-6 font-bold text-accent-foreground">
              Comprar agora
            </Link>
          </div>
        </div>
      </section>

      <nav aria-label="Comprar por pet" className="mx-auto mt-6 max-w-7xl px-3">
        <ul className="grid grid-cols-4 gap-2 sm:grid-cols-8">
          {shortcuts.map(({ slug, label, Icon }) => (
            <li key={slug}>
              <Link to="/departamento/$slug" params={{ slug }} className="flex flex-col items-center gap-2 rounded-lg p-2 text-center text-xs font-semibold hover:bg-secondary sm:text-sm">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary text-primary sm:h-16 sm:w-16"><Icon className="h-7 w-7" aria-hidden /></span>
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {offers.length > 0 && <Section title="Ofertas" to={OFFERS_SLUG}><ProductGrid products={offers} /></Section>}
      {featured.length > 0 && <Section title="Destaques"><ProductGrid products={featured} /></Section>}

      <section className="mx-auto mt-10 grid max-w-7xl gap-3 px-3 sm:grid-cols-2">
        <Link to="/departamento/$slug" params={{ slug: "gatos" }} className="rounded-lg bg-accent p-6 text-accent-foreground">
          <p className="text-sm font-semibold">Gatos</p><p className="text-2xl font-extrabold">Conforto e diversão felina</p>
        </Link>
        <Link to="/departamento/$slug" params={{ slug: "higiene-beleza" }} className="rounded-lg bg-primary p-6 text-primary-foreground">
          <p className="text-sm font-semibold">Higiene e beleza</p><p className="text-2xl font-extrabold">Banho e cuidado em casa</p>
        </Link>
      </section>

      {departments.slice(0, 2).map((d) => {
        const items = all.filter((p) => p.department === d.slug).slice(0, 5);
        return items.length ? <Section key={d.slug} title={d.name} to={d.slug}><ProductGrid products={items} /></Section> : null;
      })}

      <Section title="Marcas no catálogo">
        <ul className="flex flex-wrap gap-2">
          {getBrands().map((b) => (
            <li key={b}><Link to="/busca" search={{ q: b }} className="inline-block rounded-full border px-4 py-2 text-sm font-medium hover:border-primary">{b}</Link></li>
          ))}
        </ul>
      </Section>
    </>
  );
}
