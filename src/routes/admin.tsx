import { createFileRoute } from "@tanstack/react-router";
import { DemoNotice } from "@/components/store/Footer";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Administração" }, { name: "description", content: "Área administrativa da loja." }, { name: "robots", content: "noindex, nofollow" }] }),
  component: Admin,
});

const areas = ["Produtos e variantes", "Categorias e marcas", "Preços e disponibilidade", "Imagens", "Banners e destaques da home", "Pedidos", "Configurações da loja", "Importação de catálogo (JSON/CSV)"];

function Admin() {
  return (
    <div className="mx-auto max-w-3xl px-3 py-8">
      <h1 className="text-2xl font-extrabold">Administração</h1>
      <div className="mt-3">
        <DemoNotice>área restrita. O acesso de administradores será liberado após a configuração do login seguro.</DemoNotice>
      </div>
      <ul className="mt-6 grid gap-3 sm:grid-cols-2">
        {areas.map((a) => <li key={a} className="rounded-lg border p-4 text-sm font-semibold text-muted-foreground">{a}</li>)}
      </ul>
    </div>
  );
}
