/** Configuração de site — tudo o que muda entre ambientes vive aqui. */

/** O domínio definitivo. É o único que deve aparecer na pesquisa. */
const CANONICO = 'https://luxuryobjective.com'

/**
 * O endereço onde o site responde, já resolvido.
 *
 * É este valor — e não a variável em bruto — que decide o canonical e a
 * indexação. Comparar a variável em bruto tratava «não definida» como um
 * domínio estranho e mantinha fechado um site que estava no domínio certo.
 */
const URL_DO_SITE = (
  process.env.NEXT_PUBLIC_SITE_URL ?? (process.env.NODE_ENV === 'production' ? CANONICO : 'http://localhost:3000')
).replace(/\/$/, '')

function noindexPor(valor: string | undefined): boolean {
  if (valor === 'true') return true
  if (valor === 'false') return false
  return URL_DO_SITE !== CANONICO
}


export const siteConfig = {
  name: 'Luxury Objective',
  tagline: 'Promotora Imobiliária Integrada',
  locale: 'pt-PT',
  /**
   * Canonical base. Configurável por ambiente — nunca hardcoded numa página.
   *
   * Sem variável, o que vale é o ambiente: em produção o domínio definitivo,
   * em desenvolvimento a máquina local. Antes caía sempre em `localhost:3000`
   * e um alojamento sem a variável definida publicava canonical, Open Graph e
   * sitemap a apontar para a máquina de quem fez o build — ninguém repara até
   * a primeira partilha não mostrar imagem.
   */
  url: URL_DO_SITE,
  /**
   * Fecha o site aos motores de busca.
   *
   * A variável manda, nos dois sentidos. Sem ela, decide o domínio: o
   * definitivo é indexado, tudo o resto — pré-visualizações, staging, o
   * computador de quem desenvolve — fica fechado. Assim o valor por omissão
   * está certo nos dois lados e ninguém tem de se lembrar de nada: esquecer a
   * variável numa pré-visualização não a põe a competir com o site real, e no
   * domínio definitivo não deixa o site invisível.
   */
  noindex: noindexPor(process.env.NEXT_PUBLIC_NOINDEX),
  email: 'geral@luxuryobjective.com',
  phones: ['+351912221025', '+351252104920'],
  address: {
    street: 'Rua da Cavadinha, n.º 54',
    postalCode: '4570-535',
    locality: 'Balazar',
    region: 'Póvoa de Varzim',
    country: 'PT',
  },
} as const

export const routes = {
  home: '/',
  empresa: '/empresa',
  servicos: '/servicos',
  projetos: '/projetos',
  /** Cada área de atuação aponta para os seus projetos, não para a lista toda. */
  projetosDesenvolvimento: '/projetos?categoria=desenvolvimento',
  projetosRemodelacao: '/projetos?categoria=remodelacao',
  contacto: '/contacto',
  /** Âncora estável para os CTAs de "futuros projetos" vindos da Home. */
  futurosProjetos: '/projetos#futuros-projetos',
  /** O mesmo destino, já com "Quero estabelecer uma parceria" escolhida. */
  futurosProjetosParceria: '/projetos?interesse=parceria#futuros-projetos',
  privacidade: '/privacidade',
  cookies: '/cookies',
  admin: '/admin',
  adminLogin: '/admin/login',
} as const

export const primaryNav = [
  { href: routes.home, key: 'home' },
  { href: routes.empresa, key: 'empresa' },
  { href: routes.servicos, key: 'servicos' },
  { href: routes.projetos, key: 'projetos' },
  { href: routes.contacto, key: 'contacto' },
] as const

/**
 * Divisão da nav no header desktop, conforme a hero aprovada:
 * três itens à esquerda da marca, dois à direita + CTA.
 */
export const navLeft = primaryNav.slice(0, 3)
export const navRight = primaryNav.slice(3)

export const uploads = {
  maxBytes: 10 * 1024 * 1024,
  maxFiles: 8,
  imageTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/avif'] as const,
  docTypes: ['application/pdf'] as const,
  videoTypes: ['video/mp4', 'video/webm'] as const,
} as const

export const allowedSubmissionTypes = [...uploads.imageTypes, ...uploads.docTypes] as const
