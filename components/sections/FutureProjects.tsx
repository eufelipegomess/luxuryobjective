'use client'

import { ButtonLink } from '@/components/ui/Button'
import { MediaSlot } from '@/components/ui/MediaSlot'
import { SplitLines } from '@/components/motion/SplitLines'
import { media } from '@/lib/media'
import { prefersReducedMotion } from '@/lib/animations/gsap'
import { useGsapContext } from '@/lib/animations/useGsapContext'
import { noWidow } from '@/lib/utils'

/**
 * Chamada para futuros projetos.
 *
 * Composição centrada dentro de uma moldura, sobre uma imagem arquitetónica
 * recuada — a mesma linguagem de moldura fina usada nos placeholders de mídia,
 * para a secção pertencer à página em vez de parecer um banner colado.
 *
 * A entrada é conduzida pelo scroll: a mídia aproxima-se muito ligeiramente e a
 * moldura ganha opacidade. Nada disto corre em `prefers-reduced-motion`.
 */
export function FutureProjects({
  title,
  body,
  cta,
  href,
}: {
  title: string
  body: string
  cta: string
  href: string
}) {
  const ref = useGsapContext<HTMLElement>(({ gsap, root }) => {
    if (prefersReducedMotion()) return

    gsap.fromTo(
      '[data-future-media]',
      { scale: 1.08, opacity: 0.5 },
      {
        scale: 1,
        opacity: 1,
        ease: 'none',
        scrollTrigger: { trigger: root, start: 'top bottom', end: 'center center', scrub: 0.6 },
      },
    )

    gsap.fromTo(
      '[data-future-frame]',
      { opacity: 0, y: 32 },
      {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: { trigger: root, start: 'top 75%', once: true },
      },
    )
  }, [])

  return (
    <section ref={ref} className="bg-ink" aria-labelledby="futuros-titulo">
      <div className="shell py-(--spacing-section)">
        <div className="relative isolate overflow-hidden">
          {/* Mídia recuada: presença sensorial sem competir com o texto. */}
          <div data-future-media className="absolute inset-0 -z-10 opacity-100">
            <MediaSlot media={media.futuros} fillParent sizes="100vw" className="h-full w-full" />
          </div>
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 bg-ink/78"
          />

          {/* Moldura fina, como nos slots de mídia do resto do site. */}
          <div
            data-future-frame
            className="m-3 border border-line px-6 py-[clamp(3.5rem,8vw,6.5rem)] text-center md:m-6 md:px-12"
          >
            <div className="mx-auto flex max-w-[56rem] flex-col items-center">
              <h2
                id="futuros-titulo"
                // Escala própria: à escala de `text-headline` esta frase
                // partia-se em cinco linhas dentro da moldura.
                className="font-[family-name:var(--font-display)] text-[clamp(1.5rem,2.8vw,2.5rem)] leading-[1.12] tracking-tight text-balance text-bone"
              >
                <SplitLines text={title} />
              </h2>

              <p
                data-reveal
                data-delay="0.15"
                className="mt-7 max-w-[34rem] leading-relaxed text-bone-muted"
              >
                {noWidow(body)}
              </p>

              <div data-reveal data-delay="0.25" className="mt-12">
                <ButtonLink href={href} variant="primary" withArrow magnetic>
                  {cta}
                </ButtonLink>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
