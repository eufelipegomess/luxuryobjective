/**
 * Ícones de traço fino, desenhados à medida.
 *
 * Traço de 1px e formas geométricas simples — nada de biblioteca genérica. São
 * usados apenas onde marcam um tópico (missão, visão, valores); o briefing
 * proíbe ícones decorativos a acompanhar cada parágrafo.
 */

type IconProps = { className?: string }

const base = 'h-10 w-10 shrink-0'

export function IconMissao({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      aria-hidden="true"
      className={className ?? base}
    >
      <circle cx="20" cy="20" r="15" />
      <circle cx="20" cy="20" r="8.5" />
      <circle cx="20" cy="20" r="2" />
      <path d="M20 1v6M20 33v6M1 20h6M33 20h6" />
    </svg>
  )
}

export function IconVisao({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      aria-hidden="true"
      className={className ?? base}
    >
      <path d="M2 20s7-10 18-10 18 10 18 10-7 10-18 10S2 20 2 20Z" />
      <circle cx="20" cy="20" r="5.5" />
      <path d="M20 4v3M6 8l2 2.5M34 8l-2 2.5" />
    </svg>
  )
}

export function IconValores({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      aria-hidden="true"
      className={className ?? base}
    >
      <path d="M20 2 33 20 20 38 7 20 20 2Z" />
      <path d="M20 9.5 27 20l-7 10.5L13 20 20 9.5Z" />
      <path d="M7 20h26" />
    </svg>
  )
}
