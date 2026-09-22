'use client'

import { useEffect } from 'react'
import {
  hasFinePointer,
  prefersReducedMotion,
  registerGsap,
  ScrollTrigger,
} from '@/lib/animations/gsap'
import { setLenis } from '@/lib/animations/scroll'

/**
 * Lenis apenas em desktop com ponteiro fino. Em touch/mobile fica o scroll
 * nativo — hijacking em telemóvel prejudica mais do que ajuda e o briefing
 * proíbe-o explicitamente.
 */
export function SmoothScroll() {
  useEffect(() => {
    if (!hasFinePointer() || prefersReducedMotion()) return

    let cancelled = false
    let cleanup: (() => void) | null = null

    void import('lenis').then(({ default: Lenis }) => {
      if (cancelled) return

      const gsap = registerGsap()
      const lenis = new Lenis({ duration: 1.05, smoothWheel: true, touchMultiplier: 1 })
      const tick = (time: number) => lenis.raf(time * 1000)

      document.documentElement.classList.add('lenis-active')
      lenis.on('scroll', ScrollTrigger.update)
      gsap.ticker.add(tick)
      gsap.ticker.lagSmoothing(0)
      // Sem esta referência, repor o scroll ao mudar de rota não funciona.
      setLenis(lenis)

      cleanup = () => {
        gsap.ticker.remove(tick)
        gsap.ticker.lagSmoothing(500, 33)
        setLenis(null)
        lenis.destroy()
        document.documentElement.classList.remove('lenis-active')
      }
    })

    return () => {
      cancelled = true
      cleanup?.()
    }
  }, [])

  return null
}
