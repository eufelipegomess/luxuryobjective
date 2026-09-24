import Image from 'next/image'
import type { ProjectMedia } from '@/lib/types'
import { cn } from '@/lib/utils'
import { imageSource, PHOTO_QUALITY } from '@/lib/images'

/**
 * - `wide`: horizontal, à largura toda.
 * - `small`: horizontal a meia largura, aos pares. É o que acontece a uma
 *   horizontal de pouca resolução (menos de 1600 px), que a largura toda
 *   esticaria, e às fotografias que seguem a que abre um bloco.
 * - `tall`: vertical ou quadrada, a meia largura em 4:5.
 */
type Kind = 'wide' | 'small' | 'tall'

/**
 * Quando o conjunto tem legendas, elas marcam onde começa cada bloco — no
 * O'LUZIA, cada uma das cinco moradias. Aí só a fotografia que abre o bloco
 * ocupa a largura toda e as outras seguem aos pares: com 43 horizontais
 * seguidas, todas à largura toda, a página passava dos 36 000 px, quarenta
 * ecrãs de scroll sem um único momento de respiração.
 *
 * Sem legendas nenhumas não há blocos que marcar, e vale o critério antigo:
 * horizontal com resolução chegue, largura toda.
 */
function kindOf(item: ProjectMedia, index: number, porBlocos: boolean): Kind {
  if (!item.width || !item.height) return index % 3 === 0 ? 'wide' : 'tall'
  if (item.width / item.height < 1.2) return 'tall'
  if (item.width < 1600) return 'small'
  return porBlocos ? (item.caption ? 'wide' : 'small') : 'wide'
}

/**
 * Galeria do projeto, pela ordem definida no painel.
 *
 * A moldura segue a fotografia. Antes o ritmo era fixo — uma larga a cada três
 * — e uma fachada vertical que calhasse no lugar largo ficava cortada a 16:9,
 * sem as casas. Agora:
 * - horizontais ocupam a largura toda, no seu próprio rácio; as de pouca
 *   resolução vão a meia largura, aos pares;
 * - verticais e quadradas vão a meia largura, todas em 4:5 — cortam pouco e as
 *   linhas fecham à mesma altura.
 * Uma fotografia de meia largura sem par (quando o painel tem um número ímpar
 * delas seguidas) fica centrada, em vez de deixar um buraco ao lado.
 *
 * Nada é pré-carregado: abaixo da dobra fica tudo em lazy loading, e o
 * aspect ratio reserva o espaço para não haver layout shift.
 */
export function ProjectGallery({ items }: { items: ProjectMedia[] }) {
  if (items.length === 0) return null

  const porBlocos = items.some((item) => item.caption)
  const kinds = items.map((item, index) => kindOf(item, index, porBlocos))
  const orphans = new Set<number>()
  for (let i = 0; i < items.length; ) {
    if (kinds[i] === 'wide') {
      i++
    } else if (kinds[i + 1] === kinds[i]) {
      i += 2
    } else {
      orphans.add(i)
      i++
    }
  }

  return (
    <ul className="grid grid-cols-1 gap-x-8 gap-y-12 md:grid-cols-2">
      {items.map((item, index) => {
        const kind = kinds[index] ?? 'tall'
        const wide = kind === 'wide'
        const orphan = orphans.has(index)

        const aspectRatio =
          kind === 'tall'
            ? '4 / 5'
            : item.width && item.height
              ? `${item.width} / ${item.height}`
              : '16 / 9'

        return (
          <li key={item.id} className={wide || orphan ? 'md:col-span-2' : undefined}>
            <figure className={cn(orphan && 'md:mx-auto md:w-[calc(50%-1rem)]')}>
              <div
                data-reveal-media
                className="relative overflow-hidden bg-ink-raised"
                style={{ aspectRatio }}
              >
                <Image
                  src={imageSource(item.url)}
                  alt={item.alt}
                  fill
                  quality={PHOTO_QUALITY}
                  loading="lazy"
                  sizes={wide ? '100vw' : '(min-width: 768px) 48vw, 100vw'}
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
        )
      })}
    </ul>
  )
}
