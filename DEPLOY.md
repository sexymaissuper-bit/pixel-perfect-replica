# Minha Loja Pet — execução e implantação

## Rodar localmente
```bash
bun install
bun run dev        # http://localhost:8080
bun run test
```

## Configuração
- Nome, domínio, contatos e dados da empresa: `src/config/store.ts` (campos vazios não aparecem no site).
- Departamentos/categorias: `src/data/departments.ts`.
- Páginas institucionais (marcadas como pendentes): `src/data/institutional.ts`.
- Variáveis públicas de build: `VITE_SITE_URL`, `VITE_NOINDEX`. Segredos apenas em runtime (ver `.env.example`).

## Docker / Coolify
O build gera um servidor Node autônomo (`NITRO_PRESET=node-server`) em `.output/server/index.mjs`.
```bash
docker build --build-arg VITE_SITE_URL=https://www.seudominio.com.br --build-arg VITE_NOINDEX=true -t loja-pet .
docker run -p 3000:3000 loja-pet
```
- Porta: `3000` · Health check: `GET /api/health`
- Na Coolify: tipo "Dockerfile", porta 3000, defina os build args acima e os segredos como variáveis de runtime.
- `robots.txt` e `sitemap.xml` são gerados dinamicamente a partir da configuração.

## Substituir o catálogo demonstrativo
1. O catálogo de exemplo está isolado em `src/data/demo/catalog.ts` (todos os itens com `demo: true`).
2. Todas as páginas leem produtos via `src/lib/catalog.ts` (`source`). Troque `source` pelo catálogo real
   (arquivo JSON gerado na importação ou chamada a um backend) seguindo o tipo `Product` em `src/data/types.ts`.
3. Imagens: coloque em armazenamento próprio (ou `public/produtos/`) com caminhos relativos; remova metadados EXIF/IPTC/XMP
   na importação (ex.: `exiftool -all= *.jpg`) e sinalize fotos com logos/marcas-d'água de outras lojas.
4. Apague `src/data/demo/` e os assets `src/assets/p-*.jpg`.

## Estado atual
- Funcional: navegação, departamentos, busca (sem acento/maiúsculas), filtros e ordenação reais, página de produto com
  variantes, favoritos, carrinho persistido localmente, checkout com validação de preço/estoque no servidor.
- Demonstração: pedidos ficam só no navegador; conta e administração bloqueadas; frete não calculado.
- A configurar: provedor de pagamento (PIX/cartão com webhook de confirmação), frete, autenticação + papel de
  administrador verificado no servidor, banco de dados para catálogo/pedidos, importação CSV/JSON no painel.
