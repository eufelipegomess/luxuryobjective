import 'server-only'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import type { Database } from './database.types'
import { supabaseAnonKey, supabaseUrl, requireServiceRoleKey } from './env'

/**
 * Cliente ligado à sessão do utilizador (cookies). É este que respeita RLS —
 * um admin autenticado escreve, um visitante anónimo só lê o que está publicado.
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options)
          }
        } catch {
          // Server Components não podem escrever cookies. O middleware trata da
          // renovação da sessão, por isso ignorar aqui é seguro.
        }
      },
    },
  })
}

/**
 * Cliente de leitura pública, sem sessão. Usado nas páginas estáticas do site —
 * não carrega cookies, portanto não força render dinâmico sem necessidade.
 */
export function createSupabasePublicClient() {
  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

/**
 * service_role: ignora RLS. Só pode ser usado dentro de route handlers e server
 * actions — nunca chega ao bundle do cliente (o `server-only` no topo garante
 * que uma importação acidental rebenta no build, não em produção).
 */
export function createSupabaseAdminClient() {
  return createClient<Database>(supabaseUrl, requireServiceRoleKey(), {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
