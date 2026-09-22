# Luxury Objective — website institucional

Site institucional e painel de gestão de projetos da **Luxury Objective —
Promotora Imobiliária Integrada**.

Next.js (App Router) · React 19 · TypeScript estrito · Tailwind CSS v4 ·
GSAP + ScrollTrigger · Lenis (só desktop) · Supabase · Zod · React Hook Form.

---

## Instalação

```bash
npm install
cp .env.example .env.local   # preencher (ver abaixo)
npm run dev
```

O site fica em <http://localhost:3000>.

> **Nota sobre pastas sincronizadas.** Este projeto **não** pode viver dentro de
> uma pasta do Google Drive / OneDrive. O sistema de ficheiros virtual do Drive
> rebenta com as escritas paralelas do `npm install` (`EBADF: bad file
> descriptor`) e deixa ficheiros a 0 bytes dentro de `node_modules`. Mantém o
> repositório em disco local. O `.npmrc` já limita o npm a uma ligação de cada
> vez, o que ajuda, mas não resolve o problema por completo.

## Variáveis de ambiente

| Variável | Obrigatória | Para quê |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | sim | URL canónico: metadata, Open Graph, sitemap, JSON-LD |
| `NEXT_PUBLIC_SUPABASE_URL` | para o painel | projeto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | para o painel | chave pública |
| `SUPABASE_SERVICE_ROLE_KEY` | para os formulários | **só no servidor**, ignora RLS |
| `RATE_LIMIT_SALT` | recomendada | sal do hash de IP no rate limiting |
| `E2E_ADMIN_EMAIL` / `E2E_ADMIN_PASSWORD` | opcional | testes E2E do painel |

### Sem Supabase configurado

O site continua a funcionar, e o painel também — em **modo local**:

| | Em desenvolvimento (`npm run dev`) | Em produção |
| --- | --- | --- |
| Páginas públicas | lêem o armazenamento local | conjunto fixo aprovado (`lib/queries/fallback.ts`) |
| `/admin` | funciona, **sem autenticação** | fecha com 503 |
| Projetos | `.data/projects.json` | — |
| Imagens do painel | `public/uploads/` | — |
| Formulários do site | 503 com mensagem clara | 503 com mensagem clara |

O modo local existe para o painel ser utilizável antes de haver base de dados.
Está trancado a dois cadeados (`lib/store/dev-store.ts`): só corre fora de
`NODE_ENV=production` **e** só quando o Supabase não está configurado. O painel
mostra sempre um aviso quando está nesse modo.

**Não é produção.** Não há autenticação, os dados vivem num ficheiro nesta
máquina e `.data/` e `public/uploads/` estão no `.gitignore`. Assim que as
variáveis do Supabase existirem, tudo passa a ler e escrever lá e este modo
deixa de ser usado.

## Configuração do Supabase

1. Cria um projeto em <https://supabase.com>.
2. Corre a migration em **SQL Editor**:

   ```
   supabase/migrations/0001_init.sql
   ```

   Cria as tabelas (`projects`, `project_media`, `project_content_blocks` como
   JSONB validado, `form_submissions`, `admin_users`), os enums, os índices, as
   políticas de RLS e os dois buckets de storage.

3. Opcionalmente, corre o seed com os dois projetos aprovados:

   ```
   supabase/seed.sql
   ```

4. Copia `Project URL`, `anon key` e `service_role key` de **Settings → API**
   para o `.env.local`.

### Buckets

| Bucket | Acesso | Conteúdo |
| --- | --- | --- |
| `project-media` | público (leitura) | capas e galerias dos projetos publicados |
| `submissions` | privado | anexos enviados pelos formulários |

Escrita em ambos só para administradores; a política está na base de dados, não
na interface.

## Criar o primeiro administrador

Ser utilizador do Supabase **não** dá acesso ao painel: é preciso constar da
tabela `admin_users`.

1. **Authentication → Users → Add user**, com e-mail e palavra-passe.
   Marca `Auto Confirm User`.
2. No **SQL Editor**:

   ```sql
   insert into public.admin_users (user_id, email)
   select id, email from auth.users where email = 'o-email@luxuryobjective.com';
   ```

3. Entra em `/admin/login`.

Para revogar o acesso, apaga a linha de `admin_users` — a conta continua a
existir mas deixa de poder ler ou escrever seja o que for.

## Execução, build e deploy

