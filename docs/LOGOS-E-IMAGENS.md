# Logos e qualidade das imagens

A home exibe somente marcas do catálogo que tenham logo real local em `src/data/brand-logos.json`. As outras foram retiradas dessa vitrine, sem apagar seus produtos ou marcas dos filtros.

Logos verificados: Royal Canin, Purina, Dog Chow, Whiskas, Pedigree e Keldog. O manifesto registra as fontes oficiais e os arquivos ficam em `public/marcas/`, reprocessados sem metadados herdados. Não são desenhos gerados nem favicons usados como substitutos.

O carrossel é automático, pausa ao passar o mouse, receber foco ou pelo botão de pausa. A preferência por movimento reduzido desativa a animação e permite rolagem manual. Clicar no logo abre a busca da marca. Um logo que falhar é omitido.

Todos os cards disponíveis usam a ação azul “Comprar”; produtos com variantes abrem a página para seleção, preservando o fluxo de compra.

As imagens de produtos agora respeitam sua resolução natural, sem ampliação forçada na galeria ou no card. Uma imagem pequena pode ocupar menos espaço: o ajuste não inventa detalhes. A foto do Blue Premium 82x60 cm com 30 unidades foi substituída por uma versão de 1500 × 1500 da mesma embalagem, visualmente conferida, salva localmente e sem metadados. O nome de arquivo novo evita reutilizar a miniatura pelo cache. A revisão de outras fotos pequenas para obter novos originais continua dependendo de arquivos melhores.

Para recuperar os logos e a foto melhorada após uma nova importação completa do catálogo, execute `node scripts/fetch-store-media.mjs` com `sharp` instalado temporariamente, conforme as instruções da importação.
