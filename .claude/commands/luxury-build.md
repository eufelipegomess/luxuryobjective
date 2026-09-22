---
description: Constrói o site completo da Luxury Objective a partir do prompt mestre
---

Fontes da verdade — lê AMBAS por inteiro antes de escrever código:
- @prompt-claude-code-luxury-objective.md — design system, motion, stack, páginas, admin, critérios de aprovação.
- @Luxury Objective-Copy Institucional v5.pdf — copy institucional aprovada (pt-PT).

Já verificado: a copy do MD é idêntica à do PDF. Não há divergências. Copia literal, palavra por palavra, sem reescrever, resumir, traduzir ou "melhorar".

Argumentos: $ARGUMENTS

## Estado real do repositório (verificado)

Repo sem stack, não é git repo. Assets existentes — usa SÓ estes, não inventes nomes de ficheiro:

- `assets/Logos/logo p/fundo escuro.svg` — lockup para superfícies escuras (header da hero, footer)
- `assets/Logos/logo p/fundo claro.svg` — lockup para superfícies claras
- `assets/ícones/Ícone primário.svg` — monograma "N" em oval dourado; base do preloader
- `assets/ícones/Ícone secundário.svg`
- `assets/favicon/favicon.svg`
- `assets/grafismo/5.svg` — grafismo de marca, uso pontual como acento editorial

Move estes ficheiros para `public/` com nomes ASCII sem espaços (ex. `public/brand/logo-dark.svg`) e mapeia tudo em `lib/media.ts`.

## Mídia em falta — cria placeholders, nunca inventes

Não existem no disco: render arquitetónico da hero, vídeo da hero, fotografias de projeto, retratos da liderança, mídia de O'LUZIA e Macieira da Maia.

Para cada um: placeholder editorial neutro (superfície `#151515`, moldura fina, label discreto do slot) com o aspect ratio final exato, centralizado em `lib/media.ts` para troca num único sítio. Zero Unsplash, zero URLs externas, zero copy de marketing inventada para preencher.

## Hero aprovada — especificação da composição de referência

A hero segue esta composição (referência visual aprovada pelo cliente). Reproduz a lógica, não pixel a pixel:

**Header** — transparente sobre a mídia, banda superior de ~96px:
- Esquerda: `HOME` · `EMPRESA` · `SERVIÇOS` — Jost light, caixa alta, ~14px, tracking largo (~0.12em), `#F8F8F8`.
- Centro: lockup da marca — monograma em oval `#E7CB43` + "LUXURY OBJECTIVE" em caixa alta clara e leve + "PROMOTORA IMOBILIÁRIA INTEGRADA" por baixo, micro-caps com tracking muito largo.
- Direita: `PROJETOS` · `CONTACTO` + CTA `SAIBA MAIS` num botão de borda fina `#F8F8F8`, fundo transparente, cantos vivos (zero border-radius).
- Nav simétrica: três itens à esquerda, dois + CTA à direita, marca perfeitamente centrada.

**Mídia** — render arquitetónico full-bleed, `object-fit: cover`, ocupando a viewport inteira. Gradiente escuro subindo da base para proteger a legibilidade do bloco inferior + véu discreto no topo para a nav.

**Bloco inferior** — ancorado na base, dentro do gutter de conteúdo:
- Headline em duas linhas, escala muito grande, Fahkwang light, `#F8F8F8`, caixa alta, quebra controlada:
  `CRIAMOS, TRANSFORMAMOS E` / `DESENVOLVEMOS ESPAÇOS COM VISÃO.`
- Linha seguinte em duas colunas na mesma baseline: subtítulo à esquerda (Jost, caixa alta, tracking largo, ~3 linhas, largura contida) e os CTAs à direita, lado a lado.
- CTA primário: fundo `#E7CB43`, texto `#0E0E0E`, `CONHEÇA OS NOSSOS PROJETOS` com seta diagonal ↗ à direita que desloca 4–6px no hover. Cantos vivos.
- CTA secundário: transparente, borda fina `#F8F8F8`, `FALE CONNOSCO`, hover invertido.

