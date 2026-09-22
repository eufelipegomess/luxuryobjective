import { contacto, ui } from '@/content/pt-PT'
import { cn } from '@/lib/utils'

/**
 * Mapa da morada aprovada.
 *
 * Carrega de imediato, por decisão do cliente — a versão anterior exigia um
 * clique de consentimento. Fica em `loading="lazy"`, portanto o pedido ao
 * Google só parte quando o mapa se aproxima da dobra e não pesa no LCP.
 *
 * A query usa a morada literal: nenhuma coordenada foi inventada.
 */
export function MapEmbed({ className }: { className?: string }) {
  const query = encodeURIComponent(contacto.morada)

  return (
    <iframe
      title={ui.mapaTitulo}
      src={`https://www.google.com/maps?q=${query}&output=embed`}
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
      className={cn('h-full w-full border-0', className)}
    />
  )
}
