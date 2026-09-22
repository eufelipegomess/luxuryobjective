'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { registerGsap, prefersReducedMotion } from '@/lib/animations/gsap'
import { scrollToHash, scrollToTop } from '@/lib/animations/scroll'

/**
 * Cortina escura curta ao mudar de rota, mais a reposição do scroll no topo —
 * ou na secção da âncora, quando o link aponta para uma (`/projetos#…`).
 *
 * A reposição corre sempre — também em reduced motion e com o Lenis ligado —
 * porque abrir uma página nova a meio do documento é um problema de navegação,
 * não de animação.
 *
 * A navegação nunca é atrasada para a animação acontecer: o Next troca a rota
 * quando quer, e a cortina apenas se retira por cima do resultado. O URL, o
 * botão voltar e o histórico ficam intactos.
 */
export function PageTransition() {
  const pathname = usePathname()
  const curtainRef = useRef<HTMLDivElement>(null)
  const firstRender = useRef(true)

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }

    // Com âncora no URL o destino é essa secção. Antes ia sempre para o topo, e
    // os botões que apontam para uma secção abriam a página no início.
    if (!scrollToHash(window.location.hash)) scrollToTop()

    if (prefersReducedMotion()) return

    const curtain = curtainRef.current
    if (!curtain) return

    const gsap = registerGsap()
    const tl = gsap.timeline()
    tl.set(curtain, { yPercent: 0, opacity: 1 }).to(curtain, {
      yPercent: -100,
      duration: 0.6,
      ease: 'power3.inOut',
    })

    return () => {
      tl.kill()
    }
  }, [pathname])

  return (
    <div
      ref={curtainRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[90] translate-y-[-100%] bg-ink opacity-0"
    />
  )
}
