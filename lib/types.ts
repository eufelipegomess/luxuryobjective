/** Modelo de domínio partilhado entre site público e painel administrativo. */

export const PROJECT_CATEGORIES = ['desenvolvimento', 'remodelacao'] as const
export type ProjectCategory = (typeof PROJECT_CATEGORIES)[number]

export const PROJECT_STATUSES = ['em-execucao', 'em-desenvolvimento', 'concluido', 'em-breve'] as const
export type ProjectStatus = (typeof PROJECT_STATUSES)[number]

/** Rótulos aprovados. As chaves são internas; os valores é que aparecem no site. */
export const CATEGORY_LABELS: Record<ProjectCategory, string> = {
  desenvolvimento: 'Desenvolvimento Imobiliário',
  remodelacao: 'Remodelação & Reabilitação',
}

export const STATUS_LABELS: Record<ProjectStatus, string> = {
  'em-execucao': 'Em execução',
  'em-desenvolvimento': 'Em desenvolvimento',
  concluido: 'Concluído',
  'em-breve': 'Em breve',
}

/**
 * Blocos de narrativa. Estruturados de propósito: o admin nunca injeta HTML
 * arbitrário, o que remove a superfície de XSS por conteúdo.
 */
export type ContentBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'heading'; text: string }
  | { type: 'quote'; text: string }
  | { type: 'list'; items: string[] }
  | { type: 'meta'; items: { label: string; value: string }[] }

export type ProjectMedia = {
  id: string
  projectId: string
  url: string
  alt: string
  caption: string | null
  position: number
  focalPoint: string
  width: number | null
  height: number | null
}

export type Project = {
  id: string
  slug: string
  title: string
  category: ProjectCategory
  status: ProjectStatus
  excerpt: string | null
  location: string | null
  year: number | null
  area: string | null
  typology: string | null
  coverUrl: string | null
  coverAlt: string | null
  coverFocalPoint: string
  heroVideoUrl: string | null
  blocks: ContentBlock[]
  featured: boolean
  displayOrder: number
  published: boolean
  archived: boolean
  seoTitle: string | null
  seoDescription: string | null
  createdAt: string
  updatedAt: string
  media: ProjectMedia[]
}

/** Fotografias da galeria que as listagens mostram junto da capa. */
export type ProjectPreviewMedia = Pick<ProjectMedia, 'url' | 'alt' | 'width' | 'height' | 'focalPoint'>

export type ProjectSummary = Pick<
  Project,
  | 'id'
  | 'slug'
  | 'title'
  | 'category'
  | 'status'
  | 'excerpt'
  | 'location'
  | 'coverUrl'
  | 'coverAlt'
  | 'coverFocalPoint'
  | 'featured'
  | 'displayOrder'
  | 'published'
  | 'updatedAt'
> & {
  /** Galeria pela ordem do painel, para o carrossel da Home e da página Projetos. */
  preview: ProjectPreviewMedia[]
}

export const SUBMISSION_KINDS = [
  'remodelacao',
  'oportunidade',
  'parceria',
  'terreno',
  'proprietario',
  'contacto',
] as const
export type SubmissionKind = (typeof SUBMISSION_KINDS)[number]

export type SubmissionFile = {
  path: string
  name: string
  size: number
  type: string
}
