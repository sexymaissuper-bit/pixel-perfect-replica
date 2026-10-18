import { createFileRoute } from "@tanstack/react-router";
import { storeConfig } from "@/config/store";
import { departments } from "@/data/departments";
import { institutionalPages } from "@/data/institutional";
import { getAllProducts } from "@/lib/catalog";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: ({ request }) => {
        const base = (storeConfig.siteUrl || new URL(request.url).origin).replace(/\/$/, "");
        const paths = [
          "/",
          ...departments.map((d) => `/departamento/${d.slug}`),
          ...getAllProducts().map((p) => `/produto/${p.slug}`),
          ...institutionalPages.map((p) => `/institucional/${p.slug}`),
        ];
        const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${paths.map((p) => `  <url><loc>${base}${p}</loc></url>`).join("\n")}\n</urlset>`;
        return new Response(xml, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
      },
    },
  },
});
