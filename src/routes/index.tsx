import { createFileRoute, Link } from "@tanstack/react-router";
import { Bird, Cat, Dog, Fish, Rabbit, Sparkles, Pill, Tag } from "lucide-react";
import banner from "@/assets/store-banner.png.asset.json";
import { seo, storeConfig } from "@/config/store";
import { departments, OFFERS_SLUG } from "@/data/departments";
import { getAllProducts, hasSale } from "@/lib/catalog";
import { ProductGrid } from "@/components/store/ProductCard";
import { BrandCarousel } from "@/components/store/BrandCarousel";

export const Route = createFileRoute("/")({
  head: () =>
    seo({
      title: "Produtos para cães, gatos e outros pets",
      description: `${storeConfig.name}: ração, petiscos, brinquedos, higiene e acessórios para o seu pet.`,
      path: "/",
    }),
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

function Section({
  title,
  to,
  children,
}: {
  title: string;
  to?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mx-auto mt-10 max-w-7xl px-3">
      <div className="mb-4 flex items-end justify-between">
        <h2 className="text-xl font-extrabold text-foreground sm:text-2xl">{title}</h2>
        {to && (
          <Link
            to="/departamento/$slug"
            params={{ slug: to }}
            className="text-sm font-semibold text-primary hover:underline"
          >
            Ver todos
          </Link>
        )}
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
        <h1 className="sr-only">Petz Store — Tudo para o seu pet. Mais carinho todos os dias.</h1>
        <Link
          to="/departamento/$slug"
          params={{ slug: "cachorros" }}
          aria-label="Comprar agora na Petz Store"
        >
          <img
            src={banner.url}
            alt="Petz Store. Tudo para o seu pet. Mais carinho todos os dias. Ração, higiene, brinquedos e acessórios em um só lugar. Comprar agora."
            width={1920}
            height={640}
            className="block h-auto w-full"
            fetchPriority="high"
          />
        </Link>
      </section>

      <nav aria-label="Comprar por pet" className="mx-auto mt-6 max-w-7xl px-3">
        <ul className="grid grid-cols-4 gap-2 sm:grid-cols-8">
          {shortcuts.map(({ slug, label, Icon }) => (
            <li key={slug}>
              <Link
                to="/departamento/$slug"
                params={{ slug }}
                className="flex flex-col items-center gap-2 rounded-lg p-2 text-center text-xs font-semibold hover:bg-secondary sm:text-sm"
              >
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary text-primary sm:h-16 sm:w-16">
                  <Icon className="h-7 w-7" aria-hidden />
                </span>
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {offers.length > 0 && (
        <Section title="Ofertas" to={OFFERS_SLUG}>
          <ProductGrid products={offers} />
        </Section>
      )}
      {featured.length > 0 && (
        <Section title="Destaques">
          <ProductGrid products={featured} />
        </Section>
      )}

      <section className="mx-auto mt-10 grid max-w-7xl gap-3 px-3 sm:grid-cols-2">
        <Link
          to="/departamento/$slug"
          params={{ slug: "gatos" }}
          className="rounded-lg bg-accent p-6 text-accent-foreground"
        >
          <p className="text-sm font-semibold">Gatos</p>
          <p className="text-2xl font-extrabold">Conforto e diversão felina</p>
        </Link>
        <Link
          to="/departamento/$slug"
          params={{ slug: "higiene-beleza" }}
          className="rounded-lg bg-primary p-6 text-primary-foreground"
        >
          <p className="text-sm font-semibold">Higiene e beleza</p>
          <p className="text-2xl font-extrabold">Banho e cuidado em casa</p>
        </Link>
      </section>

      {departments.slice(0, 2).map((d) => {
        const items = all.filter((p) => p.department === d.slug).slice(0, 5);
        return items.length ? (
          <Section key={d.slug} title={d.name} to={d.slug}>
            <ProductGrid products={items} />
          </Section>
        ) : null;
      })}

      {all.length === 0 && (
        <section className="mx-auto mt-10 max-w-7xl px-3">
          <p className="rounded-lg border bg-muted p-8 text-center text-muted-foreground">
            Nenhum produto cadastrado ainda.
          </p>
        </section>
      )}
      <BrandCarousel />
    </>
  );
}
