import Link from 'next/link'
import { AdminShell } from '@/components/admin/AdminShell'
import { ProjectsTable } from '@/components/admin/ProjectsTable'
import { requireAdmin } from '@/lib/supabase/auth'
import { listAdminProjects } from '@/lib/queries/admin'

export const dynamic = 'force-dynamic'

type Props = { searchParams: Promise<{ q?: string; ordem?: string }> }

export default async function AdminProjectsPage({ searchParams }: Props) {
  const session = await requireAdmin()
  const { q, ordem } = await searchParams

  const sort = ordem === 'titulo' || ordem === 'atualizado' ? ordem : 'ordem'
  const projects = await listAdminProjects({ search: q, sort })

  return (
    <AdminShell
      email={session.email}
      local={session.local}
      title="Projetos"
      actions={
        <Link
          href="/admin/projetos/novo"
          className="inline-flex min-h-[48px] items-center bg-gold px-6 py-3 text-nav text-ink"
        >
          Novo projeto
        </Link>
      }
    >
      {/* Pesquisa e ordenação por GET: funcionam sem JS e ficam no URL. */}
      <form method="get" className="flex flex-col gap-4 md:flex-row md:items-end">
        <div className="flex flex-1 flex-col gap-2">
          <label htmlFor="q" className="text-eyebrow text-bone-muted">
            Pesquisar
          </label>
          <input
            id="q"
            name="q"
            type="search"
            defaultValue={q ?? ''}
            className="min-h-[48px] w-full border border-line bg-ink-raised px-4 py-3 focus:border-gold focus:outline-none"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="ordem" className="text-eyebrow text-bone-muted">
            Ordenar
          </label>
          <select
            id="ordem"
            name="ordem"
            defaultValue={sort}
            className="min-h-[48px] border border-line bg-ink-raised px-4 py-3 focus:border-gold focus:outline-none"
          >
            <option value="ordem">Ordem de apresentação</option>
            <option value="titulo">Título</option>
            <option value="atualizado">Última atualização</option>
          </select>
        </div>

        <button
          type="submit"
          className="min-h-[48px] border border-line-strong px-6 py-3 text-nav hover:bg-bone hover:text-ink"
        >
          Aplicar
        </button>
      </form>

      <div className="mt-8">
        <ProjectsTable projects={projects} />
      </div>
    </AdminShell>
  )
}
