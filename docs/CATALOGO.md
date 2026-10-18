# Catálogo importado

Foram importados 895 produtos ativos, 1.103 variantes e 895 imagens da versão atual do repositório de origem (commit `002f2380`). O arquivo de origem contém 910 produtos e 1.119 variantes; 15 produtos (16 variantes) foram excluídos conforme a lista de bloqueio já aplicada pela própria loja. Não foi feita consulta ao painel do Merchant ou ao banco de produção.

## Dados publicados

- `src/data/catalog/products.json`: catálogo usado pelas páginas e pela validação dos pedidos.
- `src/data/catalog/departments.json`: categorias correspondentes aos produtos reais.
- `public/produtos/`: imagens locais reprocessadas em WebP, sem EXIF, IPTC, XMP ou perfil ICC herdado.
- `docs/catalog-import-report.json`: contagem e pendências de revisão, sem URLs de origem.

Os textos comerciais antigos foram substituídos por apresentações compostas a partir do nome e dos dados disponíveis. Informações técnicas, ingredientes e advertências permanecem provenientes do cadastro anterior e precisam de conferência com o fabricante. Nenhuma alteração de texto ou remoção de metadados torna uma fotografia exclusiva ou transfere direitos autorais. Marcas visíveis nas embalagens foram preservadas; o processamento não remove marcas-d'água. A revisão visual integral continua pendente.

Não foram importados SEO antigo, avaliações, contagens de comentários, promoções, preços de assinatura, preços PIX, identificadores de feeds, links ou rastreadores de outras lojas. O SEO atual continua sendo gerado pela configuração desta loja. Dados empresariais e identidade já presentes no novo projeto não foram alterados.

## Antes de vender

- Conferir os produtos sem marca confiável listados no relatório. O campo foi deixado vazio, sem inventar fabricante.
- Validar preços e informações técnicas, especialmente apresentações, dosagens e pesos: o cadastro original contém divergências.
- Cadastrar estoque real. A origem só informa disponibilidade, não quantidade: `stock: 1` representa um limite conservador de uma unidade, e não estoque físico conferido. Itens indisponíveis recebem zero.
- Configurar pagamentos, frete, autenticação e persistência de pedidos. As integrações continuam desabilitadas conforme o projeto original.

## Reproduzir a importação

É necessária uma cópia local do catálogo anterior e a origem HTTPS autorizada dos seus arquivos. A ferramenta de imagens é opcional ao funcionamento do site:

```sh
npm install --no-save --package-lock=false sharp
node scripts/import-catalog.mjs CAMINHO_DO_CATALOGO ORIGEM_HTTPS_DOS_ARQUIVOS
```

Para reprocessar somente dados e verificar imagens já convertidas, acrescente `--reuse-images`. Essa opção só deve ser usada quando as imagens da origem não mudaram.

```sh
node --test scripts/import-catalog.test.mjs
npm test
npx tsc --noEmit
```

O catálogo demonstrativo permanece isolado e vazio, sem participar das páginas. Para editar produtos, atualize o catálogo real; reexecutar a importação sobrescreve alterações feitas no JSON gerado.
