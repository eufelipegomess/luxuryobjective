'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { isSupabaseConfigured } from '@/lib/supabase/env'
import { requireAdmin } from '@/lib/supabase/auth'
import { projectSchema, projectMediaSchema, type ProjectInput } from '@/lib/validations/project'
import { slugify } from '@/lib/utils'
import type { Project } from '@/lib/types'
import {
  devCreate,
  devDelete,
  devDuplicate,
  devGetById,
  devSaveMedia,
  devSlugTaken,
  devUpdate,
  isDevStoreEnabled,
} from '@/lib/store/dev-store'

export type ActionResult =
  | { ok: true; id?: string }
  | { ok: false; error: string; issues?: Record<string, string[]> }

const NO_DB: ActionResult = {
  ok: false,
  error: 'Base de dados não configurada. Ver README (Supabase).',
}

/** Tudo o que muda no painel invalida estas rotas do site público. */
function revalidatePublic(slug?: string | null) {
  revalidatePath('/')
  revalidatePath('/projetos')
  if (slug) revalidatePath(`/projetos/${slug}`)
  revalidatePath('/sitemap.xml')
}

const empty = (value: string | undefined) => (value && value.length > 0 ? value : null)

/** Linha da base de dados (snake_case). */
function toRow(input: ProjectInput) {
  return {
    title: input.title,
    slug: input.slug,
    category: input.category,
    status: input.status,
    excerpt: empty(input.excerpt),
    location: empty(input.location),
    year: typeof input.year === 'number' ? input.year : null,
    area: empty(input.area),
    typology: empty(input.typology),
    cover_url: empty(input.coverUrl),
    cover_alt: empty(input.coverAlt),
    cover_focal_point: input.coverFocalPoint,
    hero_video_url: empty(input.heroVideoUrl),
    blocks: input.blocks,
    featured: input.featured,
    display_order: input.displayOrder,
    published: input.published,
    seo_title: empty(input.seoTitle),
    seo_description: empty(input.seoDescription),
  }
}

/** Mesma informação, na forma de domínio usada pelo armazenamento local. */
function toDomain(input: ProjectInput): Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'media' | 'archived'> {
  return {
    title: input.title,
    slug: input.slug,
    category: input.category,
    status: input.status,
    excerpt: empty(input.excerpt),
    location: empty(input.location),
    year: typeof input.year === 'number' ? input.year : null,
    area: empty(input.area),
    typology: empty(input.typology),
    coverUrl: empty(input.coverUrl),
    coverAlt: empty(input.coverAlt),
    coverFocalPoint: input.coverFocalPoint,
    heroVideoUrl: empty(input.heroVideoUrl),
    blocks: input.blocks,
    featured: input.featured,
    displayOrder: input.displayOrder,
    published: input.published,
    seoTitle: empty(input.seoTitle),
    seoDescription: empty(input.seoDescription),
  }
}

export async function createProject(input: unknown): Promise<ActionResult> {
  await requireAdmin()

  const parsed = projectSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: 'Dados inválidos.', issues: parsed.error.flatten().fieldErrors }
  }

  if (!isSupabaseConfigured()) {
    if (!isDevStoreEnabled()) return NO_DB
    if (await devSlugTaken(parsed.data.slug)) {
      return { ok: false, error: 'Já existe um projeto com este slug.' }
    }
    const created = await devCreate(toDomain(parsed.data))
    revalidatePublic(created.slug)
    revalidatePath('/admin/projetos')
    return { ok: true, id: created.id }
  }

  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from('projects')
    .insert(toRow(parsed.data))
    .select('id, slug')
    .single()

  if (error) return { ok: false, error: uniqueSlugMessage(error.message) }

  revalidatePublic(data.slug)
  return { ok: true, id: data.id }
}

