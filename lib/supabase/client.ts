'use client'

import { createBrowserClient } from '@supabase/ssr'
import type { Database } from './database.types'
import { supabaseAnonKey, supabaseUrl } from './env'

let cached: ReturnType<typeof createBrowserClient<Database>> | null = null

/** Cliente do browser. Só a chave anon — nunca a service_role. */
export function createSupabaseBrowserClient() {
  cached ??= createBrowserClient<Database>(supabaseUrl, supabaseAnonKey)
  return cached
}
