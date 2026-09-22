import { AdminShell } from '@/components/admin/AdminShell'
import { ProjectForm } from '@/components/admin/ProjectForm'
import { requireAdmin } from '@/lib/supabase/auth'

export const dynamic = 'force-dynamic'

export default async function NovoProjetoPage() {
  const session = await requireAdmin()

  return (
    <AdminShell email={session.email} local={session.local} title="Novo projeto">
      <ProjectForm />
    </AdminShell>
  )
}
