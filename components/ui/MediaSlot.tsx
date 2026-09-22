import Image from 'next/image'
import { cn } from '@/lib/utils'
import { imageSource, PHOTO_QUALITY } from '@/lib/images'
import type { MediaRef } from '@/lib/media'

type Props = {
  media: MediaRef
  className?: string
  sizes?: string
  priority?: boolean
  /** Ativa o reveal por clip-path quando entra no viewport. */
  reveal?: boolean
  /** Sobrepõe o alt do mapa de mídia (usado por conteúdo vindo do painel). */
  alt?: string
  /** URL direto — projetos carregados no painel não passam pelo mapa de mídia. */
  src?: string | null
  focalPoint?: string
  /** Ocupa o contentor em vez de reservar o aspect ratio (hero full-bleed). */
  fillParent?: boolean
  /**
   * O rácio vem das classes do chamador, não do mapa de mídia. Necessário
   * porque o rácio normal é aplicado em `style` inline, que ganha sempre a
   * qualquer classe utilitária — incluindo variantes responsivas.
   */
  ratioFromClass?: boolean
}

/**
 * Único ponto de renderização de imagem do site.
 *
 * Quando ainda não existe asset real, desenha um placeholder editorial neutro
 * com o aspect ratio final e o nome do slot. Nada de stock aleatório, nada de
 * URLs externas — e o layout não muda quando a fotografia real chegar.
 */
export function MediaSlot({
  media,
  className,
  sizes = '100vw',
  priority = false,
  reveal = false,
  alt,
  src,
  focalPoint,
  fillParent = false,
  ratioFromClass = false,
}: Props) {
  const resolvedSrc = src ?? media.src
  const resolvedAlt = alt ?? media.alt
  const position = focalPoint ?? media.position ?? '50% 50%'

  return (
    <div
      className={cn('relative overflow-hidden bg-ink-raised', className)}
      style={fillParent || ratioFromClass ? undefined : { aspectRatio: String(media.ratio) }}
      {...(reveal ? { 'data-reveal-media': '' } : {})}
    >
      {resolvedSrc ? (
        <Image
          src={imageSource(resolvedSrc)}
          alt={resolvedAlt}
          fill
          sizes={sizes}
          priority={priority}
          quality={PHOTO_QUALITY}
          // Imagens marcadas `original` (os retratos) vão tal e qual: já são
          // pequenas e qualquer recompressão só lhes tirava detalhe.
          unoptimized={media.original === true && !src}
          className="object-cover"
          style={{
            objectPosition: position,
            // Zoom interno para imagens com um defeito na borda (ver `zoom` em
            // lib/media.ts). Só para a imagem do mapa, não para `src` do painel.
            ...(media.zoom && !src ? { transform: `scale(${media.zoom})` } : {}),
          }}
        />
      ) : (
        <PlaceholderFrame label={media.slot} />
      )}
    </div>
  )
}

/**
 * Placeholder explícito e substituível: superfície neutra, moldura fina e o
 * nome do slot. Deliberadamente não decorativo — deve ler-se como "falta aqui
 * uma fotografia", não como parte do design final.
 */
function PlaceholderFrame({ label }: { label: string }) {
  return (
    <div
      role="img"
      aria-label={label}
      className="absolute inset-0 flex items-end justify-start bg-ink-raised"
    >
      <span
        aria-hidden="true"
        className="absolute inset-3 border border-line md:inset-5"
      />
      <span
        aria-hidden="true"
        className="relative z-10 max-w-[80%] p-6 text-eyebrow text-bone-muted md:p-8"
      >
        {label}
      </span>
    </div>
  )
}
