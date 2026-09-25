import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { MediaSlot } from '@/components/ui/MediaSlot'
import { SplitLines } from '@/components/motion/SplitLines'
import { ProjectBlocks } from '@/components/projects/ProjectBlocks'
import { ProjectGallery } from '@/components/projects/ProjectGallery'
import { ProjectList } from '@/components/projects/ProjectList'
import { FinalCta } from '@/components/sections/FinalCta'
import { BreadcrumbJsonLd } from '@/components/layout/JsonLd'
import { getProjectBySlug, getPublishedSlugs, getRelatedProjects } from '@/lib/queries/projects'
import { CATEGORY_LABELS, STATUS_LABELS } from '@/lib/types'
import { media } from '@/lib/media'
import { routes, siteConfig } from '@/lib/config'
import { home, nav, ui } from '@/content/pt-PT'
import { compactMeta, noWidow, truncate } from '@/lib/utils'

export const revalidate = 300

type Props = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  const slugs = await getPublishedSlugs()
  return slugs.map(({ slug }) => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const project = await getProjectBySlug(slug)
  if (!project) return {}

  const title = project.seoTitle ?? project.title
  // Sem descrição cadastrada não se inventa uma: fica só o título.
  const description = project.seoDescription ?? (project.excerpt ? truncate(project.excerpt, 155) : undefined)

  return {
    title,
    ...(description ? { description } : {}),
    alternates: { canonical: `/projetos/${project.slug}` },
    openGraph: {
      title,
      ...(description ? { description } : {}),
      url: `/projetos/${project.slug}`,
      images: project.coverUrl ? [{ url: project.coverUrl }] : [siteConfig.ogImage],
    },
  }
}

export default async function ProjetoPage({ params }: Props) {
  const { slug } = await params
  const project = await getProjectBySlug(slug)
  if (!project) notFound()

  const related = await getRelatedProjects(project)

  const meta = compactMeta([
    { label: 'Localização', value: project.location },
    { label: 'Ano', value: project.year },
    { label: 'Área', value: project.area },
    { label: 'Tipologia', value: project.typology },
  ])

  const hasAbout = Boolean(project.excerpt) || meta.length > 0 || project.blocks.length > 0

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: nav.projetos, url: routes.projetos },
          { name: project.title, url: `/projetos/${project.slug}` },
        ]}
      />

      <article>
        <header className="shell pt-[clamp(7rem,16vh,10rem)]">
          <nav aria-label={ui.breadcrumb} className="text-eyebrow text-bone-muted">
            <ol className="flex flex-wrap items-center gap-3">
              <li>
                <Link href={routes.projetos} className="transition-colors hover:text-bone">
                  {nav.projetos}
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li aria-current="page" className="text-bone">
                {project.title}
              </li>
            </ol>
          </nav>

          <h1 className="text-display mt-10 max-w-[16ch] text-bone">
            <SplitLines text={project.title} delay={0.1} />
          </h1>

          <p className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-eyebrow text-bone-muted">
            <span>{CATEGORY_LABELS[project.category]}</span>
            <span aria-hidden="true">·</span>
            <span className="text-gold">{STATUS_LABELS[project.status]}</span>
          </p>

          <div className="mt-14">
            {project.heroVideoUrl ? (
              <video
                muted
                playsInline
                loop
                autoPlay
                preload="metadata"
                aria-hidden="true"
                {...(project.coverUrl ? { poster: project.coverUrl } : {})}
                className="aspect-video w-full object-cover"
              >
                <source src={project.heroVideoUrl} type="video/mp4" />
              </video>
            ) : (
              <MediaSlot
                media={media.projetoFallback}
                src={project.coverUrl}
                alt={project.coverAlt ?? project.title}
                focalPoint={project.coverFocalPoint}
                priority
                sizes="100vw"
              />
            )}
          </div>
        </header>

        <div className="shell py-(--spacing-section)">
          {/* Sobre o projeto: ficha à esquerda, texto à direita (em mobile,
              empilhados). Cada parte só aparece se o painel a tiver preenchido
              — nunca um rótulo sem valor. */}
          {hasAbout ? (
            <section aria-labelledby="sobre-projeto" className="grid-editorial gap-y-12">
              <div className="col-span-4 md:col-span-8 lg:col-span-4">
                <h2 id="sobre-projeto" className="text-eyebrow text-bone-muted">
                  {ui.sobreProjeto}
                </h2>

                {meta.length > 0 ? (
                  <dl className="mt-10 grid grid-cols-2 gap-x-8 gap-y-8 border-t border-line pt-8 lg:grid-cols-1">
                    {meta.map((item) => (
                      <div key={item.label}>
                        <dt className="text-eyebrow text-bone-muted">{item.label}</dt>
                        <dd className="mt-2 text-bone">{item.value}</dd>
                      </div>
                    ))}
                  </dl>
                ) : null}
              </div>

              <div className="col-span-4 md:col-span-8 lg:col-span-7 lg:col-start-6">
                {project.excerpt ? (
                  <p
                    data-reveal
                    className="font-[family-name:var(--font-display)] text-[clamp(1.25rem,2.4vw,2rem)] leading-snug text-bone"
                  >
                    {noWidow(project.excerpt)}
                  </p>
                ) : null}

                {project.blocks.length > 0 ? (
                  <div className={project.excerpt ? 'mt-12' : undefined}>
                    <ProjectBlocks blocks={project.blocks} />
                  </div>
                ) : null}
              </div>
            </section>
          ) : null}

          {project.media.length > 0 ? (
            <div className="mt-(--spacing-section-tight)">
              <ProjectGallery items={project.media} />
            </div>
          ) : null}
        </div>

        {related.length > 0 ? (
          <section className="shell pb-(--spacing-section)" aria-labelledby="relacionados">
            <h2 id="relacionados" className="text-eyebrow border-t border-line pt-8 text-bone-muted">
              {ui.projetosRelacionados}
            </h2>
            <div className="mt-12">
              <ProjectList projects={related} />
            </div>
          </section>
        ) : null}
      </article>

      <FinalCta text={home.chamadaFinal.body} cta={home.chamadaFinal.cta} />
    </>
  )
}
