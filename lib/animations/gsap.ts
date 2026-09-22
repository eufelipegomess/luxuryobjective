'use client'

/**
 * Motor de animação único: GSAP + ScrollTrigger. Nenhuma outra biblioteca de
 * animação entra no projeto e nenhum plugin de licença paga é usado — o split
 * de texto é feito por `SplitLines`, um componente próprio e leve.
 */

import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

let registered = false

export function registerGsap(): typeof gsap {
  if (!registered && typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger)
    // Em mobile a barra do browser muda a altura da janela a meio do scroll;
    // recalcular tudo nesse instante fazia as secções animadas saltarem.
    ScrollTrigger.config({ ignoreMobileResize: true })
    gsap.defaults({ ease: 'power3.out', duration: 0.9 })
    registered = true
  }
  return gsap
}

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/** Ponteiro fino = rato/trackpad. Gate para hover, magnetismo e Lenis. */
export function hasFinePointer(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(hover: hover) and (pointer: fine)').matches
}

export { gsap, ScrollTrigger }
