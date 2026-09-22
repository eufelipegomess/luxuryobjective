'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useRef, useState, useTransition } from 'react'
import { BlocksEditor } from './BlocksEditor'
import { MediaManager, toGalleryItems, type GalleryItem } from './MediaManager'
import { createProject, saveProjectMedia, updateProject } from '@/lib/actions/projects'
import {
  CATEGORY_LABELS,
  PROJECT_CATEGORIES,
  PROJECT_STATUSES,
  STATUS_LABELS,
  type ContentBlock,
  type Project,
  type ProjectCategory,
  type ProjectStatus,
} from '@/lib/types'
import { slugify } from '@/lib/utils'

const field =
  'w-full min-h-[48px] border border-line bg-ink-raised px-4 py-3 text-bone focus:border-gold focus:outline-none'
const labelClass = 'flex flex-col gap-2 text-eyebrow text-bone-muted'

type FormState = {
  title: string
  slug: string
  category: ProjectCategory
  status: ProjectStatus
  excerpt: string
  location: string
  year: string
  area: string
  typology: string
  coverUrl: string
  coverAlt: string
  coverFocalPoint: string
  heroVideoUrl: string
  featured: boolean
  displayOrder: string
  published: boolean
  seoTitle: string
  seoDescription: string
}

function initialState(project?: Project): FormState {
  return {
    title: project?.title ?? '',
    slug: project?.slug ?? '',
    category: project?.category ?? 'desenvolvimento',
    status: project?.status ?? 'em-desenvolvimento',
    excerpt: project?.excerpt ?? '',
    location: project?.location ?? '',
    year: project?.year ? String(project.year) : '',
    area: project?.area ?? '',
    typology: project?.typology ?? '',
    coverUrl: project?.coverUrl ?? '',
    coverAlt: project?.coverAlt ?? '',
    coverFocalPoint: project?.coverFocalPoint ?? '50% 50%',
    heroVideoUrl: project?.heroVideoUrl ?? '',
    featured: project?.featured ?? false,
    displayOrder: String(project?.displayOrder ?? 0),
    published: project?.published ?? false,
    seoTitle: project?.seoTitle ?? '',
    seoDescription: project?.seoDescription ?? '',
  }
}

/**
 * Criação e edição de projeto.
 *
 * O slug acompanha o título enquanto o editor não lhe tocar; a partir daí fica
 * como ele o deixou, para não partir URLs já publicados.
 */
