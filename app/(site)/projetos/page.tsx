import type { Metadata } from 'next'
import { PageHeader } from '@/components/layout/PageHeader'
import { ProjectFilters } from '@/components/projects/ProjectFilters'
import { ProjectList } from '@/components/projects/ProjectList'
import { FuturosProjetosForms } from '@/components/sections/FuturosProjetosForms'
import { getPublishedProjects } from '@/lib/queries/projects'
import { PROJECT_CATEGORIES, type ProjectCategory } from '@/lib/types'
import { nav, projetos } from '@/content/pt-PT'
import { noWidow, truncate } from '@/lib/utils'

export const metadata: Metadata = {
  title: nav.projetos,
  description: truncate(projetos.intro.body, 155),
  alternates: { canonical: '/projetos' },
  openGraph: {
    title: `${nav.projetos} — Luxury Objective`,
    description: truncate(projetos.intro.body, 155),
    url: '/projetos',
  },
}

export const revalidate = 300

type Props = { searchParams: Promise<{ categoria?: string }> }

export default async function ProjetosPage({ searchParams }: Props) {
  const { categoria } = await searchParams
  const active = isCategory(categoria) ? categoria : null

  const [desenvolvimento, remodelacao] = await Promise.all([
    getPublishedProjects('desenvolvimento'),
    getPublishedProjects('remodelacao'),
  ])

  const showDesenvolvimento = active === null || active === 'desenvolvimento'
  const showRemodelacao = active === null || active === 'remodelacao'

  return (
    <>
      {/* O PDF não define título para a abertura de Projetos: usamos o rótulo
          de navegação aprovado. O filtro vive dentro da abertura, para se ler
          como navegação da página e não como um controlo solto. */}
      <PageHeader title={nav.projetos} body={projetos.intro.body}>
        <ProjectFilters
          active={active}
          counts={{
            desenvolvimento: desenvolvimento.length,
            remodelacao: remodelacao.length,
          }}
        />
      </PageHeader>

      {showDesenvolvimento ? (
        <ProjectSection id="projetos-desenvolvimento" title={projetos.desenvolvimento.title}>
          <ProjectList projects={desenvolvimento} />
        </ProjectSection>
      ) : null}

      {showRemodelacao ? (
        <ProjectSection id="projetos-remodelacao" title={projetos.remodelacao.title}>
          {/* Sem projetos publicados nesta categoria, um estado vazio sóbrio —
              sem acrescentar marketing não aprovado. */}
          <ProjectList projects={remodelacao} />
        </ProjectSection>
      ) : null}

      {active === null ? (
        <section className="shell pb-(--spacing-section)" aria-labelledby="projetos-proximos">
          <div className="border-t border-line pt-10">
            <h2 id="projetos-proximos" className="text-eyebrow text-bone-muted">
              {projetos.proximos.title}
            </h2>
            <p data-reveal className="mt-6 text-headline text-bone-muted">
              {noWidow(projetos.proximos.body)}
            </p>
          </div>
        </section>
      ) : null}

      <FuturosProjetosForms />
    </>
  )
}

/** Cabeçalho de secção consistente: rótulo discreto, régua, lista. */
function ProjectSection({
  id,
  title,
  children,
}: {
  id: string
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="shell py-(--spacing-section-tight)" aria-labelledby={id}>
      <h2 id={id} className="text-eyebrow border-t border-line pt-8 text-bone-muted">
        {title}
      </h2>
      <div className="mt-14">{children}</div>
    </section>
  )
}

function isCategory(value: string | undefined): value is ProjectCategory {
  return typeof value === 'string' && (PROJECT_CATEGORIES as readonly string[]).includes(value)
}
