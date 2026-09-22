'use client'

import { useEffect, useRef } from 'react'
import { hasFinePointer, prefersReducedMotion } from '@/lib/animations/gsap'

/** O que conta como alvo clicável: o anel abre sobre estes. */
const INTERACTIVE =
  'a, button, [role="button"], [role="radio"], [role="tab"], label, summary, [data-cursor="hover"]'

/** Onde volta o cursor do sistema: o I de edição é informação, não decoração. */
const TEXT = 'input:not([type="checkbox"]):not([type="radio"]), textarea, select, [contenteditable="true"]'

/**
 * Cursor da marca: um ponto dourado que segue o rato à letra e um anel fino
 * que o acompanha com um ligeiro atraso. Sobre links e botões o anel abre e
 * ganha um fundo dourado leve; ao carregar, encolhe.
 *
 * Só com rato ou trackpad — em touch não há cursor e o componente não faz
 * nada. Sobre campos de texto volta o cursor do sistema, e sobre o mapa (um
 * iframe, onde os eventos do rato não chegam) o da marca esconde-se em vez de
 * ficar parado na borda. Em reduced motion o anel deixa de ter atraso.
 *
 * O cursor do sistema só desaparece enquanto este está montado — é o atributo
 * `data-cursor` no <html> que o esconde (globals.css). Sem JavaScript fica o
 * normal.
 *
 * Os estados vivem nos próprios elementos do cursor, não no <html>: mudar um
 * atributo no <html> a cada movimento obrigava a recalcular os estilos da
 * página inteira.
 */
export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!hasFinePointer()) return
    const dot = dotRef.current
    const ring = ringRef.current
    if (!dot || !ring) return

    const root = document.documentElement
    root.setAttribute('data-cursor', '')

    const ease = prefersReducedMotion() ? 1 : 0.2
    let x = -100
    let y = -100
    let rx = -100
    let ry = -100
    let frame = 0
    let visible = false
    let hover = false
    let text = false

    const set = (attr: string, on: boolean) => {
      dot.toggleAttribute(attr, on)
      ring.toggleAttribute(attr, on)
    }

    const place = () => {
      dot.style.transform = `translate3d(${x}px, ${y}px, 0)`
      ring.style.transform = `translate3d(${rx}px, ${ry}px, 0)`
    }

    // O anel aproxima-se do ponto a cada frame e pára quando o alcança: sem
    // movimento não há ciclo de animação a correr.
    const tick = () => {
      rx += (x - rx) * ease
      ry += (y - ry) * ease
      place()
      frame = Math.abs(x - rx) > 0.1 || Math.abs(y - ry) > 0.1 ? requestAnimationFrame(tick) : 0
    }

    const classify = (target: Element | null) => {
      const onText = Boolean(target?.closest(TEXT))
      const onLink = !onText && Boolean(target?.closest(INTERACTIVE))
      if (onText !== text) {
        text = onText
        set('data-text', text)
      }
      if (onLink !== hover) {
        hover = onLink
        set('data-hover', hover)
      }
    }

    const show = (on: boolean) => {
      if (on === visible) return
      visible = on
      set('data-visible', on)
    }

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return
      x = event.clientX
      y = event.clientY
      if (!visible) {
        // Primeira aparição: o anel nasce já no sítio, sem viajar do canto.
        rx = x
        ry = y
      }
      show(true)
      classify(event.target as Element | null)
      place()
      if (!frame) frame = requestAnimationFrame(tick)
    }

    // O scroll muda o que está debaixo do cursor sem o rato se mexer.
    let scrollFrame = 0
    const onScroll = () => {
      if (!visible || scrollFrame) return
      scrollFrame = requestAnimationFrame(() => {
        scrollFrame = 0
        classify(document.elementFromPoint(x, y))
      })
    }

    const onOut = (event: MouseEvent) => {
      const next = event.relatedTarget as Element | null
      // Saiu da janela, ou entrou num iframe (o mapa) onde deixa de ver o rato.
      if (!next || next.tagName === 'IFRAME') show(false)
    }

    const onDown = () => set('data-down', true)
    const onUp = () => set('data-down', false)

    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerdown', onDown)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('scroll', onScroll, { passive: true })
    document.addEventListener('mouseout', onOut)

    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('scroll', onScroll)
      document.removeEventListener('mouseout', onOut)
      cancelAnimationFrame(frame)
      cancelAnimationFrame(scrollFrame)
      root.removeAttribute('data-cursor')
    }
  }, [])

  return (
    <>
      <div ref={ringRef} aria-hidden="true" data-cursor-el data-cursor-ring>
        <span />
      </div>
      <div ref={dotRef} aria-hidden="true" data-cursor-el data-cursor-dot>
        <span />
      </div>
    </>
  )
}