export function ProjectForm({ project }: { project?: Project }) {
  const router = useRouter()
  const [state, setState] = useState<FormState>(() => initialState(project))
  const [blocks, setBlocks] = useState<ContentBlock[]>(project?.blocks ?? [])
  const [gallery, setGallery] = useState<GalleryItem[]>(() =>
    project ? toGalleryItems(project.media) : [],
  )
  const [error, setError] = useState<string | null>(null)
  const [issues, setIssues] = useState<Record<string, string[]>>({})
  const [pending, startTransition] = useTransition()
  const slugTouched = useRef(project !== undefined)
  const coverInput = useRef<HTMLInputElement>(null)
  const [coverUploading, setCoverUploading] = useState(false)

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setState((previous) => ({ ...previous, [key]: value }))

  const onTitleChange = (value: string) => {
    setState((previous) => ({
      ...previous,
      title: value,
      slug: slugTouched.current ? previous.slug : slugify(value),
    }))
  }

  const uploadCover = async (file: File) => {
    setCoverUploading(true)
    setError(null)
    const body = new FormData()
    body.append('file', file)
    try {
      const response = await fetch('/api/admin/media', { method: 'POST', body })
      const data = (await response.json()) as { url?: string; error?: string }
      if (response.ok && data.url) {
        set('coverUrl', data.url)
      } else {
        setError(data.error ?? 'Falha no upload da capa.')
      }
    } catch {
      setError('Falha no upload da capa.')
    }
    setCoverUploading(false)
  }

  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)
    setIssues({})

    const payload = {
      ...state,
      year: state.year === '' ? '' : Number(state.year),
      displayOrder: Number(state.displayOrder),
      blocks,
    }

    startTransition(async () => {
      const result = project
        ? await updateProject(project.id, payload)
        : await createProject(payload)

      if (!result.ok) {
        setError(result.error)
        setIssues(result.issues ?? {})
        return
      }

      const id = result.id
      if (id) {
        const mediaResult = await saveProjectMedia(
          id,
          gallery.map((item, index) => ({
            id: item.id,
            url: item.url,
            alt: item.alt,
            caption: item.caption,
            position: index,
            focalPoint: item.focalPoint,
            width: item.width,
            height: item.height,
          })),
        )
        if (!mediaResult.ok) {
          setError(mediaResult.error)
          return
        }
      }

      router.push('/admin/projetos')
      router.refresh()
    })
  }

  const fieldError = (key: string) => issues[key]?.[0]

  return (
    <form onSubmit={submit} className="flex flex-col gap-12">
      <p role="alert" aria-live="polite" className="min-h-5 text-sm text-gold">
        {error}
      </p>

      <section className="flex flex-col gap-6">
        <h2 className="text-eyebrow text-gold">Identificação</h2>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <label className={labelClass}>
            Título
            <input
              value={state.title}
              onChange={(event) => onTitleChange(event.target.value)}
              required
              className={field}
            />
            <FieldError message={fieldError('title')} />
          </label>

          <label className={labelClass}>
            Slug
            <input
              value={state.slug}
              onChange={(event) => {
                slugTouched.current = true
                set('slug', event.target.value)
              }}
              required
              className={field}
            />
            <FieldError message={fieldError('slug')} />
          </label>

          <label className={labelClass}>
            Categoria
            <select
              value={state.category}
              onChange={(event) => set('category', event.target.value as ProjectCategory)}
              className={field}
            >
              {PROJECT_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {CATEGORY_LABELS[category]}
                </option>
              ))}
            </select>
          </label>

          <label className={labelClass}>
            Estado
            <select
              value={state.status}
              onChange={(event) => set('status', event.target.value as ProjectStatus)}
              className={field}
            >
              {PROJECT_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {STATUS_LABELS[status]}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className={labelClass}>
          Descrição breve
          <Hint>
            Uma a três frases: o que é o projeto, onde fica e o que o distingue. Aparece em destaque
            em “Sobre o projeto” e junto ao projeto na Home.
          </Hint>
          <textarea
            value={state.excerpt}
            onChange={(event) => set('excerpt', event.target.value)}
            rows={3}
            placeholder="Ex.: Conjunto de cinco moradias contemporâneas em [localidade], atualmente em execução."
            className={field}
          />
        </label>
      </section>

      <section className="flex flex-col gap-6">
        <h2 className="text-eyebrow text-gold">Ficha</h2>
        <Hint>Aparece em “Sobre o projeto”. Campos vazios não são mostrados no site.</Hint>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
          <label className={labelClass}>
            Localização
            <input
              value={state.location}
              onChange={(event) => set('location', event.target.value)}
              placeholder="Ex.: Porto"
              className={field}
            />
          </label>
          <label className={labelClass}>
            Ano
            <input
              value={state.year}
              inputMode="numeric"
              onChange={(event) => set('year', event.target.value)}
              placeholder="Ex.: 2026"
              className={field}
            />
            <FieldError message={fieldError('year')} />
          </label>
          <label className={labelClass}>
            Área
            <input
              value={state.area}
              onChange={(event) => set('area', event.target.value)}
              placeholder="Ex.: 1 200 m²"
              className={field}
            />
          </label>
          <label className={labelClass}>
            Tipologia
            <input
              value={state.typology}
              onChange={(event) => set('typology', event.target.value)}
              placeholder="Ex.: Moradias T4"
              className={field}
            />
          </label>
        </div>
      </section>

      <section className="flex flex-col gap-6">
        <h2 className="text-eyebrow text-gold">Capa e vídeo</h2>

        <div className="flex flex-col gap-4 md:flex-row md:items-start">
          <div className="relative h-32 w-52 shrink-0 overflow-hidden border border-line bg-ink-raised">
            {state.coverUrl ? (
              <Image
                src={state.coverUrl}
                alt=""
                fill
                sizes="208px"
                className="object-cover"
                style={{ objectPosition: state.coverFocalPoint }}
              />
            ) : (
              <span className="flex h-full items-center justify-center text-eyebrow text-bone-muted">
                Sem capa
              </span>
            )}
          </div>

          <div className="flex flex-1 flex-col gap-4">
            <input
              ref={coverInput}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              className="sr-only"
              onChange={(event) => {
                const file = event.target.files?.[0]
                event.target.value = ''
                if (file) void uploadCover(file)
              }}
            />
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => coverInput.current?.click()}
                disabled={coverUploading}
                className="min-h-[48px] border border-line px-5 py-3 text-nav text-bone-muted hover:text-bone disabled:opacity-50"
              >
                {coverUploading ? 'A carregar…' : 'Carregar capa'}
              </button>
              {state.coverUrl ? (
                <button
                  type="button"
                  onClick={() => set('coverUrl', '')}
                  className="min-h-[48px] border border-line px-5 py-3 text-nav text-bone-muted hover:text-gold"
                >
                  Remover capa
                </button>
              ) : null}
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <label className={labelClass}>
                Texto alternativo da capa
                <input
                  value={state.coverAlt}
                  onChange={(event) => set('coverAlt', event.target.value)}
                  className={field}
                />
              </label>
              <label className={labelClass}>
                Focal point da capa
                <input
                  value={state.coverFocalPoint}
                  onChange={(event) => set('coverFocalPoint', event.target.value)}
                  placeholder="50% 50%"
                  className={field}
                />
                <FieldError message={fieldError('coverFocalPoint')} />
              </label>
            </div>

            <label className={labelClass}>
              URL do vídeo de hero (opcional)
              <input
                value={state.heroVideoUrl}
                onChange={(event) => set('heroVideoUrl', event.target.value)}
                className={field}
              />
            </label>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-6">
        <h2 className="text-eyebrow text-gold">Descrição completa</h2>
        <Hint>
          Texto da página do projeto, por baixo da descrição breve: um ou dois parágrafos sobre o
          projeto, um subtítulo como “Destaques” e uma lista com os pontos principais.
        </Hint>
        <BlocksEditor blocks={blocks} onChange={setBlocks} />
      </section>

      <section className="flex flex-col gap-6">
        <h2 className="text-eyebrow text-gold">Galeria</h2>
        <MediaManager items={gallery} onChange={setGallery} />
      </section>

      <section className="flex flex-col gap-6">
        <h2 className="text-eyebrow text-gold">Publicação e SEO</h2>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <label className={labelClass}>
            Ordem de apresentação
            <input
              value={state.displayOrder}
              inputMode="numeric"
              onChange={(event) => set('displayOrder', event.target.value)}
              className={field}
            />
          </label>

          <div className="flex flex-col gap-4 pt-6">
            <label className="flex items-center gap-3 text-bone">
              <input
                type="checkbox"
                checked={state.featured}
                onChange={(event) => set('featured', event.target.checked)}
                className="h-5 w-5 accent-[color:var(--color-gold)]"
              />
              Destacar na Home
            </label>
            <label className="flex items-center gap-3 text-bone">
              <input
                type="checkbox"
                checked={state.published}
                onChange={(event) => set('published', event.target.checked)}
                className="h-5 w-5 accent-[color:var(--color-gold)]"
              />
              Publicado
            </label>
          </div>

          <label className={labelClass}>
            Título SEO
            <input
              value={state.seoTitle}
              onChange={(event) => set('seoTitle', event.target.value)}
              className={field}
            />
          </label>
          <label className={labelClass}>
            Descrição SEO
            <input
              value={state.seoDescription}
              onChange={(event) => set('seoDescription', event.target.value)}
              className={field}
            />
          </label>
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-4 border-t border-line pt-8">
        <button
          type="submit"
          disabled={pending}
          className="min-h-[52px] bg-gold px-8 py-4 text-nav text-ink disabled:opacity-50"
        >
          {pending ? 'A guardar…' : project ? 'Guardar alterações' : 'Criar projeto'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/admin/projetos')}
          className="min-h-[52px] border border-line px-8 py-4 text-nav text-bone-muted hover:text-bone"
        >
          Cancelar
        </button>
      </div>
    </form>
  )
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <span className="text-sm normal-case tracking-normal text-gold">{message}</span>
}

/** Orientação curta por baixo do rótulo: o que escrever e onde aparece no site. */
function Hint({ children }: { children: string }) {
  return <span className="text-sm normal-case tracking-normal text-bone-muted/80">{children}</span>
}
