#!/usr/bin/env node
/**
 * Lista os ficheiros de uma conta ImageKit.
 *
 * Serve para não ser preciso copiar URL a URL do dashboard: corre uma vez e
 * imprime todos os ficheiros com o respetivo URL, agrupados por pasta.
 *
 *   node scripts/imagekit-list.mjs            # tudo
 *   node scripts/imagekit-list.mjs /o-luzia   # só uma pasta
 *
 * A chave privada é lida de `.env.local`, que está no `.gitignore` e nunca sai
 * desta máquina:
 *
 *   IMAGEKIT_PRIVATE_KEY=private_xxxxxxxxxxxx
 *
 * A chave só é usada para listar (GET). O script não escreve, não apaga e não
 * envia nada para lado nenhum além da API do ImageKit.
 */

import { readFile } from 'node:fs/promises'
import path from 'node:path'

const ENV_FILE = path.join(process.cwd(), '.env.local')

/** Parser mínimo de .env — evita acrescentar uma dependência só para isto. */
async function readEnvLocal() {
  try {
    const raw = await readFile(ENV_FILE, 'utf8')
    const entries = raw
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0 && !line.startsWith('#'))
      .map((line) => {
        const index = line.indexOf('=')
        if (index === -1) return null
        const key = line.slice(0, index).trim()
        const value = line
          .slice(index + 1)
          .trim()
          .replace(/^["']|["']$/g, '')
        return [key, value]
      })
      .filter((entry) => entry !== null)
    return Object.fromEntries(entries)
  } catch {
    return {}
  }
}

const env = { ...(await readEnvLocal()), ...process.env }
const privateKey = env.IMAGEKIT_PRIVATE_KEY

if (!privateKey) {
  console.error(
    'IMAGEKIT_PRIVATE_KEY em falta.\n\n' +
      'Acrescenta ao .env.local (Dashboard ImageKit → Developer options → API keys):\n' +
      '  IMAGEKIT_PRIVATE_KEY=private_xxxxxxxxxxxx\n',
  )
  process.exit(1)
}

const folder = process.argv[2]
const auth = Buffer.from(`${privateKey}:`).toString('base64')

const url = new URL('https://api.imagekit.io/v1/files')
url.searchParams.set('limit', '1000')
url.searchParams.set('type', 'file')
if (folder) {
  url.searchParams.set('path', folder)
} else {
  // Sem pasta indicada, percorre tudo em vez de só a raiz.
  url.searchParams.set('searchQuery', 'size > 0')
}

const response = await fetch(url, { headers: { Authorization: `Basic ${auth}` } })

if (!response.ok) {
  console.error(`Falha ao listar (${response.status}): ${await response.text()}`)
  process.exit(1)
}

const files = await response.json()

if (!Array.isArray(files) || files.length === 0) {
  console.error('Nenhum ficheiro encontrado. Confirma o nome da pasta (ex.: /o-luzia).')
  process.exit(1)
}

// Agrupa por pasta para a saída ser legível de uma passagem de olhos.
const byFolder = new Map()
for (const file of files) {
  const dir = path.posix.dirname(file.filePath ?? '/')
  if (!byFolder.has(dir)) byFolder.set(dir, [])
  byFolder.get(dir).push(file)
}

for (const [dir, items] of [...byFolder.entries()].sort()) {
  console.log(`\n${dir}  (${items.length})`)
  for (const item of items.sort((a, b) => a.name.localeCompare(b.name))) {
    const size = item.size ? `${Math.round(item.size / 1024)} KB` : ''
    const dims = item.width && item.height ? `${item.width}x${item.height}` : ''
    console.log(`  ${item.url}   ${dims} ${size}`.trimEnd())
  }
}

console.log(`\nTotal: ${files.length} ficheiros.`)
