import Link from 'next/link'
import { MediaSlot } from '@/components/ui/MediaSlot'
import { ProjectCarousel } from '@/components/projects/ProjectCarousel'
import { projectSlides } from '@/lib/project-slides'
import { media } from '@/lib/media'
import { STATUS_LABELS, type ProjectSummary } from '@/lib/types'
import { ui } from '@/content/pt-PT'
import { noWidow } from '@/lib/utils'

/**
 * Listagem de projetos.
 *
 * Uma coluna, capa a toda a largura da linha e muito espaço entre entradas —
 * a duas colunas as capas ficavam pequenas e os projetos liam-se como cartões
 * de catálogo, que é exatamente o que o briefing proíbe. Campos sem valor são
 * omitidos em vez de aparecerem vazios.
 */
export function ProjectList({ projects }: { projects: ProjectSummary[] }) {
  if (projects.length === 0) {
    return (
      <p className="border border-line px-8 py-16 text-center text-bone-muted">
        {ui.semProjetos}
      </p>
    )
  }

  return (
    <ul className="flex flex-col gap-[clamp(4rem,9vw,8rem)]">
      {projects.map((project, index) => (
        <li key={project.id}>
          <ProjectCard project={project} index={index} />
        </li>
      ))}
    </ul>
  )
}

function ProjectCard({ project, index }: { project: ProjectSummary; index: number }) {
  const href = `/projetos/${project.slug}`
  const slides = projectSlides(project, true)

  // Já não é um link único à volta do cartão: um carrossel com botões não pode
  // viver dentro de um <a>. O título e o "Ver projeto" levam ao projeto.
  return (
    <article>
      <Link
        href={href}
        className="group/title flex items-baseline justify-between gap-6 border-b border-line pb-5"
      >
        <h3 className="font-[family-name:var(--font-display)] text-[clamp(1.75rem,4vw,3.25rem)] leading-tight text-bone transition-colors duration-300 group-hover/title:text-gold">
          {project.title}
        </h3>
        <p className="shrink-0 text-eyebrow text-gold">{STATUS_LABELS[project.status]}</p>
      </Link>

      <div className="mt-8">
        {slides.length > 0 ? (
          <ProjectCarousel
            slides={slides}
            title={project.title}
            reveal
            priority={index === 0}
            sizes="100vw"
            // Capas mais baixas: a 2:1 empurravam o projeto seguinte para
            // fora da dobra e a lista deixava de se ler como lista.
            frameClassName="[aspect-ratio:16/10] md:[aspect-ratio:21/9] lg:[aspect-ratio:3/1]"
          />
        ) : (
          <MediaSlot
            media={media.projetoFallback}
            alt={project.title}
            reveal
            ratioFromClass
            className="[aspect-ratio:16/10] md:[aspect-ratio:21/9] lg:[aspect-ratio:3/1]"
          />
        )}
      </div>

      <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex flex-col gap-2">
          {project.location ? (
            <p className="text-sm text-bone-muted">{project.location}</p>
          ) : null}
          {project.excerpt ? (
            <p className="measure text-sm leading-relaxed text-bone-muted">{noWidow(project.excerpt)}</p>
          ) : null}
        </div>

        <Link
          href={href}
          className="group/cta inline-flex shrink-0 items-center gap-3 text-nav text-bone transition-colors duration-300 hover:text-gold"
        >
          {ui.verProjeto}
          <span
            aria-hidden="true"
            className="block h-px w-10 bg-current transition-all duration-300 group-hover/cta:w-16"
          />
        </Link>
      </div>
    </article>
  )
}
