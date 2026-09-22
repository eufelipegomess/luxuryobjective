'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'

/**
 * Login do painel.
 *
 * A mensagem de erro é sempre a mesma, aconteça o que acontecer: dizer
 * "e-mail não existe" confirmaria contas a quem estivesse a sondar.
 */
export function LoginForm({ next }: { next: string }) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setPending(true)
    setError(null)

    const supabase = createSupabaseBrowserClient()
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })

    if (signInError) {
      setError('Credenciais inválidas.')
      setPending(false)
      return
    }

    router.replace(next)
    router.refresh()
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <label htmlFor="email" className="text-eyebrow text-bone-muted">
          E-mail
        </label>
        <input
          id="email"
          type="email"
          required
          autoComplete="username"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="min-h-[52px] w-full border border-line bg-ink-raised px-4 py-3 focus:border-gold focus:outline-none"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="password" className="text-eyebrow text-bone-muted">
          Palavra-passe
        </label>
        <input
          id="password"
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="min-h-[52px] w-full border border-line bg-ink-raised px-4 py-3 focus:border-gold focus:outline-none"
        />
      </div>

      <p role="alert" aria-live="polite" className="min-h-5 text-sm text-gold">
        {error}
      </p>

      <Button type="submit" variant="primary" disabled={pending} className="w-full">
        {pending ? 'A entrar…' : 'Entrar'}
      </Button>
    </form>
  )
}
