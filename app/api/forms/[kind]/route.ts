import { NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase/server'
import { isSupabaseConfigured } from '@/lib/supabase/env'
import { schemaByKind, submissionKindSchema } from '@/lib/validations/forms'
import { getClientIp, hashIp, pruneRateLimit, rateLimit } from '@/lib/server/request'
import { notificarSubmissao } from '@/lib/server/notify'
import { ui } from '@/content/pt-PT'
import type { SubmissionFile } from '@/lib/types'

export const runtime = 'nodejs'

/**
 * Recebe qualquer um dos seis formulários do site.
 *
 * O mesmo schema Zod que validou no browser volta a validar aqui — um pedido
 * forjado não passa. Os ficheiros já foram para o bucket privado por
 * /api/uploads; aqui viajam só os metadados — o e-mail de aviso leva a lista
 * de ficheiros, nunca os ficheiros.
 */
export async function POST(request: Request, context: { params: Promise<{ kind: string }> }) {
  pruneRateLimit()

  const { kind: rawKind } = await context.params
  const parsedKind = submissionKindSchema.safeParse(rawKind)
  if (!parsedKind.success) {
    return NextResponse.json({ error: ui.erroEnvio }, { status: 404 })
  }
  const kind = parsedKind.data

  const ipHash = hashIp(getClientIp(request.headers))
  if (!rateLimit(`form:${ipHash}`)) {
    return NextResponse.json({ error: ui.erroEnvio }, { status: 429 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: ui.erroEnvio }, { status: 400 })
  }

  const parsed = schemaByKind[kind].safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: ui.erroEnvio, issues: parsed.error.flatten().fieldErrors },
      { status: 422 },
    )
  }

  // Honeypot preenchido: respondemos 200 para não dar pistas ao bot, mas nada
  // é gravado.
  const { website, ...payload } = parsed.data as Record<string, unknown>
  if (typeof website === 'string' && website.length > 0) {
    return NextResponse.json({ ok: true })
  }

  if (!isSupabaseConfigured()) {
    console.warn('[forms] Supabase não configurado — submissão descartada:', kind)
    return NextResponse.json(
      { error: 'Base de dados não configurada. Ver README (Supabase).' },
      { status: 503 },
    )
  }

  const { ficheiros, ...rest } = payload as { ficheiros?: unknown }
  const anexos = Array.isArray(ficheiros) ? (ficheiros as SubmissionFile[]) : []
  const supabase = createSupabaseAdminClient()
  const { error } = await supabase.from('form_submissions').insert({
    kind,
    payload: rest as Record<string, unknown>,
    files: anexos as never,
    ip_hash: ipHash,
    user_agent: request.headers.get('user-agent')?.slice(0, 400) ?? null,
  })

  if (error) {
    console.error('[forms] falha ao gravar', error.message)
    return NextResponse.json({ error: ui.erroEnvio }, { status: 500 })
  }

  // Depois da gravação e esperado: numa serverless function o que corre solto
  // depois da resposta é cortado a meio.
  await notificarSubmissao(kind, rest as Record<string, unknown>, anexos)

  return NextResponse.json({ ok: true })
}
