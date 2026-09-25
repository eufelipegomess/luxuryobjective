/**
 * Escreve `content/oluzia-galeria.json` na base de dados.
 *
 *   npm run sincronizar            -- mostra o que mudaria, sem escrever
 *   npm run sincronizar -- aplicar -- escreve
 *
 * Existe para o trabalho em lote: trocar dezenas de fotografias de uma vez,
 * reordenar um empreendimento inteiro. O painel serve para o cliente mexer
 * numa ou noutra; ninguém vai lá carregar quarenta e sete à mão.
 *
 * SUBSTITUI a galeria toda do projeto. Se o cliente tiver acrescentado ou
 * reordenado fotografias no painel, isto desfaz esse trabalho — por isso o
 * modo de ver vem primeiro e a escrita tem de ser pedida. Não corre em
 * nenhum build; é sempre uma decisão de quem o escreve.
 *
 * As chaves vêm do `.env.local`, que nunca entra no repositório.
 */

import { readFileSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'

const conteudo = JSON.parse(readFileSync(new URL('../content/oluzia-galeria.json', import.meta.url)))
const aplicar = process.argv.includes('aplicar')

/** `.env.local` à mão: um script solto não passa pelo carregador do Next. */
function env() {
  const valores = {}
  let bruto
  try {
    bruto = readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
  } catch {
    return valores
  }
  for (const linha of bruto.split(/\r?\n/)) {
    const par = linha.match(/^([A-Z0-9_]+)=(.*)$/)
    if (par) valores[par[1]] = par[2].trim().replace(/^["']|["']$/g, '')
  }
  return valores
}

const { NEXT_PUBLIC_SUPABASE_URL: url, SUPABASE_SERVICE_ROLE_KEY: chave } = env()

if (!url || !chave) {
  console.error(
    'Faltam NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY no .env.local.\n' +
      'A chave secreta está em Supabase → Settings → API Keys → Reveal.',
  )
  process.exit(1)
}

const supabase = createClient(url, chave, { auth: { persistSession: false } })

const { data: projeto, error: erroProjeto } = await supabase
  .from('projects')
  .select('id, title')
  .eq('slug', conteudo.slug)
  .maybeSingle()

if (erroProjeto) {
  console.error('Não foi possível ler o projeto:', erroProjeto.message)
  process.exit(1)
}
if (!projeto) {
  console.error(`Não existe nenhum projeto com o slug "${conteudo.slug}" em ${url}.`)
  process.exit(1)
}

const { data: atual, error: erroAtual } = await supabase
  .from('project_media')
  .select('url')
  .eq('project_id', projeto.id)
  .order('position')

if (erroAtual) {
  console.error('Não foi possível ler a galeria:', erroAtual.message)
  process.exit(1)
}

const antigas = (atual ?? []).map((m) => m.url)
const novas = conteudo.media.map((m) => m.url)
const saem = antigas.filter((u) => !novas.includes(u))
const entram = novas.filter((u) => !antigas.includes(u))
const nome = (u) => decodeURIComponent(u.split('?')[0].split('/').slice(-2).join('/'))

console.log(`${projeto.title} em ${url}`)
console.log(`  ${antigas.length} fotografias agora  →  ${novas.length} depois`)
if (entram.length) console.log('\n  entram:\n' + entram.map((u) => '    + ' + nome(u)).join('\n'))
if (saem.length) console.log('\n  saem:\n' + saem.map((u) => '    - ' + nome(u)).join('\n'))
if (!entram.length && !saem.length) console.log('  (as mesmas fotografias; muda a ordem ou os textos)')

if (!aplicar) {
  console.log('\nNada foi escrito. Para aplicar:  npm run sincronizar -- aplicar')
  process.exit(0)
}

const { error: erroApagar } = await supabase
  .from('project_media')
  .delete()
  .eq('project_id', projeto.id)

if (erroApagar) {
  console.error('Falhou ao limpar a galeria:', erroApagar.message)
  process.exit(1)
}

const { error: erroInserir } = await supabase.from('project_media').insert(
  conteudo.media.map((item, posicao) => ({
    project_id: projeto.id,
    url: item.url,
    alt: item.alt,
    caption: item.caption ?? null,
    focal_point: item.focal ?? '50% 50%',
    position: posicao,
    width: item.width,
    height: item.height,
  })),
)

if (erroInserir) {
  console.error('Falhou ao inserir a galeria:', erroInserir.message)
  console.error('A galeria ficou vazia — voltar a correr resolve.')
  process.exit(1)
}

const { error: erroCapa } = await supabase
  .from('projects')
  .update({
    cover_url: conteudo.cover.url,
    cover_alt: conteudo.cover.alt,
    cover_focal_point: conteudo.cover.focal,
    updated_at: new Date().toISOString(),
  })
  .eq('id', projeto.id)

if (erroCapa) {
  console.error('A galeria entrou, mas a capa não:', erroCapa.message)
  process.exit(1)
}

console.log(`\n${conteudo.media.length} fotografias escritas. Capa: ${nome(conteudo.cover.url)}`)
console.log('As páginas do site atualizam dentro de alguns minutos (ver revalidate).')
