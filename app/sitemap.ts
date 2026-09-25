import type { MetadataRoute } from 'next'
import { getPublishedSlugs } from '@/lib/queries/projects'
import { siteConfig } from '@/lib/config'

/** Páginas fixas + todos os projetos publicados. /admin nunca entra. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const projects = await getPublishedSlugs()

  // As páginas legais entram, com prioridade baixa: são para quem as procura,
  // não para competir com as de negócio.
  const staticRoutes = [
    { path: '', priority: 1 },
    { path: '/empresa', priority: 0.8 },
    { path: '/servicos', priority: 0.8 },
    { path: '/projetos', priority: 0.8 },
    { path: '/contacto', priority: 0.8 },
    { path: '/privacidade', priority: 0.2 },
    { path: '/cookies', priority: 0.2 },
  ].map(({ path, priority }) => ({
    url: `${siteConfig.url}${path}`,
    changeFrequency: 'monthly' as const,
    priority,
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
