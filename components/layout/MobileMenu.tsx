'use client'

import Link from 'next/link'
import { useEffect, useRef } from 'react'
import { primaryNav, routes } from '@/lib/config'
import { contacto, nav, ui } from '@/content/pt-PT'
import { registerGsap, prefersReducedMotion } from '@/lib/animations/gsap'
import { cn } from '@/lib/utils'

type Props = {
  open: boolean
  onClose: () => void
  pathname: string
  /** Botão que abriu o menu. O foco volta sempre aqui ao fechar. */
  returnFocusTo: React.RefObject<HTMLButtonElement | null>
}

/**
 * Menu full-screen. Simples e imediato — nada de navegação enigmática.
 *
 * Acessibilidade: focus trap, Escape fecha, scroll bloqueado enquanto aberto e
 * o foco volta ao botão que o abriu.
 */
export function MobileMenu({ open, onClose, pathname, returnFocusTo }: Props) {
  const panelRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    const panel = panelRef.current
    if (!panel) return

    // Copiado para dentro do efeito: na limpeza o ref já pode ter mudado.
    const opener = returnFocusTo.current
    const scrollY = window.scrollY
    document.body.style.position = 'fixed'
    document.body.style.top = `-${scrollY}px`
    document.body.style.width = '100%'

    closeRef.current?.focus()

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
        return
      }
      if (event.key !== 'Tab') return

      const focusables = panel.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      )
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      if (!first || !last) return

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)

    let ctx: ReturnType<ReturnType<typeof registerGsap>['context']> | null = null
    if (!prefersReducedMotion()) {
      const gsap = registerGsap()
      ctx = gsap.context(() => {
        gsap
          .timeline()
          .fromTo(
            panel,
            { clipPath: 'inset(0 0 100% 0)' },
            { clipPath: 'inset(0 0 0% 0)', duration: 0.6, ease: 'power3.inOut' },
          )
          .fromTo(
            '[data-menu-item]',
            { y: 28, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.5, stagger: 0.06, ease: 'power3.out' },
            '-=0.25',
          )
      }, panel)
    }

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      ctx?.revert()
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.width = ''
      window.scrollTo(0, scrollY)
      // Em touch o botão pode nunca ter recebido foco; o ref garante o retorno.
      opener?.focus()
    }
  }, [open, onClose, returnFocusTo])

  if (!open) return null

  return (
    <div
      id="menu-mobile"
      ref={panelRef}
      role="dialog"
      aria-modal="true"
      aria-label={nav.home}
      className="fixed inset-0 z-[60] flex flex-col bg-ink lg:hidden"
    >
      <div className="shell flex items-center justify-end py-4">
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          className="-mr-2 flex min-h-[44px] min-w-[44px] items-center justify-end gap-3 px-2 text-nav text-bone"
        >
          {ui.fechar}
          <span aria-hidden="true" className="relative block h-4 w-4">
            <span className="absolute left-0 top-1/2 block h-px w-full rotate-45 bg-bone" />
            <span className="absolute left-0 top-1/2 block h-px w-full -rotate-45 bg-bone" />
          </span>
        </button>
      </div>

      <nav aria-label="Navegação principal" className="shell flex flex-1 flex-col justify-center">
        <ul className="flex flex-col gap-1">
          {primaryNav.map((item) => {
            const active =
              item.href === routes.home ? pathname === routes.home : pathname.startsWith(item.href)
            return (
              <li key={item.href} data-menu-item>
                <Link
                  href={item.href}
                  onClick={onClose}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'block py-2.5 font-[family-name:var(--font-display)] text-[clamp(1.375rem,5.5vw,1.875rem)] font-extralight leading-tight transition-colors',
                    active ? 'text-gold' : 'text-bone',
                  )}
                >
                  {nav[item.key]}
                </Link>
              </li>
            )
          })}
        </ul>

        <div data-menu-item className="mt-8">
          <Link
            href={routes.servicos}
            onClick={onClose}
            className="inline-flex min-h-[48px] items-center bg-gold px-6 py-3.5 text-nav text-ink"
          >
            {nav.cta}
          </Link>
        </div>
      </nav>

      <div data-menu-item className="shell border-t border-line py-6">
        <ul className="flex flex-col gap-2 text-sm text-bone-muted">
          <li>
            <a href={contacto.email.href} className="hover:text-bone">
              {contacto.email.label}
            </a>
          </li>
          {contacto.telefones.map((phone) => (
            <li key={phone.href}>
              <a href={phone.href} className="hover:text-bone">
                {phone.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
