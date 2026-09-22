import type { MetadataRoute } from 'next'
import { getPublishedSlugs } from '@/lib/queries/projects'
import { siteConfig } from '@/lib/config'

/** Páginas fixas + todos os projetos publicados. /admin nunca entra. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const projects = await getPublishedSlugs()

  const staticRoutes = ['', '/empresa', '/servicos', '/projetos', '/contacto'].map((path) => ({
    url: `${siteConfig.url}${path}`,
    changeFrequency: 'monthly' as const,
    priority: path === '' ? 1 : 0.8,
  }))

  return [
    ...staticRoutes,
    ...projects.map((project) => ({
      url: `${siteConfig.url}/projetos/${project.slug}`,
      lastModified: new Date(project.updatedAt),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
  ]
}
