import { createFileRoute, notFound } from "@tanstack/react-router";
import { institutionalPages } from "@/data/institutional";
import { seo, storeConfig } from "@/config/store";
import { ContactLinks } from "@/components/store/ContactLinks";

export const Route = createFileRoute("/institucional/$slug")({
  loader: ({ params }) => {
    const p = institutionalPages.find((x) => x.slug === params.slug);
    if (!p) throw notFound();
    return p;
  },
  head: ({ loaderData }) =>
    loaderData ? seo({ title: loaderData.title, description: `${loaderData.title} — ${storeConfig.name}.`, path: `/institucional/${loaderData.slug}` }) : { meta: [{ title: "Página não encontrada" }, { name: "robots", content: "noindex" }] },
  component: Page,
});

function Page() {
  const p = Route.useLoaderData();
  return (
    <div className="mx-auto max-w-3xl px-3 py-8">
      <h1 className="text-2xl font-extrabold">{p.title}</h1>
      <p className="mt-4 rounded-lg border bg-muted p-4 text-sm">{p.body}</p>
      {p.slug === "atendimento" && <ul className="mt-4 space-y-3 text-primary"><ContactLinks /></ul>}
    </div>
  );
}