**Nota de conflito resolvido:** o MD proíbe caixa alta em frases longas, mas a hero aprovada usa caixa alta na headline e no subtítulo. A hero aprovada prevalece — aplica caixa alta apenas na hero; o resto do site segue a regra do MD.

**Mobile:** logo à esquerda, botão `Menu` à direita. Headline reduzida com `clamp()`, subtítulo e CTAs empilhados em coluna única, CTAs em largura total, alvos de toque ≥44px.

## Execução

Autonomia total. Implementa, corre, testa, corrige. Ordem:

1. **Scaffold** — Next.js App Router + React + TypeScript estrito + Tailwind + GSAP/ScrollTrigger + Lenis (só desktop, ponteiro fino) + Supabase + Zod + React Hook Form. Estrutura da secção 5 do MD.
2. **Design system** — tokens `#0E0E0E` / `#F8F8F8` / `#E7CB43` + neutros derivados. Fahkwang (títulos) + Jost (texto) via `next/font`, pesos mínimos. Grid 12 col, `max-width` 1440–1600px, gutter e escala com `clamp()`. As proibições da secção 4 do MD são regra dura.
3. **`content/pt-PT.ts`** — TODA a copy institucional tipada e centralizada, literal do PDF. Nenhum texto literal solto em componentes. Só `pt-PT` ativo; arquitetura preparada para en/es sem traduções.
4. **Supabase** — migrations versionadas (`projects`, `project_media`, `project_content_blocks`, `form_submissions`), UUIDs, índices, RLS, buckets (privado para uploads de formulário, público/assinado para mídia publicada). Seed do O'LUZIA só com nome + estado `Em execução` e Macieira da Maia como `Em desenvolvimento`, ambos sem dados inventados.
5. **Motion** — preloader curto com o monograma real (sessionStorage, primeira visita). Transições de página com cortina. Reveals por linha nas headlines. Hero com vídeo scrub por ScrollTrigger: componente configurável por props, sem nome de ficheiro fixo, poster estático como fallback enquanto não houver vídeo. Cleanup de contexts/triggers no unmount. `prefers-reduced-motion` remove scrub, pins e parallax.
6. **Páginas** — `/`, `/empresa`, `/servicos`, `/projetos`, `/projetos/[slug]`, `/contacto` + admin `/admin/login`, `/admin`, `/admin/projetos`, `/admin/projetos/novo`, `/admin/projetos/[id]`.
7. **Formulários** — todos os das secções 11, 13 e 14 do MD. Zod partilhado cliente/servidor, honeypot + rate limit, uploads validados por MIME e tamanho, labels persistentes, `aria-describedby` nos erros, foco no primeiro erro, estado preservado entre passos.
8. **SEO** — metadata por página, sitemap com projetos publicados, robots bloqueando `/admin`, JSON-LD Organization só com a morada, telefones e e-mail aprovados. Sem coordenadas, avaliações ou perfis sociais com URL inventado.

## Pendências de conteúdo assinaladas pelo cliente

O PDF marca como PENDENTE, e a arquitetura tem de as acomodar sem refactor:
- Fotografias e descrição detalhada de O'LUZIA e Macieira da Maia.
- Projetos de remodelação e reabilitação a incluir na página Projetos.
- Traduções en/es.

Nunca renderizes as notas editoriais do PDF ("PENDENTE", "estrutura visual sugerida", "aguarda fotografias", "Resumo de pendências") no site. Onde faltam dados, estado vazio elegante ou item não publicado.

## Validação obrigatória antes de dizer "pronto"

Corre e mostra a saída real: install, lint, typecheck, `next build`, testes unitários (schemas Zod, helpers) e E2E (menu mobile, navegação pelas 5 páginas, card expansível, filtro de projetos, página dinâmica, form de 2 passos ida e volta, erros obrigatórios, login admin, CRUD de projeto).

Inspeciona 360×800, 390×844, 430×932, 768×1024, 1024×768, 1440×900 e ultrawide. Verifica `prefers-reduced-motion`, navegação por teclado, foco visível, consola limpa, zero scroll horizontal.

Não declares concluído sem output verificado. Reporta no fim: o que ficou feito, decisões técnicas, onde trocar o vídeo da hero, como aceder ao admin, conteúdo real ainda em falta, e o resultado real de lint/typecheck/build/testes.
