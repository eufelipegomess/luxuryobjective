import { notFound } from 'next/navigation'
import { AdminShell } from '@/components/admin/AdminShell'
import { ProjectForm } from '@/components/admin/ProjectForm'
import { requireAdmin } from '@/lib/supabase/auth'
import { getAdminProject } from '@/lib/queries/admin'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ id: string }> }

export default async function EditarProjetoPage({ params }: Props) {
  const session = await requireAdmin()
  const { id } = await params
  const project = await getAdminProject(id)
  if (!project) notFound()

  return (
    <AdminShell email={session.email} local={session.local} title={project.title}>
      <ProjectForm project={project} />
    </AdminShell>
  )
}