```bash
npm run dev        # desenvolvimento
npm run build      # build de produção
npm run start      # servir o build
npm run verify     # lint + typecheck + testes unitários + build
```

Testes:

```bash
npm run test       # unitários (Vitest)
npm run test:e2e   # end-to-end (Playwright, precisa de `npm run build` antes)
```

Deploy: qualquer plataforma que corra Next.js 15 em Node. Define as variáveis de
ambiente e aponta `NEXT_PUBLIC_SITE_URL` para o domínio final.

---

## Trocar o vídeo da hero

```bash
node scripts/prepare-hero-video.mjs <url-ou-ficheiro>
```

Isto escreve `public/media/hero.mp4` e `public/media/hero-poster.jpg`, que é o
que `lib/media.ts` já referencia. Mais nada muda.

**Porque é preciso recodificar.** Um vídeo normal traz um keyframe de poucos em
poucos segundos. Para reproduzir do princípio ao fim isso é óptimo; para saltar
para um instante arbitrário é péssimo, porque o browser tem de descodificar tudo
desde o keyframe anterior. Num scrub conduzido pelo scroll traduz-se em imagem a
engasgar, sobretudo no Safari. O script recodifica com um keyframe a cada 0,25 s
e move o índice para o início do ficheiro. O original fornecido tinha **um único
keyframe** em 8 segundos.

Para servir de um CDN em vez de `public/`, carrega lá o `hero.mp4` **já
recodificado** e troca o `src` em `lib/media.ts`.

### A intro da hero

Na primeira carga da sessão, e só na Home, o vídeo aparece parado no primeiro
frame; avança conforme o scroll e, a 72% do percurso, o header e o texto entram.
A partir daí — e em qualquer visita seguinte da mesma sessão — a hero é uma
dobra normal com tudo à vista.

Quem decide é o `app/layout.tsx`, num script que corre antes da hidratação e
escreve dois atributos no `<html>`:

| Atributo | Faz | Sai quando |
| --- | --- | --- |
| `data-hero-scrub` | alonga a hero para 320svh e liga o scrub | nunca, durante a visita |
| `data-hero-intro` | esconde header, véus e texto | aos 72% do percurso |

`data-hero-scrub` fica até ao fim da visita de propósito: retirá-lo a meio
encolheria a página debaixo de quem está a scrollar.

Nunca há intro em `prefers-reduced-motion`, sem JavaScript, ou fora da Home. Se
o vídeo falhar a carregar, ou se alguém carregar em Tab, a intro sai de imediato
— o header não pode ficar inalcançável.

**Custo.** O vídeo tem 5 MB e é descarregado por inteiro na primeira visita à
Home, porque sem ele em buffer o scrub avança aos saltos. Se isso for demais em
dados móveis, dá para limitar a intro a ponteiro fino (desktop) em
`components/sections/Hero.tsx`.

## Substituir placeholders

Toda a mídia do site está mapeada em **`lib/media.ts`**. Cada slot com
`src: null` desenha um placeholder editorial neutro com o aspect ratio final e
o nome do slot. Para substituir, põe o ficheiro em `public/media/` e preenche o
`src` — o layout não muda.

Slots por preencher:

| Chave | Onde aparece |
| --- | --- |
| `heroPoster` / `heroVideo` | hero da Home |
| `apresentacao` | recorte da apresentação da empresa |
| `areaDesenvolvimento` | painel Desenvolvimento Imobiliário |
| `areaRemodelacao` | painel Remodelação & Reabilitação |
| `futuros` | textura da secção de futuros projetos |
| `empresaHero` | abertura da página Empresa |
| `retratoNathalie` / `retratoBruno` | liderança |
| `projetoFallback` | capa de projeto sem imagem no painel |

Os logótipos, ícones e favicon já são os reais (`public/brand/`, vindos de
`assets/`).

## Publicar um projeto novo

1. `/admin/projetos/novo`.
2. Título — o slug é sugerido a partir dele e continua editável; a unicidade é
   validada na base de dados.
3. Categoria (Desenvolvimento Imobiliário ou Remodelação & Reabilitação) e
   estado (Em execução, Em desenvolvimento, Concluído, Em breve).
4. Capa, focal point e texto alternativo. Ficha (localização, ano, área,
   tipologia) — **campos vazios não aparecem no site**, não há placeholders.
5. Narrativa em blocos estruturados (parágrafo, subtítulo, citação, lista,
   ficha técnica). Não existe campo de HTML: o conteúdo do painel nunca injeta
   markup no site.
