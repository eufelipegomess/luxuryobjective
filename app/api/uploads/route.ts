import { NextResponse } from 'next/server'
import { randomUUID } from 'node:crypto'
import { createSupabaseAdminClient } from '@/lib/supabase/server'
import { isSupabaseConfigured } from '@/lib/supabase/env'
import { allowedSubmissionTypes, uploads } from '@/lib/config'
import { getClientIp, hashIp, pruneRateLimit, rateLimit } from '@/lib/server/request'
import { safeFileName } from '@/lib/utils'
import { ui } from '@/content/pt-PT'

export const runtime = 'nodejs'

/**
 * Recebe um ficheiro de apoio de um formulário e guarda-o no bucket privado.
 *
 * O tipo e o tamanho são validados aqui outra vez — a verificação do cliente é
 * conveniência, não segurança. O nome original nunca é usado no storage: só a
 * extensão sobrevive, o resto é um UUID.
 */
export async function POST(request: Request) {
  pruneRateLimit()

  const ipHash = hashIp(getClientIp(request.headers))
  if (!rateLimit(`upload:${ipHash}`, 30)) {
    return NextResponse.json({ error: ui.erroEnvio }, { status: 429 })
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: 'Armazenamento não configurado. Ver README (Supabase).' },
      { status: 503 },
    )
  }

  let file: File | null = null
  try {
    const form = await request.formData()
    const entry = form.get('file')
    if (entry instanceof File) file = entry
  } catch {
    return NextResponse.json({ error: ui.erroEnvio }, { status: 400 })
  }

  if (!file) {
    return NextResponse.json({ error: ui.ficheiroInvalido }, { status: 400 })
  }
  if (file.size > uploads.maxBytes) {
    return NextResponse.json({ error: ui.ficheiroGrande }, { status: 413 })
  }
  if (!(allowedSubmissionTypes as readonly string[]).includes(file.type)) {
    return NextResponse.json({ error: ui.ficheiroInvalido }, { status: 415 })
  }

  const id = randomUUID()
  const path = `${new Date().getUTCFullYear()}/${id}/${safeFileName(file.name, id)}`

  const supabase = createSupabaseAdminClient()
  const { error } = await supabase.storage
    .from('submissions')
    .upload(path, file, { contentType: file.type, upsert: false })

  if (error) {
    console.error('[uploads] falha ao guardar', error.message)
    return NextResponse.json({ error: ui.erroEnvio }, { status: 500 })
  }

  return NextResponse.json({
    path,
    name: file.name.slice(0, 255),
    size: file.size,
    type: file.type,
  })
}
