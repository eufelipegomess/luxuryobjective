'use client'

/**
 * Registo do Lenis e reposição do scroll.
 *
 * Com o Lenis ativo, o `window.scrollTo` do Next não chega: o Lenis mantém a
 * sua própria posição interna e volta a aplicá-la no frame seguinte — era isso
 * que fazia uma página nova abrir a meio, ou no rodapé.
 */

type LenisLike = {
  scrollTo: (target: number, options?: { immediate?: boolean }) => void
  destroy: () => void
}

let instance: LenisLike | null = null

export function setLenis(next: LenisLike | null): void {
  instance = next
}

export function scrollToTop(): void {
  if (typeof window === 'undefined') return
  instance?.scrollTo(0, { immediate: true })
  window.scrollTo(0, 0)
  // Alguns browsers restauram a posição depois do paint; o frame extra garante
  // que ficamos mesmo no topo.
  requestAnimationFrame(() => {
    instance?.scrollTo(0, { immediate: true })
    window.scrollTo(0, 0)
  })
}

/**
 * Leva o scroll até ao elemento da âncora (`#id`), respeitando o
 * `scroll-margin-top` dele — é essa margem que impede o header fixo de tapar o
 * título. Devolve `false` se não houver âncora ou elemento, para quem chama
 * cair no topo.
 */
export function scrollToHash(hash: string): boolean {
  if (typeof window === 'undefined' || hash.length < 2) return false

  const target = () => document.getElementById(decodeURIComponent(hash.slice(1)))
  if (!target()) return false

  const align = () => {
    const el = target()
    if (!el) return
    const margin = parseFloat(getComputedStyle(el).scrollMarginTop) || 0
    const top = Math.max(0, el.getBoundingClientRect().top + window.scrollY - margin)
    instance?.scrollTo(top, { immediate: true })
    window.scrollTo(0, top)
  }

  align()
  // Um frame depois e outra vez mais tarde: fontes e títulos em linhas ainda
  // podem mexer na altura do que está por cima, e o destino deslocava-se.
  requestAnimationFrame(align)
  window.setTimeout(align, 300)
  return true
}
