import type { Metadata } from 'next'
import { LegalPending } from '@/components/layout/LegalPending'
import { footer } from '@/content/pt-PT'

export const metadata: Metadata = {
  title: footer.privacidade,
  alternates: { canonical: '/privacidade' },
  robots: { index: false, follow: true },
}

/**
 * TODO (conteúdo real pendente): substituir por a política de privacidade
 * aprovada pelo cliente. Não publicamos texto jurídico fictício — a rota existe
 * para que os links do rodapé sejam válidos e para que o texto real entre sem
 * mexer no layout. Ver README, secção "Pendências de conteúdo".
 */
export default function PrivacidadePage() {
  return <LegalPending title={footer.privacidade} />
}
