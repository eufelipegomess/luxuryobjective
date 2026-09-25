'use client'

import Image from 'next/image'
import { useRef, useState } from 'react'
import type { ProjectMedia } from '@/lib/types'

export type GalleryItem = {
  id?: string
  url: string
  alt: string
  caption: string
  focalPoint: string
  width: number | null
  height: number | null
}

export function toGalleryItems(media: ProjectMedia[]): GalleryItem[] {
  return media.map((item) => ({
    id: item.id,
    url: item.url,
    alt: item.alt,
    caption: item.caption ?? '',
    focalPoint: item.focalPoint,
    width: item.width,
    height: item.height,
  }))
}

/**
 * Domínios de onde uma imagem pode vir por link.
 *
 * São os mesmos que o `next.config.ts` autoriza em `remotePatterns`: fora
 * destes o `next/image` recusa-se a servir a imagem e a galeria ficaria com um
 * buraco. Se um dia entrar outro alojamento de imagens, entra nos dois sítios.
 */
const HOSTS = [
  'ik.imagekit.io',
  ...(process.env.NEXT_PUBLIC_SUPABASE_URL
    ? [new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname]
    : []),
]

/**
 * Largura e altura reais, pedidas ao browser.
 *
 * Quem cola um link não sabe as dimensões de cor, e o site precisa delas para
 * reservar o espaço da imagem e para saber se é horizontal. Falhar a medição
 * não impede nada: fica sem dimensões, como já acontecia antes.
 */
function medir(url: string): Promise<{ width: number | null; height: number | null }> {
  return new Promise((resolve) => {
    const img = new window.Image()
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight })
    img.onerror = () => resolve({ width: null, height: null })
    img.src = url
  })
}

/**
 * Galeria do projeto: upload, reordenação e metadados por imagem.
 *
 * As imagens entram por duas vias: do computador, que as guarda no
 * armazenamento do Supabase, ou por link, para as que já estão alojadas
 * noutro sítio — é o caso das do ImageKit, que são a maioria deste site.
 *
 * A reordenação tem duas vias — arrastar com o rato e mover com botões. Só
 * drag-and-drop deixaria de fora quem usa teclado, e o briefing exige o painel
 * navegável por teclado.
 */
