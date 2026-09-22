'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { isLandscape, type CarouselSlide } from '@/lib/project-slides'
import { imageSource, PHOTO_QUALITY } from '@/lib/images'
import { prefersReducedMotion } from '@/lib/animations/gsap'
import { ui } from '@/content/pt-PT'
import { cn } from '@/lib/utils'

/**
 * Fotografias de um projeto onde antes aparecia só a capa — Home e página
 * Projetos —, para se conhecer o projeto sem ter de o abrir.
 *
 * Deslizar com o dedo (scroll horizontal nativo, com snap), setas e contador;
 * sem autoplay. A moldura é fixa e vem de quem chama, para a página não saltar
 * de altura de uma fotografia para a outra. A capa e as horizontais preenchem
 * a moldura; verticais e quadradas aparecem inteiras sobre uma cópia desfocada
 * de si próprias — cortadas a 16:10 ou a 3:1 ficavam reduzidas a uma faixa.
 */
export function ProjectCarousel({
  slides,
  title,
  frameClassName,
  sizes,
  priority = false,
  reveal = false,
}: {
  slides: CarouselSlide[]
  title: string
  frameClassName: string
  sizes: string
  priority?: boolean
  reveal?: boolean
}) {
  const track = useRef<HTMLDivElement>(null)
  const [index, setIndex] = useState(0)
  const total = slides.length

  useEffect(() => {
    const el = track.current
    if (!el) return
    let frame = 0
    const onScroll = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        setIndex(Math.round(el.scrollLeft / Math.max(1, el.clientWidth)))
      })
    }
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      el.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(frame)
    }
  }, [])

  const go = (next: number) => {
    const el = track.current
    if (!el || total === 0) return
    const target = (next + total) % total
    el.scrollTo({ left: target * el.clientWidth, behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
  }

  if (total === 0) return null

  return (
    <div
      role="region"
      aria-roledescription="carrossel"
      aria-label={`${ui.fotografiasDe} ${title}`}
      className="relative"
      {...(reveal ? { 'data-reveal-media': '' } : {})}
    >
      <div
        ref={track}
        tabIndex={0}
        className={cn(
          'flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain bg-ink-raised outline-offset-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
          frameClassName,
        )}
      >
        {slides.map((slide, i) => {
          const fill = slide.cover || isLandscape(slide)
          const eager = priority && i === 0
          return (
            <div
              key={slide.url}
              role="group"
              aria-roledescription="diapositivo"
              aria-label={`${i + 1} / ${total}`}
              className="relative h-full w-full shrink-0 snap-center overflow-hidden"
            >
              {!fill ? (
                // Fundo: a mesma fotografia, pequena e desfocada — só textura.
                <Image
                  src={imageSource(slide.url)}
                  alt=""
                  aria-hidden="true"
                  fill
                  sizes="12vw"
                  loading="lazy"
                  className="scale-110 object-cover opacity-50 blur-2xl"
                />
              ) : null}
              <Image
                src={imageSource(slide.url)}
                alt={slide.alt}
                fill
                sizes={sizes}
                quality={PHOTO_QUALITY}
                {...(eager ? { priority: true } : { loading: 'lazy' as const })}
                className={fill ? 'object-cover' : 'object-contain'}
                style={fill ? { objectPosition: slide.focalPoint } : undefined}
              />
            </div>
          )
        })}
      </div>

      {total > 1 ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-between gap-4 bg-gradient-to-t from-ink/60 to-transparent p-4 md:p-5">
          <span className="text-eyebrow text-bone" aria-live="polite">
            {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
          </span>
          <span className="pointer-events-auto flex gap-2">
            <ArrowButton label={ui.fotoAnterior} direction="prev" onClick={() => go(index - 1)} />
            <ArrowButton label={ui.fotoSeguinte} direction="next" onClick={() => go(index + 1)} />
          </span>
        </div>
      ) : null}
    </div>
  )
}

function ArrowButton({
  label,
  direction,
  onClick,
}: {
  label: string
  direction: 'prev' | 'next'
  onClick: () => void
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="flex h-11 w-11 items-center justify-center border border-bone/40 bg-ink/40 text-bone backdrop-blur-sm transition-colors duration-300 hover:border-gold hover:text-gold"
    >
      <svg viewBox="0 0 16 16" aria-hidden="true" className="h-4 w-4">
        <path
          d={direction === 'prev' ? 'M10 3 5 8l5 5' : 'M6 3l5 5-5 5'}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
        />
      </svg>
    </button>
  )
}
