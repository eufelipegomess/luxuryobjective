'use client'

import { ButtonLink } from '@/components/ui/Button'
import { MediaSlot } from '@/components/ui/MediaSlot'
import { SplitLines } from '@/components/motion/SplitLines'
import { media } from '@/lib/media'
import { routes } from '@/lib/config'
import { home } from '@/content/pt-PT'
import { prefersReducedMotion } from '@/lib/animations/gsap'
import { insetFromAnchor, proportionalInset } from '@/lib/animations/clip'
import { useGsapContext } from '@/lib/animations/useGsapContext'
import { noWidow } from '@/lib/utils'

/**
 * Apresentação da empresa.
 *
 * A copy é longa e não pode ser cortada, por isso a respiração vem da
 * distribuição: a primeira frase ganha escala, e as restantes partem-se em duas
 * colunas curtas. A imagem começa com a altura exata do bloco de texto e, ao
 * scrollar, abre para a esquerda até preencher a secção enquanto o texto sai.
 *
 * A expansão usa `clip-path` a partir de uma âncora medida no layout — nunca
 * percentagens escritas à mão. Em desktop a secção fixa-se e a imagem abre a
 * partir da coluna; em mobile a imagem ganha a largura do ecrã, no rácio da
 * fotografia, e abre das margens da página até às bordas enquanto sobe. Sem
 * JavaScript ou em reduced motion fica tudo em fluxo normal.
 */
export function CompanyIntro() {
  const { opening, rest } = splitSentences(home.apresentacao.body)

  const ref = useGsapContext<HTMLElement>(({ gsap, root }) => {
    if (prefersReducedMotion()) return

    const mm = gsap.matchMedia()

    mm.add('(min-width: 1024px)', () => {
      const stage = root.querySelector<HTMLElement>('[data-intro-stage]')
      const viewport = root.querySelector<HTMLElement>('[data-intro-viewport]')
      const anchor = root.querySelector<HTMLElement>('[data-intro-anchor]')
      const mediaEl = root.querySelector<HTMLElement>('[data-intro-media]')
      const text = root.querySelector<HTMLElement>('[data-intro-text]')
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
          // Recalcula a âncora quando a grelha muda de tamanho.
          invalidateOnRefresh: true,
        },
      })

      tl.fromTo(
        mediaEl,
        { clipPath: () => startInset() },
        { clipPath: 'inset(0% 0% 0% 0%)', ease: 'power2.inOut', duration: 0.62 },
        0.08,
      ).to(text, { opacity: 0, y: -28, ease: 'power2.in', duration: 0.34 }, 0.1)
    })

    // Mobile: a imagem ganha a largura do ecrã, no rácio da fotografia, e abre
    // das margens da página até às bordas enquanto sobe até meio do ecrã. Não
    // vai a ecrã inteiro: uma fotografia horizontal esticada à altura do ecrã
    // perdia a nitidez (ver globals.css).
    mm.add('(max-width: 1023px)', () => {
      const inner = root.querySelector<HTMLElement>('[data-intro-inner]')
      const anchor = root.querySelector<HTMLElement>('[data-intro-anchor]')
      const mediaEl = root.querySelector<HTMLElement>('[data-intro-media]')
      if (!inner || !anchor || !mediaEl) return

      const gutter = () => parseFloat(getComputedStyle(inner).paddingLeft) || 0

      gsap.fromTo(
        mediaEl,
        { clipPath: () => proportionalInset(mediaEl, gutter()) },
        {
          clipPath: 'inset(0px 0px 0px 0px)',
          ease: 'none',
          scrollTrigger: {
            trigger: anchor,
            start: 'top 85%',
            end: 'center 50%',
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
      <div data-intro-stage className="relative">
        <div data-intro-viewport className="relative overflow-hidden">
          <div data-intro-inner className="shell py-(--spacing-section)">
            <div className="grid-editorial gap-y-12">
              <div data-intro-text className="col-span-4 md:col-span-8 lg:col-span-7">
                <h2 className="text-title uppercase text-bone lg:text-[clamp(1.75rem,2.4vw,2.5rem)]">
                  <SplitLines text={opening} />
                </h2>

                {rest.length > 0 ? (
                  <div className="mt-10 grid gap-x-10 gap-y-6 md:grid-cols-2">
                    {rest.map((sentence, index) => (
                      <p
                        key={index}
                        data-reveal
                        data-delay={0.1 + index * 0.08}
                        className="text-base leading-relaxed text-bone-muted md:text-[0.9375rem]"
                      >
                        {noWidow(sentence)}
                      </p>
                    ))}
                  </div>
                ) : null}

                <div data-reveal data-delay="0.25" className="mt-12 hidden lg:block">
                  <ButtonLink href={routes.empresa} variant="secondary" withArrow>
                    {home.apresentacao.cta}
                  </ButtonLink>
                </div>
              </div>

              {/* Âncora: define onde a imagem começa e que altura tem. Em modo
                  de movimento é a mídia que a preenche por `position: absolute`;
                  em fluxo, a mídia fica aqui dentro, no seu lugar normal. */}
              <div
                data-intro-anchor
                className="col-span-4 md:col-span-8 lg:col-span-5 lg:col-start-8"
              >
                <div
                  data-intro-media
                  className="h-full w-full"
                >
                  {/* `100vw` e não a largura da coluna: em modo de movimento
                      esta imagem passa a cobrir o ecrã inteiro. Com `42vw` o
                      Next servia uma imagem de ~600px esticada a 1440 — era
                      daí que vinha a falta de nitidez. */}
                  <MediaSlot
                    media={media.apresentacao}
                    fillParent
                    priority
                    sizes="100vw"
                    className="h-full min-h-[280px] w-full"
                  />
                </div>
              </div>

              {/* Abaixo de lg o botão vem depois da imagem. */}
              <div data-reveal className="col-span-4 md:col-span-8 lg:hidden">
                <ButtonLink href={routes.empresa} variant="secondary" withArrow>
                  {home.apresentacao.cta}
                </ButtonLink>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/**
 * Separa a primeira frase das restantes.
 * Puramente tipográfico: nenhuma palavra é alterada, acrescentada ou removida.
 */
function splitSentences(text: string): { opening: string; rest: string[] } {
  const sentences = text.match(/[^.!?]+[.!?]+(\s|$)/g)?.map((part) => part.trim()) ?? []
  const [opening, ...rest] = sentences
  if (!opening) return { opening: text, rest: [] }
  return { opening, rest }
}
