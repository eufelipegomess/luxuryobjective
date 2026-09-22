import 'server-only'
import { createSupabasePublicClient } from '@/lib/supabase/server'
import { isSupabaseConfigured } from '@/lib/supabase/env'
import type { ProjectMediaRow, ProjectRow } from '@/lib/supabase/database.types'
import type { Project, ProjectCategory, ProjectSummary } from '@/lib/types'
import { fallbackProjects, fallbackSummaries, toSummary } from './fallback'
import { devGetBySlug, devListPublished, isDevStoreEnabled } from '@/lib/store/dev-store'

const SUMMARY_COLUMNS =
  'id, slug, title, category, status, excerpt, location, cover_url, cover_alt, cover_focal_point, featured, display_order, published, updated_at, project_media(url, alt, width, height, focal_point, position)'

/** Uma linha crua só se torna `Project` aqui — o resto da app nunca vê snake_case. */
function mapProject(row: ProjectRow, media: ProjectMediaRow[] = []): Project {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    category: row.category,
    status: row.status,
    excerpt: row.excerpt,
    location: row.location,
    year: row.year,
    area: row.area,
    typology: row.typology,
    coverUrl: row.cover_url,
    coverAlt: row.cover_alt,
    coverFocalPoint: row.cover_focal_point,
    heroVideoUrl: row.hero_video_url,
    blocks: Array.isArray(row.blocks) ? row.blocks : [],
    featured: row.featured,
    displayOrder: row.display_order,
    published: row.published,
    archived: row.archived,
    seoTitle: row.seo_title,
    seoDescription: row.seo_description,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    media: media
      .slice()
      .sort((a, b) => a.position - b.position)
      .map((item) => ({
        id: item.id,
        projectId: item.project_id,
        url: item.url,
        alt: item.alt,
        caption: item.caption,
        position: item.position,
        focalPoint: item.focal_point,
        width: item.width,
        height: item.height,
      })),
  }
}

type SummaryRow = Pick<
  ProjectRow,
  | 'id'
  | 'slug'
  | 'title'
  | 'category'
  | 'status'
  | 'excerpt'
  | 'location'
  | 'cover_url'
  | 'cover_alt'
  | 'cover_focal_point'
  | 'featured'
  | 'display_order'
  | 'published'
  | 'updated_at'
> & {
  project_media: Pick<ProjectMediaRow, 'url' | 'alt' | 'width' | 'height' | 'focal_point' | 'position'>[] | null
}

function mapSummaryRow(row: SummaryRow): ProjectSummary {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    category: row.category,
    status: row.status,
    excerpt: row.excerpt,
    location: row.location,
    coverUrl: row.cover_url,
    coverAlt: row.cover_alt,
    coverFocalPoint: row.cover_focal_point,
    featured: row.featured,
    displayOrder: row.display_order,
    published: row.published,
    updatedAt: row.updated_at,
    preview: (row.project_media ?? [])
      .slice()
      .sort((a, b) => a.position - b.position)
      .map((item) => ({
        url: item.url,
        alt: item.alt,
        width: item.width,
        height: item.height,
        focalPoint: item.focal_point,
      })),
  }
}

/**
 * Projetos publicados. A RLS já filtra `published`/`archived`, mas o filtro
 * explícito mantém a intenção legível e protege caso a política mude.
 */
export async function getPublishedProjects(
  category?: ProjectCategory,
): Promise<ProjectSummary[]> {
  if (!isSupabaseConfigured()) {
    const all = isDevStoreEnabled()
      ? (await devListPublished()).map(toSummary)
      : fallbackSummaries()
    return category ? all.filter((p) => p.category === category) : all
  }

  const supabase = createSupabasePublicClient()
  let query = supabase
    .from('projects')
    .select(SUMMARY_COLUMNS)
    .eq('published', true)
    .eq('archived', false)
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: false })

  if (category) query = query.eq('category', category)

  const { data, error } = await query
  if (error) {
    console.error('[projects] getPublishedProjects', error.message)
    return []
  }

  return ((data as SummaryRow[] | null) ?? []).map(mapSummaryRow)
}

export async function getFeaturedProjects(): Promise<ProjectSummary[]> {
  if (!isSupabaseConfigured()) {
    const all = isDevStoreEnabled()
      ? (await devListPublished()).map(toSummary)
      : fallbackSummaries()
    return all.filter((p) => p.featured)
  }

  const supabase = createSupabasePublicClient()
  const { data, error } = await supabase
    .from('projects')
    .select(SUMMARY_COLUMNS)
    .eq('published', true)
    .eq('archived', false)
    .eq('featured', true)
    .order('display_order', { ascending: true })

  if (error) {
    console.error('[projects] getFeaturedProjects', error.message)
    return []
  }

  return ((data as SummaryRow[] | null) ?? []).map(mapSummaryRow)
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  if (!isSupabaseConfigured()) {
    if (isDevStoreEnabled()) {
      const project = await devGetBySlug(slug)
      return project && project.published && !project.archived ? project : null
    }
    return fallbackProjects.find((p) => p.slug === slug) ?? null
  }

  const supabase = createSupabasePublicClient()
  const { data, error } = await supabase
    .from('projects')
    .select('*, project_media(*)')
    .eq('slug', slug)
    .eq('published', true)
    .eq('archived', false)
    .maybeSingle()

  if (error) {
    console.error('[projects] getProjectBySlug', error.message)
    return null
  }
  if (!data) return null

  const { project_media: mediaRows, ...row } = data as ProjectRow & {
    project_media: ProjectMediaRow[] | null
  }
  return mapProject(row, mediaRows ?? [])
}

/** Slugs para `generateStaticParams` e para o sitemap. */
export async function getPublishedSlugs(): Promise<{ slug: string; updatedAt: string }[]> {
  if (!isSupabaseConfigured()) {
    const all = isDevStoreEnabled() ? await devListPublished() : fallbackProjects
    return all.map((p) => ({ slug: p.slug, updatedAt: p.updatedAt }))
  }

  const supabase = createSupabasePublicClient()
  const { data, error } = await supabase
    .from('projects')
    .select('slug, updated_at')
    .eq('published', true)
    .eq('archived', false)

  if (error) {
    console.error('[projects] getPublishedSlugs', error.message)
    return []
  }

  return (data ?? []).map((row) => ({ slug: row.slug, updatedAt: row.updated_at }))
}

export async function getRelatedProjects(
  project: Pick<Project, 'id' | 'category'>,
  limit = 2,
): Promise<ProjectSummary[]> {
  const all = await getPublishedProjects(project.category)
  return all.filter((item) => item.id !== project.id).slice(0, limit)
}

export { toSummary }
