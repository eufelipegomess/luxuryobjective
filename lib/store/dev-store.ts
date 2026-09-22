import 'server-only'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import { randomUUID } from 'node:crypto'
import type { Project, ProjectMedia } from '@/lib/types'
import { isSupabaseConfigured } from '@/lib/supabase/env'
import { fallbackProjects } from '@/lib/queries/fallback'

/**
 * Armazenamento local de desenvolvimento.
 *
 * Existe para o painel de administração ser utilizável antes de haver um
 * projeto Supabase: guarda os projetos num ficheiro JSON em `.data/` e as
 * imagens em `public/uploads/`.
 *
 * NÃO É PRODUÇÃO. Está trancado a dois cadeados — só funciona fora de
 * `NODE_ENV=production` e só quando o Supabase não está configurado. Assim que
 * as variáveis do Supabase existirem, todo o site passa a ler e escrever lá e
 * este módulo deixa de ser tocado. Em produção sem Supabase, o painel fecha-se
 * (ver `middleware.ts`) em vez de cair para aqui — um painel sem autenticação
 * exposto na internet seria bem pior do que um painel indisponível.
 */

const DATA_FILE = path.join(process.cwd(), '.data', 'projects.json')

export function isDevStoreEnabled(): boolean {
  return process.env.NODE_ENV !== 'production' && !isSupabaseConfigured()
}

function assertEnabled(): void {
  if (!isDevStoreEnabled()) {
    throw new Error(
      'Armazenamento local indisponível: só funciona em desenvolvimento e sem Supabase configurado.',
    )
  }
}

async function readAll(): Promise<Project[]> {
  try {
    const raw = await fs.readFile(DATA_FILE, 'utf8')
    const parsed: unknown = JSON.parse(raw)
    if (parsed && typeof parsed === 'object' && Array.isArray((parsed as { projects?: unknown }).projects)) {
      return (parsed as { projects: Project[] }).projects
    }
    return []
  } catch {
    // Primeira utilização: arranca com os dois projetos aprovados — com a
    // galeria incluída — os mesmos que o site mostra sem base de dados.
    return fallbackProjects.map((project) => ({
      ...project,
      media: project.media.map((item) => ({ ...item })),
    }))
  }
}

async function writeAll(projects: Project[]): Promise<void> {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true })
  await fs.writeFile(DATA_FILE, JSON.stringify({ projects }, null, 2), 'utf8')
}

function now(): string {
  return new Date().toISOString()
}

/** Lista completa, incluindo rascunhos e arquivados. Uso do painel. */
export async function devListAll(): Promise<Project[]> {
  return readAll()
}

/** Só o que o site público pode ver. */
export async function devListPublished(): Promise<Project[]> {
  const all = await readAll()
  return all
    .filter((project) => project.published && !project.archived)
    .sort((a, b) => a.displayOrder - b.displayOrder || b.createdAt.localeCompare(a.createdAt))
}

export async function devGetBySlug(slug: string): Promise<Project | null> {
  const all = await readAll()
  return all.find((project) => project.slug === slug) ?? null
}

export async function devGetById(id: string): Promise<Project | null> {
  const all = await readAll()
  return all.find((project) => project.id === id) ?? null
}

export async function devSlugTaken(slug: string, exceptId?: string): Promise<boolean> {
  const all = await readAll()
  return all.some((project) => project.slug === slug && project.id !== exceptId)
}

export async function devCreate(
  data: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'media' | 'archived'>,
): Promise<Project> {
  assertEnabled()
  const all = await readAll()

  const created: Project = {
    ...data,
    id: randomUUID(),
    archived: false,
    media: [],
    createdAt: now(),
    updatedAt: now(),
  }

  await writeAll([...all, created])
  return created
}

export async function devUpdate(
  id: string,
  data: Partial<Omit<Project, 'id' | 'createdAt' | 'media'>>,
): Promise<Project | null> {
  assertEnabled()
  const all = await readAll()
  const index = all.findIndex((project) => project.id === id)
  const current = all[index]
  if (index === -1 || !current) return null

  const updated: Project = { ...current, ...data, id: current.id, updatedAt: now() }
  const next = all.slice()
  next[index] = updated
  await writeAll(next)
  return updated
}

export async function devDelete(id: string): Promise<Project | null> {
  assertEnabled()
  const all = await readAll()
  const target = all.find((project) => project.id === id)
  if (!target) return null

  await writeAll(all.filter((project) => project.id !== id))
  return target
}

export async function devDuplicate(id: string, slug: string): Promise<Project | null> {
  assertEnabled()
  const all = await readAll()
  const source = all.find((project) => project.id === id)
  if (!source) return null

  // A cópia entra sempre como rascunho — duplicar não deve publicar nada.
  const copy: Project = {
    ...source,
    id: randomUUID(),
    slug,
    published: false,
    featured: false,
    createdAt: now(),
    updatedAt: now(),
    media: source.media.map((item) => ({ ...item, id: randomUUID(), projectId: '' })),
  }
  copy.media = copy.media.map((item) => ({ ...item, projectId: copy.id }))

  await writeAll([...all, copy])
  return copy
}

export async function devSaveMedia(
  projectId: string,
  items: Omit<ProjectMedia, 'id' | 'projectId'>[],
): Promise<boolean> {
  assertEnabled()
  const all = await readAll()
  const index = all.findIndex((project) => project.id === projectId)
  const current = all[index]
  if (index === -1 || !current) return false

  const next = all.slice()
  next[index] = {
    ...current,
    updatedAt: now(),
    media: items.map((item) => ({ ...item, id: randomUUID(), projectId })),
  }
  await writeAll(next)
  return true
}
