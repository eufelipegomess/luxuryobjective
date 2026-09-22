'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { brand } from '@/lib/media'
import { registerGsap, prefersReducedMotion } from '@/lib/animations/gsap'
import { site } from '@/content/pt-PT'

const SESSION_KEY = 'lo:preloader-seen'
const MIN_MS = 900
const MAX_MS = 1600

/**
 * Preloader curto, construído sobre o monograma real da marca. Aparece uma vez
 * por sessão, nunca impõe atraso artificial se os assets já estiverem prontos,
 * e é ignorado por completo em `prefers-reduced-motion`.
 */
export function Preloader() {
  const [active, setActive] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (prefersReducedMotion()) return
    try {
      if (sessionStorage.getItem(SESSION_KEY)) return
    } catch {
      // sessionStorage bloqueado (modo privado): salta o preloader.
      return
    }
    setActive(true)
  }, [])

  useEffect(() => {
    if (!active) return
    const root = rootRef.current
    if (!root) return

    const gsap = registerGsap()
    document.body.style.overflow = 'hidden'
    const start = performance.now()

    const ctx = gsap.context(() => {
      gsap.set('[data-preloader-mark]', { opacity: 0, y: 12 })
      gsap.set('[data-preloader-rule]', { scaleX: 0, transformOrigin: 'left center' })

      gsap
        .timeline()
        .to('[data-preloader-mark]', { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' })
        .to('[data-preloader-rule]', { scaleX: 1, duration: 0.75, ease: 'power2.inOut' }, '-=0.35')
    }, root)

    const exit = () => {
      const gsapInstance = registerGsap()
      gsapInstance.to(root, {
        yPercent: -100,
        duration: 0.7,
        ease: 'power3.inOut',
        onComplete: () => {
          document.body.style.overflow = ''
          setActive(false)
        },
      })
      try {
        sessionStorage.setItem(SESSION_KEY, '1')
      } catch {
        /* ignorado */
      }
    }

    const finish = () => {
      const elapsed = performance.now() - start
      const wait = Math.max(0, MIN_MS - elapsed)
      window.setTimeout(exit, wait)
    }

    // Sai assim que a página estiver pronta; MAX_MS é apenas um teto de segurança.
    const cap = window.setTimeout(exit, MAX_MS)
    if (document.readyState === 'complete') {
      finish()
    } else {
      window.addEventListener('load', finish, { once: true })
    }

    return () => {
      window.clearTimeout(cap)
      window.removeEventListener('load', finish)
      ctx.revert()
      document.body.style.overflow = ''
    }
  }, [active])

  if (!active) return null

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-ink"
      role="status"
      aria-live="polite"
    >
      <span className="sr-only">{site.name}</span>
      <div className="flex flex-col items-center gap-6" aria-hidden="true">
        <Image
          data-preloader-mark
          src={brand.iconPrimary}
          alt=""
          width={44}
          height={81}
          priority
          className="h-16 w-auto"
        />
        <span data-preloader-rule className="block h-px w-32 bg-gold" />
      </div>
    </div>
  )
}
