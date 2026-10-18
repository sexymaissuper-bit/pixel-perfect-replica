import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Pause, Play } from "lucide-react";
import { getBrands } from "@/lib/catalog";
import { selectBrandLogos } from "@/lib/brand-logos";

export function BrandCarousel() {
  const [paused, setPaused] = useState(false);
  const [failed, setFailed] = useState<string[]>([]);
  const brands = selectBrandLogos(getBrands()).filter((brand) => !failed.includes(brand.name));
  if (!brands.length) return null;

  return (
    <section className="mx-auto mt-10 max-w-7xl px-3" aria-labelledby="brand-heading">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 id="brand-heading" className="text-xl font-extrabold sm:text-2xl">
          Marcas no catálogo
        </h2>
        <button
          type="button"
          onClick={() => setPaused((value) => !value)}
          aria-label={paused ? "Retomar carrossel de marcas" : "Pausar carrossel de marcas"}
          aria-pressed={paused}
          className="flex h-10 w-10 items-center justify-center rounded-full border text-primary hover:bg-secondary motion-reduce:hidden"
        >
          {paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
        </button>
      </div>
      <div className="brand-viewport" role="region" aria-label="Marcas disponíveis" aria-live="off">
        <div className="brand-track" data-paused={paused}>
          {[false, true].map((duplicate) => (
            <ul
              key={String(duplicate)}
              className="brand-group"
              aria-hidden={duplicate || undefined}
            >
              {brands.map((brand) => (
                <li key={brand.name} className="shrink-0">
                  <Link
                    to="/busca"
                    search={{ q: brand.name }}
                    tabIndex={duplicate ? -1 : 0}
                    aria-label={`Ver produtos ${brand.name}`}
                    className="flex h-28 w-40 items-center justify-center rounded-xl border bg-white p-5 transition-colors hover:border-primary"
                    style={brand.background ? { backgroundColor: brand.background } : undefined}
                  >
                    <img
                      src={brand.image}
                      alt={brand.name}
                      width={120}
                      height={64}
                      loading="lazy"
                      decoding="async"
                      className="max-h-16 max-w-full object-contain"
                      onError={() =>
                        setFailed((previous) =>
                          previous.includes(brand.name) ? previous : [...previous, brand.name],
                        )
                      }
                    />
                  </Link>
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>
    </section>
  );
}
