import 'server-only'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { isSupabaseConfigured } from '@/lib/supabase/env'
import { devGetById, devListAll, isDevStoreEnabled } from '@/lib/store/dev-store'
import type { ProjectMediaRow, ProjectRow } from '@/lib/supabase/database.types'
import type { Project, ProjectCategory } from '@/lib/types'

export type AdminStats = {
  total: number
  published: number
  drafts: number
  archived: number
  byCategory: Record<ProjectCategory, number>
}

export type AdminProjectRow = {
  id: string
  slug: string
  title: string
  category: ProjectCategory
  status: ProjectRow['status']
  featured: boolean
  displayOrder: number
  published: boolean
  archived: boolean
  updatedAt: string
}

export async function getAdminStats(): Promise<AdminStats> {
  if (!isSupabaseConfigured()) {
    const rows = isDevStoreEnabled() ? await devListAll() : []
    return {
      total: rows.length,
      published: rows.filter((row) => row.published && !row.archived).length,
      drafts: rows.filter((row) => !row.published && !row.archived).length,
      archived: rows.filter((row) => row.archived).length,
      byCategory: {
        desenvolvimento: rows.filter((row) => row.category === 'desenvolvimento').length,
        remodelacao: rows.filter((row) => row.category === 'remodelacao').length,
      },
    }
  }

  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from('projects')
    .select('category, published, archived')

  if (error) {
    console.error('[admin] getAdminStats', error.message)
    return {
      total: 0,
      published: 0,
      drafts: 0,
      archived: 0,
      byCategory: { desenvolvimento: 0, remodelacao: 0 },
    }
  }

  const rows = data ?? []
  return {
    total: rows.length,
    published: rows.filter((row) => row.published && !row.archived).length,
    drafts: rows.filter((row) => !row.published && !row.archived).length,
    archived: rows.filter((row) => row.archived).length,
    byCategory: {
      desenvolvimento: rows.filter((row) => row.category === 'desenvolvimento').length,
      remodelacao: rows.filter((row) => row.category === 'remodelacao').length,
    },
  }
}

export type AdminListOptions = {
  search?: string
  sort?: 'ordem' | 'titulo' | 'atualizado'
}

export async function listAdminProjects(options: AdminListOptions = {}): Promise<AdminProjectRow[]> {
  if (!isSupabaseConfigured()) {
    const rows = isDevStoreEnabled() ? await devListAll() : []
    const search = options.search?.trim().toLowerCase()
    const filtered = search
      ? rows.filter(
          (row) =>
            row.title.toLowerCase().includes(search) || row.slug.toLowerCase().includes(search),
        )
      : rows

    const sorted = filtered.slice()
    if (options.sort === 'titulo') sorted.sort((a, b) => a.title.localeCompare(b.title, 'pt'))
    else if (options.sort === 'atualizado')
      sorted.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    else
      sorted.sort(
        (a, b) => a.displayOrder - b.displayOrder || b.createdAt.localeCompare(a.createdAt),
      )

    return sorted.map((row) => ({
      id: row.id,
      slug: row.slug,
      title: row.title,
      category: row.category,
      status: row.status,
      featured: row.featured,
      displayOrder: row.displayOrder,
      published: row.published,
      archived: row.archived,
      updatedAt: row.updatedAt,
    }))
  }

  const supabase = await createSupabaseServerClient()

  let query = supabase
    .from('projects')
    .select('id, slug, title, category, status, featured, display_order, published, archived, updated_at')

  const search = options.search?.trim()
  if (search) {
    // `ilike` cobre título e slug; chega para o volume esperado no painel.
    query = query.or(`title.ilike.%${search}%,slug.ilike.%${search}%`)
  }

  switch (options.sort) {
    case 'titulo':
      query = query.order('title', { ascending: true })
      break
    case 'atualizado':
      query = query.order('updated_at', { ascending: false })
      break
    default:
      query = query.order('display_order', { ascending: true }).order('created_at', {
        ascending: false,
      })
  }

  const { data, error } = await query
  if (error) {
    console.error('[admin] listAdminProjects', error.message)
    return []
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    slug: row.slug,
    title: row.title,
    category: row.category,
    status: row.status,
    featured: row.featured,
    displayOrder: row.display_order,
    published: row.published,
    archived: row.archived,
    updatedAt: row.updated_at,
  }))
}

/** Projeto completo para edição — inclui rascunhos e arquivados. */
export async function getAdminProject(id: string): Promise<Project | null> {
  if (!isSupabaseConfigured()) {
    return isDevStoreEnabled() ? devGetById(id) : null
  }

  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from('projects')
    .select('*, project_media(*)')
    .eq('id', id)
    .maybeSingle()

  if (error || !data) return null

  const { project_media: mediaRows, ...row } = data as ProjectRow & {
    project_media: ProjectMediaRow[] | null
  }

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
    media: (mediaRows ?? [])
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
