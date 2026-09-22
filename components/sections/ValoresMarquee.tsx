'use client'

import { useRef } from 'react'
import { prefersReducedMotion } from '@/lib/animations/gsap'
import { useGsapContext } from '@/lib/animations/useGsapContext'

/**
 * Valores em faixa contínua.
 *
 * Linear: todas as palavras com o mesmo tamanho, o mesmo peso e a mesma linha
 * de base. Sem separadores — é o espaçamento que as separa.
 *
 * A lista é duplicada e a translação vai a exatamente -50%, o que faz a emenda
 * cair no sítio e o movimento parecer contínuo em vez de saltar. O servidor e o
 * cliente renderizam sempre o mesmo DOM; é o CSS que, em
 * `prefers-reduced-motion`, transforma a faixa numa lista com quebra de linha.
 */
export function ValoresMarquee({ values }: { values: readonly string[] }) {
  const trackRef = useRef<HTMLUListElement>(null)

  const ref = useGsapContext<HTMLDivElement>(({ gsap, root }) => {
    if (prefersReducedMotion()) return

    gsap.fromTo(
      root.querySelectorAll('[data-valor]'),
      { opacity: 0, y: 24 },
      {
        opacity: 1,
        y: 0,
        duration: 0.7,
        stagger: 0.05,
        ease: 'power3.out',
        scrollTrigger: { trigger: root, start: 'top 85%', once: true },
      },
    )

    const track = trackRef.current
    if (!track) return

    const loop = gsap.to(track, { xPercent: -50, duration: 52, ease: 'none', repeat: -1 })

    // Abrandar ao passar o rato deixa o valor legível sem parar a faixa.
    const slow = () => gsap.to(loop, { timeScale: 0.2, duration: 0.6 })
    const resume = () => gsap.to(loop, { timeScale: 1, duration: 0.6 })
    track.addEventListener('pointerenter', slow)
    track.addEventListener('pointerleave', resume)

    return () => {
      track.removeEventListener('pointerenter', slow)
      track.removeEventListener('pointerleave', resume)
    }
  }, [])

  return (
    <div ref={ref} data-marquee className="relative -mx-(--spacing-gutter) overflow-hidden">
      {/* Esbatimento nas pontas: a faixa entra e sai em vez de ser cortada. */}
      <span
        aria-hidden="true"
        data-marquee-fade
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-ink via-ink/80 to-transparent md:w-44"
      />
      <span
        aria-hidden="true"
        data-marquee-fade
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-ink via-ink/80 to-transparent md:w-44"
      />

      <ul ref={trackRef} data-marquee-track className="flex w-max items-baseline">
        {[0, 1].map((copy) =>
          values.map((valor) => (
            <li
              key={`${copy}-${valor}`}
              data-valor
              data-marquee-copy={copy}
              // A segunda cópia existe só para a emenda: o leitor de ecrã lê a
              // lista uma única vez.
              aria-hidden={copy === 1 ? 'true' : undefined}
              className="whitespace-nowrap px-[clamp(1.5rem,3.5vw,3.5rem)] font-[family-name:var(--font-display)] text-[clamp(1.5rem,3.4vw,2.5rem)] leading-tight text-bone"
            >
              {valor}
            </li>
          )),
        )}
      </ul>
    </div>
  )
}
