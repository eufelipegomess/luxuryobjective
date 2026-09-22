'use client'

import { ButtonLink } from '@/components/ui/Button'
import { routes } from '@/lib/config'
import { home } from '@/content/pt-PT'
import { prefersReducedMotion } from '@/lib/animations/gsap'
import { useGsapContext } from '@/lib/animations/useGsapContext'

/**
 * Projetos em destaque: faixa editorial de números, integrada ao fundo, sem
 * galeria e sem cards. A contagem corre uma única vez, quando entra no
 * viewport — não repete a cada scroll.
 */
export function Stats() {
  const ref = useGsapContext<HTMLElement>(({ gsap }) => {
    if (prefersReducedMotion()) return

    gsap.utils.toArray<HTMLElement>('[data-count]').forEach((el) => {
      const target = Number(el.dataset.count ?? 0)
      const prefix = el.dataset.prefix ?? ''
      const counter = { value: 0 }

      gsap.to(counter, {
        value: target,
        duration: 1.4,
        ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        onUpdate: () => {
          el.textContent = `${prefix}${Math.round(counter.value)}`
        },
      })
    })
  }, [])

  return (
    <section ref={ref} className="border-y border-line bg-ink" aria-labelledby="destaque-titulo">
      <div className="shell py-(--spacing-section)">
        <h2 id="destaque-titulo" data-reveal className="text-eyebrow text-bone-muted">
          {home.destaque.title}
        </h2>

        <dl className="mt-14 grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {home.destaque.stats.map((stat) => (
            <div key={stat.label} data-reveal className="border-t border-line pt-6">
              <dt className="sr-only">{stat.label}</dt>
              <dd>
                <span
                  data-count={stat.numeric}
                  data-prefix={stat.prefix}
                  className="block font-[family-name:var(--font-display)] text-[clamp(3.5rem,7vw,6rem)] font-extralight leading-none text-bone"
                >
                  {stat.value}
                </span>
                <span className="mt-5 block max-w-[22ch] text-eyebrow text-bone-muted">
                  {stat.label}
                </span>
              </dd>
            </div>
          ))}
        </dl>

        <div data-reveal className="mt-16">
          <ButtonLink href={routes.projetos} variant="secondary" withArrow>
            {home.destaque.cta}
          </ButtonLink>
        </div>
      </div>
    </section>
  )
}