export function MediaManager({
  items,
  onChange,
}: {
  items: GalleryItem[]
  onChange: (next: GalleryItem[]) => void
}) {
  const [uploading, setUploading] = useState(false)
  const [link, setLink] = useState('')
  const [aLigar, setALigar] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const dragIndex = useRef<number | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const move = (from: number, to: number) => {
    if (to < 0 || to >= items.length) return
    const next = items.slice()
    const [moved] = next.splice(from, 1)
    if (!moved) return
    next.splice(to, 0, moved)
    onChange(next)
  }

  const patch = (index: number, changes: Partial<GalleryItem>) => {
    onChange(items.map((item, i) => (i === index ? { ...item, ...changes } : item)))
  }

  const upload = async (files: FileList) => {
    setUploading(true)
    setError(null)
    const added: GalleryItem[] = []

    for (const file of Array.from(files)) {
      const body = new FormData()
      body.append('file', file)
      try {
        const response = await fetch('/api/admin/media', { method: 'POST', body })
        const data = (await response.json()) as { url?: string; error?: string }
        if (!response.ok || !data.url) {
          setError(data.error ?? 'Falha no upload.')
          continue
        }
        added.push({
          url: data.url,
          alt: '',
          caption: '',
          focalPoint: '50% 50%',
          width: null,
          height: null,
        })
      } catch {
        setError('Falha no upload.')
      }
    }

    if (added.length > 0) onChange([...items, ...added])
    setUploading(false)
  }

  /** Aceita vários de uma vez: um link por linha, ou separados por espaços. */
  const adicionarPorLink = async () => {
    const enderecos = link.split(/\s+/).filter(Boolean)
    if (enderecos.length === 0) return

    setALigar(true)
    setError(null)
    const added: GalleryItem[] = []
    const recusados: string[] = []

    for (const bruto of enderecos) {
      let alvo: URL
      try {
        alvo = new URL(bruto)
      } catch {
        recusados.push(bruto)
        continue
      }
      if (alvo.protocol !== 'https:' || !HOSTS.includes(alvo.hostname)) {
        recusados.push(bruto)
        continue
      }
      const { width, height } = await medir(alvo.toString())
      added.push({
        url: alvo.toString(),
        alt: '',
        caption: '',
        focalPoint: '50% 50%',
        width,
        height,
      })
    }

    if (added.length > 0) {
      onChange([...items, ...added])
      setLink('')
    }
    if (recusados.length > 0) {
      setError(
        `${recusados.length} link(s) fora dos domínios permitidos (${HOSTS.join(', ')}) ou mal formados.`,
      )
    }
    setALigar(false)
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-4">
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,image/avif"
          className="sr-only"
          onChange={(event) => {
            const files = event.target.files
            event.target.value = ''
            if (files && files.length > 0) void upload(files)
          }}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="min-h-[48px] border border-dashed border-line px-6 py-3 text-nav text-bone-muted hover:border-line-strong hover:text-bone disabled:opacity-50"
        >
          {uploading ? 'A carregar…' : '+ Adicionar imagens'}
        </button>
      </div>

      {/* Entrada por link. Fica ao lado do upload e não escondida atrás de um
          separador: para este site é a via principal — quase todas as
          fotografias já vivem no ImageKit. */}
      <div className="flex flex-col gap-2 border border-line p-4">
        <label htmlFor="media-link" className="text-nav text-bone-muted">
          Ou colar o endereço da imagem
        </label>
        <div className="flex flex-col gap-3 md:flex-row">
          <textarea
            id="media-link"
            rows={2}
            value={link}
            onChange={(event) => setLink(event.target.value)}
            placeholder="https://ik.imagekit.io/…   (um por linha para juntar várias)"
            className="min-h-[48px] w-full border border-line bg-transparent px-3 py-2 text-sm text-bone placeholder:text-bone-muted/60 focus:border-line-strong focus:outline-none"
          />
          <button
            type="button"
            onClick={() => void adicionarPorLink()}
            disabled={aLigar || link.trim().length === 0}
            className="min-h-[48px] shrink-0 border border-line px-6 text-nav text-bone-muted hover:border-line-strong hover:text-bone disabled:opacity-50"
          >
            {aLigar ? 'A juntar…' : 'Juntar à galeria'}
          </button>
        </div>
        <p className="text-xs text-bone-muted/70">
          Aceita imagens de {HOSTS.join(' e ')}. As dimensões são lidas automaticamente.
        </p>
      </div>

      <p role="alert" aria-live="polite" className="text-sm text-gold">
        {error}
      </p>

      {items.length === 0 ? (
        <p className="border border-line p-6 text-sm text-bone-muted">Sem imagens na galeria.</p>
      ) : (
        <ul className="flex flex-col gap-4">
          {items.map((item, index) => (
            <li
              key={item.id ?? item.url}
              draggable
              onDragStart={() => {
                dragIndex.current = index
              }}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault()
                const from = dragIndex.current
                dragIndex.current = null
                if (from !== null) move(from, index)
              }}
              className="flex flex-col gap-4 border border-line p-4 md:flex-row"
            >
              <div className="relative h-28 w-40 shrink-0 overflow-hidden bg-ink-raised">
                <Image
                  src={item.url}
                  alt=""
                  fill
                  sizes="160px"
                  className="object-cover"
                  style={{ objectPosition: item.focalPoint }}
                />
              </div>

              <div className="grid flex-1 grid-cols-1 gap-3 md:grid-cols-3">
                <label className="flex flex-col gap-1 text-eyebrow text-bone-muted md:col-span-2">
                  Texto alternativo
                  <input
                    value={item.alt}
                    onChange={(event) => patch(index, { alt: event.target.value })}
                    className="min-h-[44px] border border-line bg-ink-raised px-3 py-2 text-sm text-bone focus:border-gold focus:outline-none"
                  />
                </label>

                <label className="flex flex-col gap-1 text-eyebrow text-bone-muted">
                  Focal point
                  <input
                    value={item.focalPoint}
                    onChange={(event) => patch(index, { focalPoint: event.target.value })}
                    placeholder="50% 50%"
                    className="min-h-[44px] border border-line bg-ink-raised px-3 py-2 text-sm text-bone focus:border-gold focus:outline-none"
                  />
                </label>

                <label className="flex flex-col gap-1 text-eyebrow text-bone-muted md:col-span-3">
                  Legenda (opcional)
                  <input
                    value={item.caption}
                    onChange={(event) => patch(index, { caption: event.target.value })}
                    className="min-h-[44px] border border-line bg-ink-raised px-3 py-2 text-sm text-bone focus:border-gold focus:outline-none"
                  />
                </label>
              </div>

              <div className="flex shrink-0 flex-row gap-3 md:flex-col">
                <button
                  type="button"
                  onClick={() => move(index, index - 1)}
                  disabled={index === 0}
                  aria-label={`Mover para cima: posição ${index + 1}`}
                  className="min-h-[40px] border border-line px-3 text-sm text-bone-muted hover:text-bone disabled:opacity-30"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => move(index, index + 1)}
                  disabled={index === items.length - 1}
                  aria-label={`Mover para baixo: posição ${index + 1}`}
                  className="min-h-[40px] border border-line px-3 text-sm text-bone-muted hover:text-bone disabled:opacity-30"
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() => onChange(items.filter((_, i) => i !== index))}
                  className="min-h-[40px] border border-line px-3 text-sm text-bone-muted hover:text-gold"
                >
                  Remover
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
