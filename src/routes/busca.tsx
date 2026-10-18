import { createFileRoute } from "@tanstack/react-router";
import { Listing, parseListingSearch } from "@/components/store/Listing";
import { seo } from "@/config/store";

export const Route = createFileRoute("/busca")({
  validateSearch: parseListingSearch,
  head: () => {
    const h = seo({ title: "Busca de produtos", description: "Encontre produtos para o seu pet por nome, marca ou categoria." });
    return { ...h, meta: [...h.meta.filter((m) => m.name !== "robots"), { name: "robots", content: "noindex, follow" }] };
  },
  component: Page,
});

function Page() {
  const search = Route.useSearch();
  return (
    <Listing
      to="/busca"
      search={search}
      title={search.q ? `Resultados para “${search.q}”` : "Todos os produtos"}
      crumbs={[{ label: "Busca" }]}
    />
  );
}
