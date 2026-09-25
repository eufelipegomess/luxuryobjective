import { siteConfig } from '@/lib/config'
import { contacto } from '@/content/pt-PT'

/**
 * JSON-LD Organization apenas com dados confirmados pelo cliente: nome, morada,
 * telefones, e-mail e os perfis sociais. Sem data de fundação, avaliações,
 * preços ou coordenadas — nada disso foi fornecido.
 *
 * O `sameAs` é o que liga a empresa aos perfis: sem ele, o Google vê um site e
 * três páginas sociais sem relação declarada entre si.
 */
export function OrganizationJsonLd() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteConfig.name,
    description: siteConfig.tagline,
    url: siteConfig.url,
    email: siteConfig.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: siteConfig.address.street,
      postalCode: siteConfig.address.postalCode,
      addressLocality: siteConfig.address.locality,
      addressRegion: siteConfig.address.region,
      addressCountry: siteConfig.address.country,
    },
    sameAs: contacto.redes.map((rede) => rede.href),
    contactPoint: siteConfig.phones.map((telephone) => ({
      '@type': 'ContactPoint',
      telephone,
      contactType: 'customer service',
      availableLanguage: 'Portuguese',
    })),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}

export function BreadcrumbJsonLd({ items }: { items: { name: string; url: string }[] }) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${siteConfig.url}${item.url}`,
    })),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}
