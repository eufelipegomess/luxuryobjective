#!/usr/bin/env node
/**
 * Prepara o vídeo da hero para ser percorrido pelo scroll.
 *
 *   node scripts/prepare-hero-video.mjs <url-ou-ficheiro>
 *
 * Um vídeo normal traz um keyframe de poucos em poucos segundos — óptimo para
 * reproduzir do princípio ao fim, péssimo para saltar para um instante
 * arbitrário: o browser tem de descodificar tudo desde o keyframe anterior. Num
 * scrub isso traduz-se em imagem a engasgar, sobretudo no Safari e em 4K.
 *
 * Por isso cada frame é um keyframe (`-g 1`): cada salto descodifica um único
 * frame. Qualidade CRF 18, visualmente sem perdas (SSIM ≥ 0,99). O índice vai
 * para o início do ficheiro (`faststart`) para começar antes de o download
 * acabar.
 *
 * A versão horizontal sai a 2560×1440 e não em 4K: medido num scroll contínuo,
 * o 4K não passava de ~10 frames por segundo, mesmo com keyframes densos.
 *
 * Para um URL do ImageKit, junta `?tr=orig-true`: sem isso o ImageKit entrega
 * uma versão já recomprimida.
 *
 * Produz em public/media/:
 *   hero-1440p.mp4             — 16:9, 2560×1440
 *   hero-vertical.mp4          — recorte 9:16 dos próprios pixels, sem redimensionar
 *   hero-4k-poster.jpg         — primeiro frame, 2560 px de largura
 *   hero-4k-poster-mobile.jpg  — primeiro frame do recorte
 *   hero-4k-final.jpg          — último frame (hero estática, sem intro)
 *   hero-4k-final-mobile.jpg   — último frame do recorte
 *
 * Se mudares os nomes, muda também `lib/media.ts`. Nomes novos são a forma de
 * contornar a cache imutável de `/media/*` quando o vídeo muda.
 */

import { execFile } from 'node:child_process'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import { promisify } from 'node:util'

const run = promisify(execFile)

/**
 * Centro horizontal do recorte vertical, de 0 a 1. 0,53 e não 0,5: no vídeo
 * atual o bloco de madeira do piso superior, que fecha o plano, fica
 * ligeiramente à direita e saía cortado com o recorte centrado.
 */
const MOBILE_CENTER = 0.53

// Dependência opcional: se o binário não instalar em CI, o build não deve cair
// por causa de uma ferramenta que só se usa à mão.
let ffmpeg
try {
  ffmpeg = (await import('ffmpeg-static')).default
} catch {
  console.error('ffmpeg-static não está instalado. Corre `npm i -O ffmpeg-static` e tenta de novo.')
  process.exit(1)
}

const source = process.argv[2]
if (!source) {
  console.error('Uso: node scripts/prepare-hero-video.mjs <url-ou-ficheiro>')
  process.exit(1)
}

const outDir = path.join(process.cwd(), 'public', 'media')
const out = {
  video: path.join(outDir, 'hero-1440p.mp4'),
  mobile: path.join(outDir, 'hero-vertical.mp4'),
  poster: path.join(outDir, 'hero-4k-poster.jpg'),
  posterMobile: path.join(outDir, 'hero-4k-poster-mobile.jpg'),
  final: path.join(outDir, 'hero-4k-final.jpg'),
  finalMobile: path.join(outDir, 'hero-4k-final-mobile.jpg'),
}

await fs.mkdir(outDir, { recursive: true })

// Um URL é descarregado para um ficheiro temporário: o ffmpeg lê ficheiros
// locais de forma muito mais previsível do que streams remotos.
let input = source
let temp = null
if (/^https?:\/\//.test(source)) {
  const response = await fetch(source)
  if (!response.ok) {
    console.error(`Não foi possível descarregar (${response.status}).`)
    process.exit(1)
  }
  temp = path.join(outDir, '.hero-source.tmp.mp4')
  await fs.writeFile(temp, Buffer.from(await response.arrayBuffer()))
  input = temp
}

// Dimensões do original, lidas do cabeçalho que o ffmpeg imprime.
const probe = await run(ffmpeg, ['-hide_banner', '-i', input]).catch((error) => error)
const match = /Video:.*?(\d{3,5})x(\d{3,5})/.exec(String(probe.stderr))
if (!match) {
  console.error('Não foi possível ler as dimensões do vídeo.')
  process.exit(1)
}
const width = Number(match[1])
const height = Number(match[2])

const even = (value) => Math.round(value / 2) * 2
const cropWidth = even((height * 9) / 16)
const cropX = Math.min(width - cropWidth, Math.max(0, even(width * MOBILE_CENTER - cropWidth / 2)))
const crop = `crop=${cropWidth}:${height}:${cropX}:0`

const encode = [
  '-an', // sem áudio: a hero é muda
  '-c:v', 'libx264',
  '-profile:v', 'high',
  '-pix_fmt', 'yuv420p',
  '-preset', 'slow',
  '-crf', '18', // visualmente sem perdas
  '-g', '1', // cada frame é um keyframe: cada salto do scroll é um só frame
  '-keyint_min', '1',
  '-sc_threshold', '0', // sem keyframes extra em mudanças de cena
  '-movflags', '+faststart',
]

console.log(`Original ${width}×${height}. A codificar a versão 16:9 (2560×1440)…`)
await run(ffmpeg, ['-y', '-i', input, '-vf', 'scale=2560:-2:flags=lanczos', ...encode, out.video])

console.log(`A codificar o recorte 9:16 (${cropWidth}×${height}, x=${cropX})…`)
await run(ffmpeg, ['-y', '-i', input, '-vf', crop, ...encode, out.mobile])

console.log('A extrair os posters…')
await run(ffmpeg, ['-y', '-i', input, '-frames:v', '1', '-vf', 'scale=2560:-2', '-q:v', '2', out.poster])
await run(ffmpeg, ['-y', '-i', input, '-frames:v', '1', '-vf', crop, '-q:v', '2', out.posterMobile])
// Último frame: `-sseof` lê a partir do fim, `-update 1` fica com o último.
const last = ['-y', '-sseof', '-0.1', '-i', input, '-update', '1', '-frames:v', '1', '-q:v', '2']
await run(ffmpeg, [...last, '-vf', 'scale=2560:-2', out.final])
await run(ffmpeg, [...last, '-vf', crop, out.finalMobile])

if (temp) await fs.unlink(temp).catch(() => {})

for (const [label, file] of Object.entries(out)) {
  const { size } = await fs.stat(file)
  console.log(`${label.padEnd(13)} ${path.relative(process.cwd(), file).padEnd(36)} ${(size / 1024 / 1024).toFixed(2)} MB`)
}
console.log('\nJá referenciados em lib/media.ts.')
