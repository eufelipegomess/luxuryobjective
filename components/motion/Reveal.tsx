'use client'

import { useEffect } from 'react'
import { registerGsap, prefersReducedMotion } from '@/lib/animations/gsap'

const SELECTOR = '[data-reveal], [data-reveal-media]'

/**
 * Controlador único de reveals para toda a aplicação.
 *
 * Usa IntersectionObserver em vez de varrer o DOM num instante fixo, e um
 * MutationObserver para apanhar o que aparece depois — filtrar projetos, abrir
 * um acordeão, revelar um formulário. Com o varrimento único, os elementos
 * criados a seguir ficavam com o estado inicial (imagem em `clip-path`
 * escondido) e só voltavam a aparecer com um recarregamento da página.
 *
 * Regras de movimento (secção 6 do briefing):
 * - textos: fade + deslocamento de 16–24px
 * - imagens: clip-path, sem zoom
 * As headlines por linha são tratadas pelo `SplitLines`, que sabe quando as
 * linhas medidas existem.
 */
export function RevealController() {
  useEffect(() => {
    if (prefersReducedMotion()) return

    const gsap = registerGsap()
    const seen = new WeakSet<Element>()

    const play = (el: HTMLElement) => {
      const delay = Number(el.dataset.delay ?? 0)

      if (el.hasAttribute('data-reveal-media')) {
        gsap.to(el, {
          clipPath: 'inset(0% 0% 0% 0%)',
          duration: 1.2,
          delay,
          ease: 'power3.out',
        })
        return
      }

      gsap.to(el, { opacity: 1, y: 0, duration: 0.9, delay, ease: 'power3.out' })
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          observer.unobserve(entry.target)
          play(entry.target as HTMLElement)
        }
      },
      // Uma margem negativa em baixo evita disparar com o elemento a espreitar
      // um pixel; o que já está na dobra intersecta logo na primeira leitura.
      { rootMargin: '0px 0px -10% 0px' },
    )

    const observe = (root: ParentNode) => {
      const nodes =
        root instanceof Element && root.matches(SELECTOR)
          ? [root, ...Array.from(root.querySelectorAll<HTMLElement>(SELECTOR))]
          : Array.from(root.querySelectorAll<HTMLElement>(SELECTOR))

      for (const node of nodes) {
        if (seen.has(node)) continue
        seen.add(node)
        observer.observe(node)
      }
    }

    observe(document.body)

    const mutations = new MutationObserver((records) => {
      for (const record of records) {
        for (const node of record.addedNodes) {
          if (node.nodeType === Node.ELEMENT_NODE) observe(node as Element)
        }
      }
    })
    mutations.observe(document.body, { childList: true, subtree: true })

    return () => {
      mutations.disconnect()
      observer.disconnect()
    }
  }, [])

  return null
}
