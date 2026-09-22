import 'server-only'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from './server'
import { isSupabaseConfigured } from './env'
import { isDevStoreEnabled } from '@/lib/store/dev-store'
import { routes } from '@/lib/config'

export type AdminSession = { userId: string; email: string; local: boolean }

/** Sessão fictícia do modo local. Nunca existe em produção. */
const LOCAL_SESSION: AdminSession = {
  userId: 'local',
  email: 'modo local (sem autenticação)',
  local: true,
}

/**
 * Confirma sessão *e* papel administrativo.
 *
 * Ter conta no Supabase não chega: é preciso constar de `admin_users`. A
 * verificação corre no servidor e a RLS repete-a na base de dados, portanto nem
 * um cliente adulterado consegue escrever.
 *
 * Em desenvolvimento e sem Supabase, o painel corre sobre o armazenamento local
 * e não há autenticação nenhuma — é o preço de o painel funcionar antes de
 * existir base de dados. O middleware garante que esse modo nunca é servido em
 * produção.
 */
export async function requireAdmin(): Promise<AdminSession> {
  if (!isSupabaseConfigured()) {
    if (isDevStoreEnabled()) return LOCAL_SESSION
    redirect(routes.adminLogin)
  }

  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect(routes.adminLogin)

  const { data: admin } = await supabase
    .from('admin_users')
    .select('user_id, email')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!admin) {
    await supabase.auth.signOut()
    redirect(`${routes.adminLogin}?erro=sem-permissao`)
  }

  return { userId: admin.user_id, email: admin.email, local: false }
}

export async function getAdminSession(): Promise<AdminSession | null> {
  if (!isSupabaseConfigured()) {
    return isDevStoreEnabled() ? LOCAL_SESSION : null
  }

  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: admin } = await supabase
    .from('admin_users')
    .select('user_id, email')
    .eq('user_id', user.id)
    .maybeSingle()

  return admin ? { userId: admin.user_id, email: admin.email, local: false } : null
}
