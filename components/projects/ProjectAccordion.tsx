'use client'

import Link from 'next/link'
import { useId, useState } from 'react'
import { MediaSlot } from '@/components/ui/MediaSlot'
import { ProjectCarousel } from '@/components/projects/ProjectCarousel'
import { projectSlides } from '@/lib/project-slides'
import { media } from '@/lib/media'
import { CATEGORY_LABELS, STATUS_LABELS, type ProjectSummary } from '@/lib/types'
import { ui } from '@/content/pt-PT'
import { cn, noWidow } from '@/lib/utils'

/**
 * Accordion editorial de grande escala com os projetos publicados.
 *
 * Um item aberto de cada vez, abertura por clique ou teclado, e nunca por
 * hover: em touch o hover não existe, e o briefing proíbe esconder informação
 * essencial atrás dele. A altura anima por `grid-template-rows` (0fr → 1fr),
 * o que evita medir alturas à mão e não provoca layout shift brusco.
 */
export function ProjectAccordion({ projects }: { projects: ProjectSummary[] }) {
  const [openId, setOpenId] = useState<string | null>(projects[0]?.id ?? null)
  const baseId = useId()

  if (projects.length === 0) return null

  return (
    <ul className="border-t border-line">
      {projects.map((project) => {
        const open = openId === project.id
        const panelId = `${baseId}-${project.id}`

        return (
          <li key={project.id} className="border-b border-line">
            <h3>
              <button
                type="button"
                aria-expanded={open}
                aria-controls={panelId}
                onClick={() => setOpenId(open ? null : project.id)}
                className="group flex w-full items-baseline justify-between gap-6 py-8 text-left lg:py-12"
              >
                <span className="flex flex-col gap-3 lg:flex-row lg:items-baseline lg:gap-8">
                  <span
                    className={cn(
                      'font-[family-name:var(--font-display)] text-[clamp(1.75rem,4.5vw,3.25rem)] leading-none transition-colors duration-300',
                      open ? 'text-gold' : 'text-bone group-hover:text-gold',
                    )}
                  >
                    {project.title}
                  </span>
                  <span className="text-eyebrow text-bone-muted">
                    {STATUS_LABELS[project.status]}
                  </span>
                </span>

                {/* Indicador discreto do gesto. O texto some-se em ecrãs
                    estreitos; o ícone fica sempre. */}
                <span className="mt-2 flex shrink-0 items-center gap-3 text-bone-muted">
                  <span
                    aria-hidden="true"
                    className={cn(
                      'hidden text-eyebrow transition-colors duration-300 sm:block',
                      open ? 'text-bone-muted/70' : 'text-bone-muted group-hover:text-gold',
                    )}
                  >
                    {open ? ui.recolher : ui.expandir}
                  </span>

                  <span
                    aria-hidden="true"
                    className="relative block h-4 w-4 transition-colors duration-300 group-hover:text-gold"
                  >
                    <span className="absolute left-0 top-1/2 block h-px w-full bg-current" />
                    <span
                      className={cn(
                        'absolute left-1/2 top-0 block h-full w-px origin-center bg-current transition-transform duration-500 ease-[var(--ease-lux)]',
                        open ? 'scale-y-0' : 'scale-y-100',
                      )}
                    />
                  </span>
                </span>
              </button>
            </h3>

            <div
              id={panelId}
              role="region"
              className={cn(
                'grid transition-[grid-template-rows] duration-700 ease-[var(--ease-lux)]',
                open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
              )}
            >
              <div className="overflow-hidden">
                <div className="grid-editorial gap-y-8 pb-12">
                  <div className="col-span-4 md:col-span-8 lg:col-span-7">
                    {/* A capa abre o carrossel; a galeria segue-a. Sem nenhuma
                        fotografia, fica o placeholder editorial. */}
                    {projectSlides(project).length > 0 ? (
                      <ProjectCarousel
                        slides={projectSlides(project)}
                        title={project.title}
                        frameClassName="aspect-[16/10]"
                        sizes="(min-width: 1024px) 58vw, 100vw"
                      />
                    ) : (
                      <MediaSlot media={media.projetoFallback} alt={project.title} />
                    )}
                  </div>

                  <div className="col-span-4 flex flex-col md:col-span-8 lg:col-span-4 lg:col-start-9">
                    <dl className="flex flex-col gap-5 text-sm">
                      <div>
                        <dt className="text-eyebrow text-bone-muted">Categoria</dt>
                        <dd className="mt-1 text-bone">{CATEGORY_LABELS[project.category]}</dd>
                      </div>
                      {/* Campos vazios são omitidos — nunca um label sem valor. */}
                      {project.location ? (
                        <div>
                          <dt className="text-eyebrow text-bone-muted">Localização</dt>
                          <dd className="mt-1 text-bone">{project.location}</dd>
                        </div>
                      ) : null}
                    </dl>

                    {project.excerpt ? (
                      <p className="measure mt-8 text-bone-muted">{noWidow(project.excerpt)}</p>
                    ) : null}

                    <Link
                      href={`/projetos/${project.slug}`}
                      tabIndex={open ? undefined : -1}
                      className="group/link mt-10 inline-flex items-center gap-3 text-nav text-bone transition-colors hover:text-gold"
                    >
                      {ui.verProjeto}
                      <span
                        aria-hidden="true"
                        className="block h-px w-8 bg-current transition-all duration-300 group-hover/link:w-12"
                      />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
