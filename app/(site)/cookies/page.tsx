import type { Metadata } from 'next'
import { LegalPending } from '@/components/layout/LegalPending'
import { footer } from '@/content/pt-PT'

export const metadata: Metadata = {
  title: footer.cookies,
  alternates: { canonical: '/cookies' },
  robots: { index: false, follow: true },
}

/**
 * TODO (conteúdo real pendente): substituir por a política de cookies aprovada
 * pelo cliente. Ver README, secção "Pendências de conteúdo".
 */
export default function CookiesPage() {
  return <LegalPending title={footer.cookies} />
}
