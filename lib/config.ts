/** Configuração de site — tudo o que muda entre ambientes vive aqui. */

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
  url: (
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.NODE_ENV === 'production' ? 'https://luxuryobjective.com' : 'http://localhost:3000')
  ).replace(/\/$/, ''),
  /**
   * Fecha o site aos motores de busca. Fechado por omissão: abre-se de uma vez,
   * no domínio definitivo e quando o conteúdo estiver aprovado, com
   * `NEXT_PUBLIC_NOINDEX=false`. Ao contrário — aberto por omissão — bastava
   * esquecer a variável numa pré-visualização para ela competir com o site
   * real na pesquisa, e tirar do índice depois dá muito mais trabalho.
   */
  noindex: process.env.NEXT_PUBLIC_NOINDEX !== 'false',
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
