import { NextResponse } from 'next/server'
import { randomUUID } from 'node:crypto'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { isSupabaseConfigured } from '@/lib/supabase/env'
import { getAdminSession } from '@/lib/supabase/auth'
import { isDevStoreEnabled } from '@/lib/store/dev-store'
import { uploads } from '@/lib/config'
import { safeFileName } from '@/lib/utils'

export const runtime = 'nodejs'

const allowed = [...uploads.imageTypes, ...uploads.videoTypes] as readonly string[]
const MAX_BYTES = 50 * 1024 * 1024

/**
 * Upload de mídia de projeto.
 *
 * Com Supabase, o pedido é feito com a sessão do editor e não com a
 * service_role: se a RLS do storage disser que não, o upload falha aqui — a
 * autorização não depende de este código estar correto.
 *
 * Sem Supabase e em desenvolvimento, o ficheiro é gravado em `public/uploads/`
 * para o painel ser utilizável antes de existir base de dados.
 */
export async function POST(request: Request) {
  const session = await getAdminSession()
  if (!session) {
    return NextResponse.json({ error: 'Sem sessão.' }, { status: 401 })
  }

  let file: File | null = null
  try {
    const form = await request.formData()
    const entry = form.get('file')
    if (entry instanceof File) file = entry
  } catch {
    return NextResponse.json({ error: 'Pedido inválido.' }, { status: 400 })
  }

  if (!file) return NextResponse.json({ error: 'Ficheiro em falta.' }, { status: 400 })
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: 'Ficheiro demasiado grande (máx. 50 MB).' }, { status: 413 })
  }
  if (!allowed.includes(file.type)) {
    return NextResponse.json(
      { error: 'Formato não permitido. Imagens JPG/PNG/WebP/AVIF ou vídeo MP4/WebM.' },
      { status: 415 },
    )
  }

  const id = randomUUID()
  const fileName = safeFileName(file.name, id)

  if (!isSupabaseConfigured()) {
    if (!isDevStoreEnabled()) {
      return NextResponse.json(
        { error: 'Armazenamento não configurado. Ver README (Supabase).' },
        { status: 503 },
      )
    }

    try {
      const dir = path.join(process.cwd(), 'public', 'uploads')
      await fs.mkdir(dir, { recursive: true })
      await fs.writeFile(path.join(dir, fileName), Buffer.from(await file.arrayBuffer()))
      return NextResponse.json({ url: `/uploads/${fileName}`, path: fileName, type: file.type })
    } catch (error) {
      console.error('[admin/media] falha ao gravar localmente', error)
      return NextResponse.json({ error: 'Não foi possível guardar o ficheiro.' }, { status: 500 })
    }
  }

  const storagePath = `projetos/${id}/${fileName}`
  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.storage
    .from('project-media')
    .upload(storagePath, file, { contentType: file.type, upsert: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from('project-media').getPublicUrl(storagePath)

  return NextResponse.json({ url: publicUrl, path: storagePath, type: file.type })
}
