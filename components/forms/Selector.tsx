'use client'

import { useEffect, useId, useRef } from 'react'
import { cn } from '@/lib/utils'

export type SelectorOption = {
  id: string
  title: string
  description: string
}

/**
 * Seletores grandes que decidem qual formulário aparece.
 *
 * São botões de rádio reais (`role="radiogroup"`), com navegação por setas e um
 * único ponto de tab — não são divs clicáveis. Só depois da escolha é que o
 * formulário correspondente é revelado; nunca se mostram dois ao mesmo tempo.
 */
export function Selector({
  options,
  value,
  onChange,
  label,
}: {
  options: readonly SelectorOption[]
  value: string | null
  onChange: (id: string) => void
  label: string
}) {
  const groupId = useId()
  const refs = useRef<(HTMLButtonElement | null)[]>([])

  const move = (from: number, delta: number) => {
    const next = (from + delta + options.length) % options.length
    const option = options[next]
    if (!option) return
    onChange(option.id)
    refs.current[next]?.focus()
  }

  return (
    <div
      role="radiogroup"
      aria-label={label}
      className="grid grid-cols-1 gap-px bg-line md:grid-cols-2 lg:auto-cols-fr lg:grid-flow-col"
    >
      {options.map((option, index) => {
        const selected = value === option.id
        return (
          <button
            key={option.id}
            ref={(node) => {
              refs.current[index] = node
            }}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-controls={`${groupId}-painel`}
            tabIndex={selected || (value === null && index === 0) ? 0 : -1}
            onClick={() => onChange(option.id)}
            onKeyDown={(event) => {
              if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
                event.preventDefault()
                move(index, 1)
              }
              if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
                event.preventDefault()
                move(index, -1)
              }
            }}
            className={cn(
              'group flex min-h-[180px] flex-col items-start gap-4 p-8 text-left transition-colors duration-300 lg:p-10',
              selected ? 'bg-bone text-ink' : 'bg-ink text-bone hover:bg-ink-elevated',
            )}
          >
            <span className="flex w-full items-start justify-between gap-4">
              <span className="text-title">{option.title}</span>
              {/* Marcador de estado que não depende de cor. */}
              <span
                aria-hidden="true"
                className={cn(
                  'mt-2 block h-3 w-3 shrink-0 border transition-colors',
                  selected ? 'border-ink bg-ink' : 'border-line-strong bg-transparent',
                )}
              />
            </span>
            <span
              className={cn(
                'measure text-sm leading-relaxed',
                selected ? 'text-ink/70' : 'text-bone-muted',
              )}
            >
              {option.description}
            </span>
          </button>
        )
      })}
    </div>
  )
}

/**
 * Painel revelado depois da escolha.
 *
 * Em ecrãs pequenos leva o formulário para junto do topo assim que aparece: os
 * cartões de seleção ocupam quase toda a dobra, e sem isto o utilizador escolhe
 * uma opção e fica a olhar para o mesmo sítio, sem perceber que algo abriu.
 *
 * `autoScroll={false}` quando a escolha não foi um gesto do utilizador (veio do
 * URL): aí quem decide onde a página abre é a âncora.
 */
export function SelectorPanel({
  choice,
  autoScroll = true,
  children,
}: {
  choice: string
  autoScroll?: boolean
  children: React.ReactNode
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const node = ref.current
    if (!node || !autoScroll) return
    if (window.matchMedia('(min-width: 1024px)').matches) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    // 96px de folga para o header fixo não tapar o título do formulário.
    const top = node.getBoundingClientRect().top + window.scrollY - 96
    window.scrollTo({ top, behavior: reduced ? 'auto' : 'smooth' })
  }, [choice, autoScroll])

  return (
    <div ref={ref} className="mt-14 scroll-mt-24 border-t border-line pt-14">
      {children}
    </div>
  )
}
