import Link from 'next/link'
import { AdminShell } from '@/components/admin/AdminShell'
import { requireAdmin } from '@/lib/supabase/auth'
import { getAdminStats, listAdminProjects } from '@/lib/queries/admin'
import { CATEGORY_LABELS, STATUS_LABELS } from '@/lib/types'

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  const session = await requireAdmin()
  const [stats, recent] = await Promise.all([
    getAdminStats(),
    listAdminProjects({ sort: 'atualizado' }),
  ])

  const cards = [
    { label: 'Total', value: stats.total },
    { label: 'Publicados', value: stats.published },
    { label: 'Rascunhos', value: stats.drafts },
    { label: 'Arquivados', value: stats.archived },
    { label: CATEGORY_LABELS.desenvolvimento, value: stats.byCategory.desenvolvimento },
    { label: CATEGORY_LABELS.remodelacao, value: stats.byCategory.remodelacao },
  ]

  return (
    <AdminShell email={session.email} local={session.local} title="Visão geral">
      <dl className="grid grid-cols-2 gap-px border border-line bg-line lg:grid-cols-3">
        {cards.map((card) => (
          <div key={card.label} className="bg-ink p-6">
            <dt className="text-eyebrow text-bone-muted">{card.label}</dt>
            <dd className="mt-3 font-[family-name:var(--font-display)] text-4xl text-bone">
              {card.value}
            </dd>
          </div>
        ))}
      </dl>

      <section className="mt-12">
        <h2 className="text-eyebrow text-bone-muted">Atualizados recentemente</h2>

        {recent.length === 0 ? (
          <p className="mt-6 border border-line p-8 text-bone-muted">
            Ainda não existem projetos. Começa por criar o primeiro.
          </p>
        ) : (
          <ul className="mt-6 divide-y divide-[color:var(--color-line)] border border-line">
            {recent.slice(0, 8).map((project) => (
              <li key={project.id}>
                <Link
                  href={`/admin/projetos/${project.id}`}
                  className="flex flex-col gap-2 p-5 transition-colors hover:bg-ink-raised md:flex-row md:items-center md:justify-between"
                >
                  <span className="text-bone">{project.title}</span>
                  <span className="flex flex-wrap items-center gap-4 text-eyebrow text-bone-muted">
                    <span>{STATUS_LABELS[project.status]}</span>
                    <span>{project.published ? 'Publicado' : 'Rascunho'}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </AdminShell>
  )
}