export async function updateProject(id: string, input: unknown): Promise<ActionResult> {
  await requireAdmin()

  const parsed = projectSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: 'Dados inválidos.', issues: parsed.error.flatten().fieldErrors }
  }

  if (!isSupabaseConfigured()) {
    if (!isDevStoreEnabled()) return NO_DB
    if (await devSlugTaken(parsed.data.slug, id)) {
      return { ok: false, error: 'Já existe um projeto com este slug.' }
    }
    const previous = await devGetById(id)
    const updated = await devUpdate(id, toDomain(parsed.data))
    if (!updated) return { ok: false, error: 'Projeto não encontrado.' }

    revalidatePublic(updated.slug)
    if (previous && previous.slug !== updated.slug) revalidatePublic(previous.slug)
    revalidatePath('/admin/projetos')
    revalidatePath(`/admin/projetos/${id}`)
    return { ok: true, id }
  }

  const supabase = await createSupabaseServerClient()

  // O slug pode ter mudado: revalidar também o antigo, senão fica em cache.
  const { data: previous } = await supabase
    .from('projects')
    .select('slug')
    .eq('id', id)
    .maybeSingle()

  const { error } = await supabase.from('projects').update(toRow(parsed.data)).eq('id', id)
  if (error) return { ok: false, error: uniqueSlugMessage(error.message) }

  revalidatePublic(parsed.data.slug)
  if (previous?.slug && previous.slug !== parsed.data.slug) revalidatePublic(previous.slug)
  revalidatePath(`/admin/projetos/${id}`)

  return { ok: true, id }
}

export async function setPublished(id: string, published: boolean): Promise<ActionResult> {
  await requireAdmin()

  if (!isSupabaseConfigured()) {
    if (!isDevStoreEnabled()) return NO_DB
    const updated = await devUpdate(id, { published })
    if (!updated) return { ok: false, error: 'Projeto não encontrado.' }
    revalidatePublic(updated.slug)
    revalidatePath('/admin/projetos')
    return { ok: true, id }
  }

  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from('projects')
    .update({ published })
    .eq('id', id)
    .select('slug')
    .single()

  if (error) return { ok: false, error: error.message }

  revalidatePublic(data.slug)
  revalidatePath('/admin/projetos')
  return { ok: true, id }
}

export async function setArchived(id: string, archived: boolean): Promise<ActionResult> {
  await requireAdmin()

  if (!isSupabaseConfigured()) {
    if (!isDevStoreEnabled()) return NO_DB
    const updated = await devUpdate(id, { archived })
    if (!updated) return { ok: false, error: 'Projeto não encontrado.' }
    revalidatePublic(updated.slug)
    revalidatePath('/admin/projetos')
    return { ok: true, id }
  }

  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from('projects')
    .update({ archived })
    .eq('id', id)
    .select('slug')
    .single()

  if (error) return { ok: false, error: error.message }

  revalidatePublic(data.slug)
  revalidatePath('/admin/projetos')
  return { ok: true, id }
}

export async function duplicateProject(id: string): Promise<ActionResult> {
  await requireAdmin()

  if (!isSupabaseConfigured()) {
    if (!isDevStoreEnabled()) return NO_DB
    const source = await devGetById(id)
    if (!source) return { ok: false, error: 'Projeto não encontrado.' }
    const copy = await devDuplicate(id, await nextFreeSlug(`${source.slug}-copia`))
    if (!copy) return { ok: false, error: 'Projeto não encontrado.' }
    revalidatePath('/admin/projetos')
    return { ok: true, id: copy.id }
  }

  const supabase = await createSupabaseServerClient()
  const { data: source, error } = await supabase.from('projects').select('*').eq('id', id).single()

  if (error || !source) return { ok: false, error: 'Projeto não encontrado.' }

  const { id: _id, created_at: _createdAt, updated_at: _updatedAt, ...rest } = source

  // A cópia entra sempre como rascunho — duplicar não deve publicar nada.
  const slug = await nextFreeSlug(`${source.slug}-copia`)
  const { data: copy, error: copyError } = await supabase
    .from('projects')
    .insert({ ...rest, slug, published: false, featured: false })
    .select('id')
    .single()

  if (copyError) return { ok: false, error: copyError.message }

  revalidatePath('/admin/projetos')
  return { ok: true, id: copy.id }
}

export async function deleteProject(id: string): Promise<ActionResult> {
  await requireAdmin()

  if (!isSupabaseConfigured()) {
    if (!isDevStoreEnabled()) return NO_DB
    const removed = await devDelete(id)
    if (!removed) return { ok: false, error: 'Projeto não encontrado.' }
    revalidatePublic(removed.slug)
    revalidatePath('/admin/projetos')
    return { ok: true }
  }

  const supabase = await createSupabaseServerClient()

  // Os ficheiros do storage saem antes da linha; pela ordem inversa perderíamos
  // a referência e ficariam órfãos para sempre.
  const { data: mediaRows } = await supabase
    .from('project_media')
    .select('url')
    .eq('project_id', id)

  const paths = (mediaRows ?? [])
    .map((row) => storagePathFromUrl(row.url))
    .filter((path): path is string => path !== null)

  if (paths.length > 0) {
    const { error: storageError } = await supabase.storage.from('project-media').remove(paths)
    if (storageError) {
      return { ok: false, error: `Não foi possível remover os ficheiros: ${storageError.message}` }
    }
  }

  const { data, error } = await supabase
    .from('projects')
    .delete()
    .eq('id', id)
    .select('slug')
    .single()

  if (error) return { ok: false, error: error.message }

  revalidatePublic(data.slug)
  revalidatePath('/admin/projetos')
  return { ok: true }
}

