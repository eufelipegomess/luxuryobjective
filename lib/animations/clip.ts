'use client'

/**
 * Converte a caixa de um elemento-âncora num `clip-path: inset(...)` relativo a
 * um palco.
 *
 * É isto que permite uma imagem começar exatamente onde um bloco do layout está
 * e depois abrir até preencher a secção, sem animar `width`/`left` — só o
 * clip-path, que não força reflow.
 *
 * A âncora é um elemento vazio colocado na grelha: o layout continua a decidir
 * onde a imagem começa, em vez de termos percentagens escritas à mão que se
 * partem no primeiro ajuste de grelha.
 */
export function insetFromAnchor(stage: Element, anchor: Element): string {
  const s = stage.getBoundingClientRect()
  const a = anchor.getBoundingClientRect()

  if (s.width === 0 || s.height === 0) return 'inset(0% 0% 0% 0%)'

  const clamp = (value: number) => Math.max(0, Math.min(100, value))

  const top = clamp(((a.top - s.top) / s.height) * 100)
  const right = clamp(((s.right - a.right) / s.width) * 100)
  const bottom = clamp(((s.bottom - a.bottom) / s.height) * 100)
  const left = clamp(((a.left - s.left) / s.width) * 100)

  return `inset(${top}% ${right}% ${bottom}% ${left}%)`
}

/**
 * Recorte de "cartão" para as imagens que abrem em mobile.
 *
 * O palco ocupa o ecrã inteiro; o cartão fica encostado ao topo, com as margens
 * da página dos lados e na proporção pedida — é assim que a imagem se lê no
 * fluxo antes de começar a abrir. Em px, porque a margem da página chega do
 * CSS já resolvida em px.
 */
export function cardInset(stage: Element, gutter: number, ratio: number): string {
  const { width, height } = stage.getBoundingClientRect()
  if (width === 0 || height === 0) return 'inset(0px 0px 0px 0px)'

  const cardHeight = Math.min(height, (width - gutter * 2) * ratio)
  return `inset(0px ${gutter}px ${Math.max(0, height - cardHeight)}px ${gutter}px)`
}

/**
 * Recorte proporcional: o mesmo rácio do palco, encolhido até às margens da
 * página. A imagem nunca aparece ampliada nem cortada fora do seu rácio — só
 * esconde um pouco das bordas enquanto não abre.
 */
export function proportionalInset(stage: Element, gutter: number): string {
  const { width, height } = stage.getBoundingClientRect()
  if (width === 0 || height === 0) return 'inset(0px 0px 0px 0px)'

  const vertical = (gutter * height) / width
  return `inset(${vertical}px ${gutter}px ${vertical}px ${gutter}px)`
}
