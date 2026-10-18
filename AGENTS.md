<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Architecture rules
- Pages read products only through `src/lib/catalog.ts`; why: swapping demo data for the real catalog/backend touches one file.
- Demo catalog lives isolated in `src/data/demo/` with `demo: true`; why: removable when the real catalog is imported.
- Store identity/contacts/SEO come from `src/config/store.ts`; empty values are never rendered; why: no invented business data.
- Order prices/stock are recomputed server-side (`src/lib/orders.functions.ts`); why: never trust browser totals.
- Production runs as Node server (`NITRO_PRESET=node-server`, Dockerfile, `/api/health`); why: hosted on Coolify, not Workers.
