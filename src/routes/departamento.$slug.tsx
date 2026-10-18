import { createFileRoute, notFound } from "@tanstack/react-router";
import { Listing, parseListingSearch } from "@/components/store/Listing";
import { getDepartment, OFFERS_SLUG } from "@/data/departments";
import { seo } from "@/config/store";

export const Route = createFileRoute("/departamento/$slug")({
  validateSearch: parseListingSearch,
  loader: ({ params }) => {
    if (params.slug === OFFERS_SLUG) return { name: "Ofertas" };
    const d = getDepartment(params.slug);
    if (!d) throw notFound();
    return { name: d.name };
  },
  head: ({ loaderData, params }) =>
    loaderData
      ? seo({ title: loaderData.name, description: `Produtos de ${loaderData.name.toLowerCase()} para o seu pet.`, path: `/departamento/${params.slug}` })
      : { meta: [{ title: "Departamento não encontrado" }, { name: "robots", content: "noindex" }] },
  component: Page,
});

function Page() {
  const { slug } = Route.useParams();
  const search = Route.useSearch();
  const { name } = Route.useLoaderData();
  const dept = getDepartment(slug);
  const cat = dept?.categories.find((c) => c.slug === search.categoria);
  return (
    <Listing
      key={slug}
      to="/departamento/$slug"
      department={slug}
      search={search}
      title={cat ? `${cat.name} para ${name.toLowerCase()}` : name}
      crumbs={[{ label: name }, ...(cat ? [{ label: cat.name }] : [])]}
    />
  );
}
