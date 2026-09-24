import Image from 'next/image'
import type { ProjectMedia } from '@/lib/types'
import { imageSource, PHOTO_QUALITY } from '@/lib/images'

/**
 * Galeria do projeto, pela ordem definida no painel.
 *
 * Uma coluna só, todas as fotografias à largura toda e todas em 16:9. A
 * uniformidade é o ponto: as fotografias de um empreendimento vêm de sessões
 * diferentes e trazem rácios ligeiramente diferentes — 4:3, 3:2, 16:9 — e
 * quando cada moldura segue a sua, a página passa a ter degraus de altura a
 * cada duas imagens. Numa moldura fixa o olho desce em linha reta.
 *
 * O que não é 16:9 é cortado pelo centro, ou pelo ponto focal se o painel
 * tiver um definido. Vale a pena confirmar lá as fotografias mais quadradas.
 *
 * Nada é pré-carregado: abaixo da dobra fica tudo em lazy loading, e o
 * aspect ratio reserva o espaço para não haver layout shift.
 */
export function ProjectGallery({ items }: { items: ProjectMedia[] }) {
  if (items.length === 0) return null

  return (
    <ul className="flex flex-col gap-y-12">
      {items.map((item) => (
        <li key={item.id}>
          <figure>
            <div
              data-reveal-media
              className="relative aspect-video overflow-hidden bg-ink-raised"
            >
              <Image
                src={imageSource(item.url)}
                alt={item.alt}
                fill
                quality={PHOTO_QUALITY}
                loading="lazy"
                sizes="100vw"
                className="object-cover"
                style={{ objectPosition: item.focalPoint }}
              />
            </div>
            {/* Legenda só existe se tiver texto — nunca uma linha vazia. */}
            {item.caption ? (
              <figcaption className="mt-4 text-sm text-bone-muted">{item.caption}</figcaption>
            ) : null}
          </figure>
        </li>
      ))}
    </ul>
  )
}
