/**
 * Endereço de origem das fotografias.
 *
 * O ImageKit, por omissão, entrega cada imagem já otimizada — convertida para
 * WebP e recomprimida (o retrato da Nathalie chegava com 33 KB de um original
 * com 153 KB). O otimizador do site voltava a comprimir por cima e a perda
 * acumulava-se. Com `tr=orig-true` o ImageKit entrega o ficheiro original e só
 * há uma compressão: a do site.
 */
export function imageSource(src: string): string {
  if (!src.startsWith('https://ik.imagekit.io/')) return src
  // Um URL que já traz transformações do ImageKit fica como está.
  if (/[?&]tr=/.test(src)) return src
  return `${src}${src.includes('?') ? '&' : '?'}tr=orig-true`
}

/**
 * Qualidade das fotografias no otimizador. O valor por omissão do Next é 75,
 * baixo para fotografia de arquitetura: gradientes de céu e superfícies lisas
 * ganhavam blocos. Tem de constar de `images.qualities` em next.config.ts.
 */
export const PHOTO_QUALITY = 90
