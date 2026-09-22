'use client'

import { useLayoutEffect, useRef, type RefObject } from 'react'
import { registerGsap, ScrollTrigger, type gsap as GsapType } from './gsap'

type Setup = (ctx: { gsap: typeof GsapType; root: HTMLElement }) => void

/**
 * Cria um `gsap.context` com scope no elemento devolvido e limpa-o — com todos
 * os ScrollTriggers criados lá dentro — no unmount. É isto que impede triggers
 * duplicados ao navegar entre rotas do App Router.
 */
export function useGsapContext<T extends HTMLElement = HTMLDivElement>(
  setup: Setup,
  deps: unknown[] = [],
): RefObject<T | null> {
  const ref = useRef<T | null>(null)
  const setupRef = useRef(setup)
  setupRef.current = setup

  useLayoutEffect(() => {
    const root = ref.current
    if (!root) return

    const gsap = registerGsap()
    const ctx = gsap.context(() => setupRef.current({ gsap, root }), root)

    // O layout estabiliza depois das fontes; sem isto os triggers ficam com
    // posições calculadas contra texto ainda por trocar.
    const refresh = () => ScrollTrigger.refresh()
    if (document.fonts?.status === 'loaded') {
      refresh()
    } else {
      void document.fonts?.ready.then(refresh)
    }

    return () => ctx.revert()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return ref
}
