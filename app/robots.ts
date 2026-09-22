import type { MetadataRoute } from 'next'
import { siteConfig } from '@/lib/config'

export default function robots(): MetadataRoute.Robots {
  // Pré-visualização: fechada a toda a indexação e sem sitemap, para não
  // convidar ninguém a rastrear.
  if (siteConfig.noindex) {
    return { rules: [{ userAgent: '*', disallow: '/' }] }
  }

  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/admin', '/api'] }],
    sitemap: `${siteConfig.url}/sitemap.xml`,
  }
}