6. Galeria com reordenação por arrasto **ou** pelos botões ↑ ↓ (teclado).
7. **Destacar na Home** coloca-o no accordion da Home. **Publicado** torna-o
   visível; sem isso fica rascunho.
8. Guardar. As páginas afetadas (`/`, `/projetos`, `/projetos/[slug]`, sitemap)
   são revalidadas automaticamente.

Na listagem: publicar/despublicar, duplicar (a cópia entra sempre como
rascunho), arquivar/restaurar, pré-visualizar e eliminar — a eliminação pede
confirmação e remove primeiro os ficheiros do storage, para não deixar órfãos.

---

## Pendências de conteúdo real

O que falta é o que o cliente ainda não forneceu. **Nada disto foi inventado
para preencher espaço** — os placeholders são explícitos e substituíveis.

Assinalado como PENDENTE no próprio PDF de copy:

- [ ] Fotografias e descrição detalhada de **O'LUZIA** (em execução) e
      **MACIEIRA DA MAIA** (em desenvolvimento). Ambos estão publicados com o
      nome e o estado aprovados; o resto entra pelo painel.
- [ ] Projetos de **Remodelação & Reabilitação** a incluir na página Projetos.
      Sem nenhum publicado, a secção mostra um estado vazio sóbrio.
- [ ] Versões traduzidas em **inglês** e **espanhol**. A arquitetura de conteúdo
      está preparada (`content/pt-PT.ts` tipado, `locale` isolado), mas só
      `pt-PT` está ativo — não há tradução automática.

Identificado durante a implementação:

- [ ] **Vídeo da hero** e respetivo poster.
- [ ] **Render arquitetónico** da hero (a direção visual aprovada foi seguida a
      partir da composição fornecida, mas o ficheiro não está no repositório).
- [ ] **Retratos** de Nathalie Ramos Ferreira e Bruno Carvalho.
- [ ] Imagens dos painéis das duas áreas de atuação, da apresentação da empresa
      e da abertura da página Empresa.
- [ ] **URLs reais** do Instagram, Facebook e LinkedIn. Os perfis aparecem como
      texto aprovado (`@luxuryobjective_`, `Luxury Objective`) mas sem link, e
      não entram no JSON-LD.
- [ ] **Política de Privacidade** e **Política de Cookies**. As rotas
      `/privacidade` e `/cookies` existem para os links do rodapé serem válidos
      e declaram-se em preparação. Publicar texto jurídico fictício seria pior
      do que não ter nenhum — ver `components/layout/LegalPending.tsx`.

## Notas de implementação

**Copy.** Toda a copy institucional está em `content/pt-PT.ts`, transcrita
literalmente do PDF aprovado. `tests/unit/content.test.ts` fixa as strings
críticas: uma alteração acidental falha os testes em vez de chegar ao site. As
notas editoriais do PDF ("PENDENTE", "estrutura visual sugerida", …) nunca são
renderizadas. Os únicos textos criados de raiz são rótulos de interface
indispensáveis, isolados em `ui`.

**Caixa alta na hero.** O briefing proíbe caixa alta em frases longas, mas a
hero aprovada usa-a na headline e no subtítulo. A hero aprovada prevalece — e só
ali. A copy no DOM mantém-se intacta; a caixa é `text-transform`.

**Motion.** GSAP é o único motor. O split por linha é um componente próprio
(`SplitLines`), sem plugins de licença paga: renderiza texto corrido no servidor
e só depois mede as quebras reais. Os reveals têm um controlador único por rota
(`RevealController`), que limpa todos os ScrollTriggers ao navegar. Sem
JavaScript o conteúdo fica visível — os estados iniciais só são aplicados depois
de o documento receber `.js-motion`.

**Reduced motion.** `prefers-reduced-motion` remove scrub, pins, parallax,
preloader, transições de página e Lenis.

**Segurança.** O acesso ao painel é decidido no middleware e outra vez na RLS —
a interface nunca decide sozinha. `service_role` só existe em route handlers
(`server-only` faz o build falhar se alguém a importar para o cliente). Os
formulários validam com o mesmo schema Zod no cliente e no servidor, têm
honeypot e rate limiting por hash de IP, e não há CAPTCHA. Os anexos vão para um
bucket privado com nome gerado — o nome original do ficheiro nunca é usado.

**Mapa.** O embed do Google Maps só carrega depois de o visitante o pedir. Antes
disso é uma capa estática — melhor para o LCP e para a privacidade.
