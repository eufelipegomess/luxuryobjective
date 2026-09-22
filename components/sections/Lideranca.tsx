'use client'

import { MediaSlot } from '@/components/ui/MediaSlot'
import { media } from '@/lib/media'
import { empresa } from '@/content/pt-PT'
import { prefersReducedMotion } from '@/lib/animations/gsap'
import { useGsapContext } from '@/lib/animations/useGsapContext'
import { noWidow } from '@/lib/utils'

const portraits = [media.retratoNathalie, media.retratoBruno] as const

/**
 * A nossa liderança.
 *
 * Com movimento, nada da secção se anuncia antes de tempo: nem o título, nem a
 * superfície clara. A sequência é: a superfície abre de baixo para cima até
 * cobrir o ecrã, o título entra grande ao centro, encolhe e sobe para o topo,
 * e só então passam os perfis, um de cada vez.
 *
 * É a mesma em desktop e em mobile. Muda quem segura o palco — o `pin` em
 * desktop, o `sticky` do CSS em mobile — e quanto o título encolhe e sobe.
 *
 * Sem JavaScript ou em reduced motion fica a superfície clara com o título e os
 * dois perfis empilhados. A troca de layout está em CSS (`[data-motion]`), não
 * em JS, para o servidor e o cliente renderizarem o mesmo DOM.
 */
