'use client'

import { MediaSlot } from '@/components/ui/MediaSlot'
import { SplitLines } from '@/components/motion/SplitLines'
import { media } from '@/lib/media'
import { empresa } from '@/content/pt-PT'
import { prefersReducedMotion } from '@/lib/animations/gsap'
import { cardInset, insetFromAnchor } from '@/lib/animations/clip'
import { useGsapContext } from '@/lib/animations/useGsapContext'

/**
 * Abertura da página Empresa.
 *
 * "Quem somos" ao centro, em escala grande, com o texto por baixo. Ao scrollar,
 * a imagem abre a partir de uma banda central para os dois lados até preencher
 * a hero, e o texto retira-se.
 *
 * Como na Home, a expansão parte de uma âncora medida no layout e usa
 * `clip-path` — não anima largura. Em mobile a imagem ganha a largura do ecrã
 * e abre de cartão para ecrã inteiro enquanto sobe. Sem JavaScript ou em
 * reduced motion fica texto centrado seguido da imagem, em fluxo.
 */
export function EmpresaHero() {
  const ref = useGsapContext<HTMLElement>(({ gsap, root }) => {
    if (prefersReducedMotion()) return

    const mm = gsap.matchMedia()

    mm.add('(min-width: 1024px)', () => {
      const stage = root.querySelector<HTMLElement>('[data-empresa-stage]')
      const viewport = root.querySelector<HTMLElement>('[data-empresa-viewport]')
      const anchor = root.querySelector<HTMLElement>('[data-empresa-anchor]')
      const mediaEl = root.querySelector<HTMLElement>('[data-empresa-media]')
      const text = root.querySelector<HTMLElement>('[data-empresa-text]')
      if (!stage || !viewport || !anchor || !mediaEl || !text) return

      const startInset = () => insetFromAnchor(viewport, anchor)
      gsap.set(mediaEl, { clipPath: startInset() })

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: stage,
          start: 'top top',
          end: '+=170%',
          pin: true,
          scrub: 0.6,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      })

      tl.fromTo(
        mediaEl,
        { clipPath: () => startInset() },
        { clipPath: 'inset(0% 0% 0% 0%)', ease: 'power2.inOut', duration: 0.62 },
        0.08,
      ).to(text, { opacity: 0, y: -24, ease: 'power2.in', duration: 0.32 }, 0.1)
    })

    // Mobile: a imagem ganha a largura do ecrã e abre de cartão para ecrã
    // inteiro enquanto sobe; depois fica colada ao topo um instante (sticky, no
    // CSS) antes de seguir. Sem pin: no iOS o pin salta quando a barra do
    // browser encolhe.
    mm.add('(max-width: 1023px)', () => {
      const inner = root.querySelector<HTMLElement>('[data-empresa-inner]')
      const anchor = root.querySelector<HTMLElement>('[data-empresa-anchor]')
      const mediaEl = root.querySelector<HTMLElement>('[data-empresa-media]')
      if (!inner || !anchor || !mediaEl) return

      const gutter = () => parseFloat(getComputedStyle(inner).paddingLeft) || 0

      gsap.fromTo(
        mediaEl,
        { clipPath: () => cardInset(mediaEl, gutter(), 0.62) },
        {
          clipPath: 'inset(0px 0px 0px 0px)',
          ease: 'none',
          scrollTrigger: {
            trigger: anchor,
            // A imagem está logo abaixo do texto: começa a abrir só quando já se vê
            // inteira como cartão, e não logo à entrada da página.
            start: 'top 60%',
            end: 'top top',
            scrub: 0.4,
            invalidateOnRefresh: true,
          },
        },
      )
    })

    return () => mm.revert()
  }, [])

  return (
    <section ref={ref} className="bg-ink">
      <div data-empresa-stage className="relative">
        <div data-empresa-viewport className="relative overflow-hidden">
          <div
            data-empresa-inner
            className="shell pb-(--spacing-section) pt-[clamp(7rem,16vh,10rem)]"
          >
            <div data-empresa-text className="relative z-10 flex flex-col items-center text-center">
              <h1 className="text-display text-bone">
                <SplitLines text={empresa.quemSomos.title} delay={0.1} />
              </h1>
              <p
                data-reveal
                data-delay="0.2"
                className="mt-8 max-w-[46rem] leading-relaxed text-bone-muted"
              >
                {empresa.quemSomos.body}
              </p>
            </div>

            {/* Âncora: a banda central de onde a imagem parte. */}
            {/* Banda larga o suficiente para se ler como imagem, não como
                recorte: a janela mostra a zona central da fotografia. */}
            <div data-empresa-anchor className="mx-auto mt-14 w-full max-w-[46rem]">
              <div data-empresa-media className="h-full w-full">
                <MediaSlot
                  media={media.empresaHero}
                  fillParent
                  priority
                  // Em mobile a imagem 16:9 cobre um ecrã vertical inteiro:
                  // à altura do ecrã, fica ~3,9× mais larga do que ele. Com
                  // `100vw` o Next servia uma imagem estreita e esticava-a.
                  sizes="(max-width: 1023px) 390vw, 100vw"
                  className="h-full min-h-[220px] w-full"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
