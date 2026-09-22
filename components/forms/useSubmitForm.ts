'use client'

import { useCallback, useState } from 'react'
import type { UseFormReturn, FieldValues, Path } from 'react-hook-form'
import type { SubmissionKind } from '@/lib/types'
import { ui } from '@/content/pt-PT'

type Status = 'idle' | 'sending' | 'success' | 'error'

/**
 * Envio partilhado por todos os formulários.
 *
 * Em caso de sucesso os dados NÃO são apagados: o utilizador pode querer rever
 * o que enviou. Os erros do servidor são reprojetados nos campos respetivos,
 * e o foco vai para o primeiro campo com erro.
 */
export function useSubmitForm<T extends FieldValues>(kind: SubmissionKind, form: UseFormReturn<T>) {
  const [status, setStatus] = useState<Status>('idle')
  const [message, setMessage] = useState<string | null>(null)

  const focusFirstError = useCallback(() => {
    const first = Object.keys(form.formState.errors)[0]
    if (first) form.setFocus(first as Path<T>)
  }, [form])

  const submit = useCallback(
    async (values: T) => {
      setStatus('sending')
      setMessage(null)

      try {
        const response = await fetch(`/api/forms/${kind}`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(values),
        })

        const data = (await response.json().catch(() => ({}))) as {
          error?: string
          issues?: Record<string, string[]>
        }

        if (!response.ok) {
          if (data.issues) {
            for (const [field, messages] of Object.entries(data.issues)) {
              const text = messages[0]
              if (text) form.setError(field as Path<T>, { type: 'server', message: text })
            }
            focusFirstError()
          }
          setStatus('error')
          setMessage(data.error ?? ui.erroEnvio)
          return
        }

        setStatus('success')
        setMessage(ui.sucessoEnvio)
      } catch {
        setStatus('error')
        setMessage(ui.erroEnvio)
      }
    },
    [kind, form, focusFirstError],
  )

  return { status, message, submit, focusFirstError }
}
