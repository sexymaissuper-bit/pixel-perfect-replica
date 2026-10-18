/**
 * Configuração central da loja. Altere aqui nome, domínio e contatos.
 * Valores vazios ("") significam "não informado" e NÃO são exibidos no site.
 */
export const storeConfig = {
  name: "Minha Loja Pet",
  shortName: "Loja Pet",
  tagline: "Tudo para o seu pet, em um só lugar",
  /** Domínio público definitivo, ex.: https://www.minhalojapet.com.br. Defina VITE_SITE_URL no build. */
  siteUrl: (import.meta.env.VITE_SITE_URL as string | undefined) ?? "",
  /** Quando true (padrão até o lançamento), todas as páginas recebem noindex. */
  noindex: (import.meta.env.VITE_NOINDEX as string | undefined) !== "false",
  contact: {
    email: "",
    phone: "",
    whatsapp: "",
    hours: "",
  },
  company: {
    legalName: "",
    cnpj: "",
    address: "",
  },
  /** Formas de pagamento exibidas somente quando um provedor real estiver configurado. */
  payments: {
    providerConfigured: false,
    methods: [] as string[],
  },
  shipping: {
    providerConfigured: false,
  },
  auth: {
    configured: false,
  },
  currency: "BRL",
  locale: "pt-BR",
} as const;

export const isDemoMode =
  !storeConfig.payments.providerConfigured ||
  !storeConfig.shipping.providerConfigured ||
  !storeConfig.auth.configured;

export function absoluteUrl(path: string) {
  if (!storeConfig.siteUrl) return undefined;
  return storeConfig.siteUrl.replace(/\/$/, "") + path;
}

/** Monta meta tags de SEO padronizadas para uma rota. */
export function seo(opts: { title: string; description: string; path?: string; image?: string }) {
  const title = `${opts.title} | ${storeConfig.name}`;
  const meta: Array<Record<string, string>> = [
    { title },
    { name: "description", content: opts.description },
    { property: "og:title", content: title },
    { property: "og:description", content: opts.description },
    { property: "og:type", content: "website" },
    { property: "og:site_name", content: storeConfig.name },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: opts.description },
  ];
  if (storeConfig.noindex) meta.push({ name: "robots", content: "noindex, nofollow" });
  const canonical = opts.path ? absoluteUrl(opts.path) : undefined;
  const links = canonical ? [{ rel: "canonical", href: canonical }] : [];
  if (canonical) meta.push({ property: "og:url", content: canonical });
  return { meta, links };
}