export function Lideranca() {
  const ref = useGsapContext<HTMLElement>(({ gsap, root }) => {
    if (prefersReducedMotion()) return

    const mm = gsap.matchMedia()

    const sequence = (mode: 'desktop' | 'mobile') => {
      const stage = root.querySelector<HTMLElement>('[data-lideranca-stage]')
      const surface = root.querySelector<HTMLElement>('[data-lideranca-surface]')
      const title = root.querySelector<HTMLElement>('[data-lideranca-title]')
      const people = root.querySelectorAll<HTMLElement>('[data-lideranca-person]')
      if (!stage || !surface || !title || people.length < 2) return

      const [first, second] = Array.from(people)
      if (!first || !second) return

      const desktop = mode === 'desktop'

      /**
       * Quanto o perfil passa da altura do palco — o que tem de subir em mobile
       * para a biografia acabar com a margem de baixo à vista. Mede o fundo do
       * texto diretamente: o `scrollHeight` não conta o padding de baixo e a
       * biografia ficava encostada ao limite do ecrã.
       */
      const overflow = (el: HTMLElement) => {
        const last = el.lastElementChild
        if (!last) return 0
        const pad = parseFloat(getComputedStyle(el).paddingBottom) || 0
        const bottom = last.getBoundingClientRect().bottom - el.getBoundingClientRect().top
        return Math.max(0, bottom + pad - el.clientHeight)
      }

      // Estado de partida: superfície colapsada em baixo, título e perfis fora.
      gsap.set(surface, { clipPath: 'inset(100% 0% 0% 0%)' })
      gsap.set(title, { opacity: 0, y: 48, scale: 1 })
      gsap.set(people, { opacity: 0, yPercent: 5 })

      const tl = gsap.timeline({
        scrollTrigger: desktop
          ? { trigger: stage, start: 'top top', end: '+=380%', pin: true, scrub: 0.6, anticipatePin: 1 }
          : // Em mobile o palco já é alto (CSS) e a viewport cola ao topo: a
            // timeline corre sobre esse percurso, sem pin.
            // `invalidateOnRefresh`: a altura a percorrer em cada perfil
            // depende da largura do ecrã e volta a ser medida.
            { trigger: stage, start: 'top top', end: 'bottom bottom', scrub: 0.6, invalidateOnRefresh: true },
      })

      tl
        // 1. A superfície clara sobe e toma o ecrã.
        .to(surface, { clipPath: 'inset(0% 0% 0% 0%)', ease: 'power2.inOut', duration: 0.16 }, 0)
        // 2. O título entra grande, ao centro.
        .to(title, { opacity: 1, y: 0, ease: 'power3.out', duration: 0.12 }, 0.18)
        // 3. Encolhe e sobe, libertando o centro do palco. O deslocamento é em
        //    px porque `yPercent` seria relativo à altura do próprio título. Em
        //    mobile encolhe menos, para continuar legível num ecrã estreito.
        .to(
          title,
          {
            scale: desktop ? 0.3 : 0.45,
            y: () => -window.innerHeight * (desktop ? 0.34 : 0.36),
            transformOrigin: 'center center',
            ease: 'power2.inOut',
            duration: 0.14,
          },
          0.36,
        )
      // 4. Só agora entram os perfis.
      if (desktop) {
        tl.to(first, { opacity: 1, yPercent: 0, ease: 'power2.out', duration: 0.12 }, 0.5)
          .to(first, { opacity: 0, yPercent: -4, ease: 'power2.in', duration: 0.1 }, 0.68)
          .to(second, { opacity: 1, yPercent: 0, ease: 'power2.out', duration: 0.12 }, 0.76)
      } else {
        // Em mobile cada perfil é mais alto do que o ecrã — o retrato vai em
        // 4:5 para a fotografia aparecer quase inteira. Entra com a fotografia
        // e o nome, sobe até mostrar a biografia inteira e só depois sai.
        tl.to(first, { opacity: 1, yPercent: 0, ease: 'power2.out', duration: 0.06 }, 0.5)
          .to(first, { y: () => -overflow(first), ease: 'none', duration: 0.16 }, 0.57)
          .to(first, { opacity: 0, ease: 'power2.in', duration: 0.05 }, 0.75)
          .to(second, { opacity: 1, yPercent: 0, ease: 'power2.out', duration: 0.06 }, 0.8)
          .to(second, { y: () => -overflow(second), ease: 'none', duration: 0.16 }, 0.87)
      }
    }

    mm.add('(min-width: 1024px)', () => sequence('desktop'))
    // Telemóvel deitado não tem altura para o perfil debaixo do título: fica
    // em fluxo (ver globals.css).
    mm.add('(max-width: 1023px) and (min-height: 481px)', () => sequence('mobile'))

    return () => mm.revert()
  }, [])

  return (
    <section ref={ref} className="bg-ink" aria-labelledby="lideranca-titulo">
      <div data-lideranca-stage className="relative">
        <div data-lideranca-viewport className="relative z-10">
          {/* Superfície clara. Em movimento abre de baixo para cima; em fluxo é
              simplesmente o fundo da secção. Vive dentro da viewport para, em
              mobile, colar ao ecrã com ela — no palco alto abriria sobre uma
              área que não se vê. */}
          <span aria-hidden="true" data-lideranca-surface className="absolute inset-0 bg-bone" />

          <div data-lideranca-inner className="shell relative py-(--spacing-section)">
            {/* O título vive num contentor próprio para poder ser centrado
                pelo CSS e transformado pelo GSAP sem os dois se pisarem. */}
            <div data-lideranca-title-wrap>
              <h2 id="lideranca-titulo" data-lideranca-title className="text-eyebrow text-ink/60">
                {empresa.lideranca.title}
              </h2>
            </div>

            <div data-lideranca-people className="mt-16 flex flex-col gap-(--spacing-section-tight)">
              {empresa.lideranca.people.map((person, index) => (
                <article
                  key={person.id}
                  data-lideranca-person={index}
                  className="grid-editorial items-center gap-y-8"
                >
                  <div
                    data-lideranca-portrait
                    className={
                      index % 2 === 0
                        ? 'col-span-4 md:col-span-4 lg:col-span-4'
                        : 'col-span-4 md:col-span-4 md:col-start-5 lg:col-span-4 lg:col-start-9 lg:row-start-1'
                    }
                  >
                    <MediaSlot
                      media={portraits[index] ?? media.retratoNathalie}
                      reveal
                      sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                    />
                  </div>

                  <div
                    className={
                      index % 2 === 0
                        ? 'col-span-4 md:col-span-8 lg:col-span-6 lg:col-start-6'
                        : 'col-span-4 md:col-span-8 lg:col-span-6 lg:col-start-1 lg:row-start-1'
                    }
                  >
                    <h3 className="text-title text-ink">{person.name}</h3>
                    <p className="mt-3 text-eyebrow text-ink/60">{person.role}</p>
                    <p
                      data-lideranca-bio
                      className="measure mt-8 text-base leading-relaxed text-ink/75 md:text-[0.9375rem]"
                    >
                      {noWidow(person.body)}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
