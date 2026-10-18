# Conferência do catálogo de origem

Versão conferida: commit `002f2380`, obtido do GitHub antes da importação final.

| Fonte | Registros | Interpretação |
| --- | ---: | --- |
| Catálogo principal atual | 910 produtos / 1.119 variantes | Arquivo usado pelo site original |
| Lista de bloqueio atual | 15 produtos / 16 variantes | Retirados da vitrine pelo próprio projeto de origem |
| Importação para a nova loja | 895 produtos / 1.103 variantes | Todos os produtos ativos, com 895 imagens locais |
| 13 feeds CSV atuais somados | 2.764 linhas | Há repetição dos mesmos IDs entre arquivos |
| IDs distintos nesses feeds | 1.058 | Ofertas únicas presentes nos arquivos de feed |
| URLs de produto sem parâmetro de variante nos feeds | 859 | Páginas representadas nesses arquivos |
| `products_new.json` da cópia local | 33 registros | Arquivo auxiliar fora do catálogo ativo; não importado automaticamente |
| `products_archive.zip` e `petlove_data.zip` | 1.077 registros cada | Arquivos binariamente idênticos, com o mesmo SHA-256; coleta externa, não dois catálogos independentes |

O relatório do gerador dos feeds também declara `total_products: 910` e `total_offers: 1058`. Feeds podem omitir produtos e conservar dados anteriores; a lista de bloqueio do código atual foi respeitada independentemente deles.

Os arquivos auxiliares não foram misturados ao catálogo publicado. A contagem exibida no painel do Merchant precisa ser comparada diretamente com suas fontes e identificadores para explicar eventuais diferenças adicionais: esta auditoria confirma os arquivos do repositório, não o estado da conta Google.

A primeira análise usou uma cópia antiga, com 807 produtos e 1.016 variantes. Essa contagem foi corrigida após buscar a versão atual do GitHub.
