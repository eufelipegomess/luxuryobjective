/** Helpers puros, testáveis, sem dependências de framework. */

export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ')
}

/**
 * Slug pt-PT: remove diacríticos, normaliza separadores e apara traços soltos.
 * Usado no painel para gerar o slug a partir do título — sempre editável.
 */
export function slugify(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/['’`]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

/** Divide um texto em palavras preservando espaços — base do reveal por linha. */
export function splitWords(text: string): string[] {
  return text.split(/(\s+)/).filter((part) => part.length > 0)
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

/** Nome de ficheiro seguro: nunca confiamos no nome original do upload. */
export function safeFileName(originalName: string, unique: string): string {
  const ext = originalName.includes('.') ? originalName.split('.').pop()!.toLowerCase() : 'bin'
  const cleanExt = ext.replace(/[^a-z0-9]/g, '').slice(0, 8) || 'bin'
  return `${unique}.${cleanExt}`
}

/** Remove entradas vazias — o site nunca renderiza labels sem valor. */
export function compactMeta<T extends { value: string | number | null | undefined }>(
  items: T[],
): T[] {
  return items.filter((item) => {
    if (item.value === null || item.value === undefined) return false
    return String(item.value).trim().length > 0
  })
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

/** Deriva uma descrição SEO a partir do excerpt sem inventar texto novo. */
export function truncate(text: string, max: number): string {
  if (text.length <= max) return text
  const cut = text.slice(0, max)
  const lastSpace = cut.lastIndexOf(' ')
  return `${(lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`
}
