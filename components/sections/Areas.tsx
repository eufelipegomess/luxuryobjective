'use client'

import { useRef } from 'react'
import { ButtonLink } from '@/components/ui/Button'
import { MediaSlot } from '@/components/ui/MediaSlot'
import { media } from '@/lib/media'
import { routes } from '@/lib/config'
import { home } from '@/content/pt-PT'
import { prefersReducedMotion } from '@/lib/animations/gsap'
import { useGsapContext } from '@/lib/animations/useGsapContext'
import { noWidow } from '@/lib/utils'

const panelMedia = [media.areaDesenvolvimento, media.areaRemodelacao] as const

/** Cada área leva aos seus projetos — antes as duas iam para a lista toda. */
const areaHref = {
  desenvolvimento: routes.projetosDesenvolvimento,
  remodelacao: routes.projetosRemodelacao,
} as const

/**
 * As duas áreas de atuação — a secção que o briefing manda destacar acima de
 * tudo. Não são dois cards: são dois painéis de largura total.
 *
 * Desktop: pin curto e uma máscara vertical que revela o segundo painel por
 * cima do primeiro, com uma barra de progresso fina a dizer que existem duas
 * áreas (sem números decorativos).
 * Mobile: dois blocos verticais completos, sem pin e sem hover.
 */
export function Areas() {
  const progressRef = useRef<HTMLSpanElement>(null)

  const ref = useGsapContext<HTMLElement>(({ gsap, root }) => {
    if (prefersReducedMotion()) return

    const mm = gsap.matchMedia()

    mm.add('(min-width: 1024px)', () => {
      const second = root.querySelector<HTMLElement>('[data-panel="1"]')
      const progress = progressRef.current
      if (!second) return

      gsap.set(second, { clipPath: 'inset(0% 0% 0% 100%)' })

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root,
          start: 'top top',
          end: '+=110%',
          pin: true,
          scrub: 0.5,
          anticipatePin: 1,
        },
      })

      tl.to(second, { clipPath: 'inset(0% 0% 0% 0%)', ease: 'none' }, 0)
      if (progress) tl.fromTo(progress, { scaleX: 0.5 }, { scaleX: 1, ease: 'none' }, 0)
    })

    return () => mm.revert()
  }, [])

  return (
    <section ref={ref} className="relative bg-ink" aria-labelledby="areas-titulo">
      {/* A sobreposição dos dois painéis vive em CSS sob `[data-motion]` (ver
          globals.css). Sem JavaScript ou em reduced motion, os painéis ficam
          empilhados em fluxo — caso contrário o segundo tapava o primeiro e o
          Desenvolvimento Imobiliário deixava de estar acessível. */}
      <div data-areas-stack className="relative">
        <div data-areas-head className="shell pt-(--spacing-section)">
          <h2 id="areas-titulo" data-reveal className="text-eyebrow text-bone-muted">
            {home.areas.title}
          </h2>
          <span
            aria-hidden="true"
            data-areas-progress
            className="mt-5 hidden h-px w-full origin-left bg-line"
          >
            <span ref={progressRef} className="block h-px w-full origin-left bg-gold" />
          </span>
        </div>

        {home.areas.blocks.map((block, index) => (
          <article
            key={block.id}
            data-panel={index}
            data-areas-panel
            className={index === 0 ? 'relative mt-12' : 'relative mt-(--spacing-section-tight)'}
          >
            <AreaPanel
              index={index}
              title={block.title}
              body={block.body}
              cta={block.cta}
              href={areaHref[block.id]}
              last={index === home.areas.blocks.length - 1}
            />
          </article>
        ))}
      </div>
    </section>
  )
}

function AreaPanel({
  index,
  title,
  body,
  cta,
  href,
  last,
}: {
  index: number
  title: string
  body: string
  cta: string
  href: string
  last: boolean
}) {
  const slot = panelMedia[index] ?? media.areaDesenvolvimento

  return (
    <div className="relative h-full">
      {/* Mídia de fundo só quando os painéis estão sobrepostos; em fluxo, a
          imagem entra por baixo do texto (ver abaixo). */}
      <div data-areas-bg className="absolute inset-0 -z-10 hidden">
        <MediaSlot media={slot} fillParent sizes="100vw" className="h-full w-full" />
        <div aria-hidden="true" className="absolute inset-0 bg-ink/72" />
      </div>

      <div className="shell flex h-full flex-col justify-end pb-(--spacing-section-tight) lg:pb-24">
        <div className="grid-editorial items-end gap-y-10">
          <div className="col-span-4 md:col-span-8 lg:col-span-6">
            <h3 className="text-headline text-bone">{title}</h3>
            <p data-reveal className="measure mt-6 text-bone-muted">
              {noWidow(body)}
            </p>
            <div data-reveal data-delay="0.1" className="mt-10 hidden lg:block">
              <ButtonLink href={href} variant={last ? 'primary' : 'secondary'} withArrow>
                {cta}
              </ButtonLink>
            </div>
          </div>

          {/* Em fluxo (mobile, sem JS, reduced motion) a mídia fica por baixo
              do texto em vez de servir de fundo ao painel. */}
          <div data-areas-inline className="col-span-4 md:col-span-8">
            <MediaSlot media={slot} reveal sizes="100vw" />
          </div>

          {/* Abaixo de lg o botão passa para depois da imagem: primeiro vê-se a
              obra, depois a ação. */}
          <div data-reveal className="col-span-4 md:col-span-8 lg:hidden">
            <ButtonLink href={href} variant={last ? 'primary' : 'secondary'} withArrow>
              {cta}
            </ButtonLink>
          </div>
        </div>
      </div>
    </div>
  )
}
