import { createFileRoute } from "@tanstack/react-router";
import { storeConfig, absoluteUrl } from "@/config/store";

export const Route = createFileRoute("/robots.txt")({
  server: {
    handlers: {
      GET: () => {
        const body = storeConfig.noindex
          ? "User-agent: *\nDisallow: /\n"
          : `User-agent: *\nAllow: /\nDisallow: /checkout\nDisallow: /admin\nDisallow: /conta\n${absoluteUrl("/sitemap.xml") ? `Sitemap: ${absoluteUrl("/sitemap.xml")}\n` : ""}`;
        return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
      },
    },
  },
});
