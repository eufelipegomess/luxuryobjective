'use client'

import Link from 'next/link'
import { useRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { hasFinePointer, prefersReducedMotion, registerGsap } from '@/lib/animations/gsap'

type Variant = 'primary' | 'secondary' | 'ghost' | 'onLight'

const base =
  'group relative inline-flex items-center justify-center gap-3 px-7 py-4 text-nav min-h-[52px] transition-colors duration-300 ease-[var(--ease-lux)] disabled:opacity-50 disabled:pointer-events-none'

const variants: Record<Variant, string> = {
  // CTA primário: o amarelo aparece aqui e em pouco mais.
  primary: 'bg-gold text-ink hover:bg-bone',
  secondary: 'border border-line-strong text-bone hover:bg-bone hover:text-ink',
  ghost: 'text-bone hover:text-gold px-0 py-2 min-h-0',
  onLight: 'border border-line-ink text-ink hover:bg-ink hover:text-bone',
}

function Arrow() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      className="h-3.5 w-3.5 shrink-0 transition-transform duration-300 ease-[var(--ease-lux)] group-hover:translate-x-[5px] group-hover:-translate-y-[5px]"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
    >
      <path d="M3.5 12.5 12.5 3.5" />
      <path d="M5.5 3.5h7v7" />
    </svg>
  )
}

type CommonProps = {
  children: ReactNode
  variant?: Variant
  withArrow?: boolean
  className?: string
  /** Resposta magnética leve. Só em desktop com ponteiro fino. */
  magnetic?: boolean
}

/** Deslocamento subtil em direção ao cursor — nunca em touch nem reduced motion. */
function useMagnetic(enabled: boolean) {
  const ref = useRef<HTMLElement | null>(null)

  const bind = {
    onMouseMove: (event: React.MouseEvent) => {
      if (!enabled || !ref.current) return
      if (!hasFinePointer() || prefersReducedMotion()) return
      const rect = ref.current.getBoundingClientRect()
      const gsap = registerGsap()
      gsap.to(ref.current, {
        x: (event.clientX - (rect.left + rect.width / 2)) * 0.14,
        y: (event.clientY - (rect.top + rect.height / 2)) * 0.2,
        duration: 0.5,
        ease: 'power3.out',
      })
    },
    onMouseLeave: () => {
      if (!enabled || !ref.current) return
      registerGsap().to(ref.current, { x: 0, y: 0, duration: 0.55, ease: 'elastic.out(1, 0.6)' })
    },
  }

  return { ref, bind }
}

export function ButtonLink({
  href,
  children,
  variant = 'primary',
  withArrow = false,
  className,
  magnetic = false,
  ...rest
}: CommonProps & { href: string } & Omit<React.ComponentProps<typeof Link>, 'href' | 'className'>) {
  const { ref, bind } = useMagnetic(magnetic)

  return (
    <Link
      href={href}
      ref={ref as React.Ref<HTMLAnchorElement>}
      className={cn(base, variants[variant], className)}
      {...bind}
      {...rest}
    >
      <span>{children}</span>
      {withArrow ? <Arrow /> : null}
    </Link>
  )
}

export function Button({
  children,
  variant = 'primary',
  withArrow = false,
  className,
  magnetic = false,
  ...rest
}: CommonProps & ButtonHTMLAttributes<HTMLButtonElement>) {
  const { ref, bind } = useMagnetic(magnetic)

  return (
    <button
      ref={ref as React.Ref<HTMLButtonElement>}
      className={cn(base, variants[variant], className)}
      {...bind}
      {...rest}
    >
      <span>{children}</span>
      {withArrow ? <Arrow /> : null}
    </button>
  )
}
