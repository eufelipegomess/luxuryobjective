import type { Metadata } from 'next'
import { LegalDocument } from '@/components/layout/LegalDocument'
import { privacidade } from '@/content/legal'

export const metadata: Metadata = {
  title: privacidade.title,
  description:
    'Que dados pessoais a Luxury Objective recolhe através do site, porquê, durante quanto tempo os guarda e que direitos lhe assistem.',
  alternates: { canonical: '/privacidade' },
}

export default function PrivacidadePage() {
  return <LegalDocument doc={privacidade} />
}
