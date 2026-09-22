'use client'

import { useEffect, useLayoutEffect } from 'react'
import { ensureMotionFlags } from '@/lib/animations/flags'

// Antes da pintura, para não haver um piscar do estado sem movimento quando o
// React tiver acabado de limpar os atributos. No servidor não há layout, e o
// React avisa se lá encontrar useLayoutEffect.
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect

/**
 * Repõe as flags de movimento no <html> a seguir à hidratação.
 *
 * Fica em primeiro lugar dentro do <body> de propósito: os efeitos correm por
 * ordem de árvore, portanto este corre antes de qualquer secção que dependa das
 * flags. Ainda assim, quem precisa delas chama `ensureMotionFlags()` por si —
 * ordem nenhuma devia ser condição para o site funcionar.
 *
 * Ver `lib/animations/flags.ts` para o motivo de isto existir.
 */
export function MotionFlags() {
  useIsomorphicLayoutEffect(() => {
    ensureMotionFlags()
  }, [])

  return null
}