export async function saveProjectMedia(projectId: string, items: unknown): Promise<ActionResult> {
  await requireAdmin()

  const parsed = projectMediaSchema.array().max(60).safeParse(items)
  if (!parsed.success) return { ok: false, error: 'Galeria inválida.' }

  if (!isSupabaseConfigured()) {
    if (!isDevStoreEnabled()) return NO_DB
    const saved = await devSaveMedia(
      projectId,
      parsed.data.map((item) => ({
        url: item.url,
        alt: item.alt,
        caption: item.caption && item.caption.length > 0 ? item.caption : null,
        position: item.position,
        focalPoint: item.focalPoint,
        width: item.width ?? null,
        height: item.height ?? null,
      })),
    )
    if (!saved) return { ok: false, error: 'Projeto não encontrado.' }
    const project = await devGetById(projectId)
    revalidatePublic(project?.slug)
    return { ok: true }
  }

  const supabase = await createSupabaseServerClient()

  const { data: existing } = await supabase
    .from('project_media')
    .select('id, url')
    .eq('project_id', projectId)

  const keptIds = new Set(parsed.data.map((item) => item.id).filter(Boolean))
  const removed = (existing ?? []).filter((row) => !keptIds.has(row.id))

  if (removed.length > 0) {
    const paths = removed
      .map((row) => storagePathFromUrl(row.url))
      .filter((path): path is string => path !== null)
    if (paths.length > 0) await supabase.storage.from('project-media').remove(paths)
    await supabase
      .from('project_media')
      .delete()
      .in(
        'id',
        removed.map((row) => row.id),
      )
  }

  for (const item of parsed.data) {
    const row = {
      project_id: projectId,
      url: item.url,
      alt: item.alt,
      caption: item.caption && item.caption.length > 0 ? item.caption : null,
      position: item.position,
      focal_point: item.focalPoint,
      width: item.width ?? null,
      height: item.height ?? null,
    }

    const { error } = item.id
      ? await supabase.from('project_media').update(row).eq('id', item.id)
      : await supabase.from('project_media').insert(row)

    if (error) return { ok: false, error: error.message }
  }

  const { data: project } = await supabase
    .from('projects')
    .select('slug')
    .eq('id', projectId)
    .maybeSingle()

  revalidatePublic(project?.slug)
  return { ok: true }
}

export async function signOutAdmin(): Promise<void> {
  if (isSupabaseConfigured()) {
    const supabase = await createSupabaseServerClient()
    await supabase.auth.signOut()
  }
  redirect('/admin/login')
}

/** Sugere um slug livre a partir do título. Usado pelo painel. */
export async function suggestSlug(title: string): Promise<string> {
  await requireAdmin()
  return nextFreeSlug(slugify(title))
}

async function nextFreeSlug(base: string): Promise<string> {
  const clean = base.length > 0 ? base : 'projeto'

  if (!isSupabaseConfigured()) {
    if (!isDevStoreEnabled()) return clean
    for (let attempt = 0; attempt < 50; attempt += 1) {
      const candidate = attempt === 0 ? clean : `${clean}-${attempt + 1}`
      if (!(await devSlugTaken(candidate))) return candidate
    }
    return `${clean}-${Date.now()}`
  }

  const supabase = await createSupabaseServerClient()
  for (let attempt = 0; attempt < 50; attempt += 1) {
    const candidate = attempt === 0 ? clean : `${clean}-${attempt + 1}`
    const { data } = await supabase.from('projects').select('id').eq('slug', candidate).maybeSingle()
    if (!data) return candidate
  }

  return `${clean}-${Date.now()}`
}

function uniqueSlugMessage(message: string): string {
  return message.includes('projects_slug_key') || message.includes('duplicate key')
    ? 'Já existe um projeto com este slug.'
    : message
}

/** Converte um URL público do storage no caminho interno do objeto. */
function storagePathFromUrl(url: string): string | null {
  const marker = '/storage/v1/object/public/project-media/'
  const index = url.indexOf(marker)
  if (index === -1) return null
  return decodeURIComponent(url.slice(index + marker.length))
}
