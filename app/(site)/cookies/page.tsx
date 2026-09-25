import type { Metadata } from 'next'
import { LegalDocument } from '@/components/layout/LegalDocument'
import { cookies } from '@/content/legal'

export const metadata: Metadata = {
  title: cookies.title,
  description:
    'O site público da Luxury Objective não guarda cookies. Esta página explica o que existe na área reservada e porque não há pedido de autorização.',
  alternates: { canonical: '/cookies' },
}

export default function CookiesPage() {
  return <LegalDocument doc={cookies} />
}
