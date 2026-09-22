/**
 * O site tem de arrancar e compilar sem Supabase configurado — é assim que o
 * cliente consegue ver o layout antes de a base de dados existir. Quando as
 * variáveis faltam, as queries caem no conjunto local de projetos aprovados
 * (ver lib/queries/fallback.ts) em vez de rebentar.
 */

export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

export function isSupabaseConfigured(): boolean {
  return supabaseUrl.length > 0 && supabaseAnonKey.length > 0
}

export function requireServiceRoleKey(): string {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!key) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY em falta. Necessária apenas no servidor — nunca a exponhas ao cliente.',
    )
  }
  return key
}
