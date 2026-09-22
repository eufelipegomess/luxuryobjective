'use client'

import { cn } from '@/lib/utils'

/**
 * Região de estado do formulário. `aria-live="polite"` faz com que sucesso e
 * erro sejam anunciados por leitor de ecrã, e o marcador textual garante que a
 * informação não depende só da cor.
 */
export function FormStatus({
  status,
  message,
}: {
  status: 'idle' | 'sending' | 'success' | 'error'
  message: string | null
}) {
  return (
    <p
      role="status"
      aria-live="polite"
      className={cn(
        'min-h-6 text-sm transition-colors',
        status === 'error' && 'text-gold',
        status === 'success' && 'text-bone',
        status !== 'error' && status !== 'success' && 'text-bone-muted',
      )}
    >
      {message}
    </p>
  )
}
