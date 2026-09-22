'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { brand } from '@/lib/media'
import { navLeft, navRight, routes, siteConfig } from '@/lib/config'
import { nav, ui } from '@/content/pt-PT'
import { cn } from '@/lib/utils'
import { MobileMenu } from './MobileMenu'

/**
 * Header conforme a hero aprovada: nav simétrica com três itens à esquerda da
 * marca, dois à direita e o CTA no extremo. Transparente sobre a mídia; ao sair
 * da hero encolhe para uma barra compacta, quase opaca, com blur discreto.
 */
export function Header() {
  const pathname = usePathname()
  const [compact, setCompact] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    let frame = 0
    const onScroll = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => setCompact(window.scrollY > window.innerHeight * 0.6))
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  return (
    <>
      <header
        data-site-header
        className={cn(
          'fixed inset-x-0 top-0 z-50 transition-[background-color,backdrop-filter,padding] duration-500 ease-[var(--ease-lux)]',
          compact
            ? 'bg-ink/92 py-3 backdrop-blur-[6px] lg:py-4'
            : 'bg-transparent py-4 lg:py-7',
        )}
      >
        <div className="shell">
          {/* Desktop: grelha de três colunas com a marca exatamente ao centro. */}
          <nav
            aria-label="Navegação principal"
            className="hidden items-center lg:grid lg:grid-cols-[1fr_auto_1fr] lg:gap-10"
          >
            <ul className="flex items-center gap-9">
              {navLeft.map((item) => (
                <NavItem key={item.href} href={item.href} active={isActive(pathname, item.href)}>
                  {nav[item.key]}
                </NavItem>
              ))}
            </ul>

            <BrandMark compact={compact} />

            <ul className="flex items-center justify-end gap-9">
              {navRight.map((item) => (
                <NavItem key={item.href} href={item.href} active={isActive(pathname, item.href)}>
                  {nav[item.key]}
                </NavItem>
              ))}
              <li>
                <Link
                  href={routes.servicos}
                  className="border border-line-strong px-6 py-3 text-nav text-bone transition-colors duration-300 hover:bg-bone hover:text-ink"
                >
                  {nav.cta}
                </Link>
              </li>
            </ul>
          </nav>

          {/* Mobile: marca à esquerda, botão Menu à direita. */}
          <div className="flex items-center justify-between lg:hidden">
            <BrandMark compact={compact} />
            <button
              ref={menuButtonRef}
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-expanded={menuOpen}
              aria-controls="menu-mobile"
              className="-mr-2 flex min-h-[44px] min-w-[44px] items-center justify-end gap-3 px-2 text-nav text-bone"
            >
              {ui.menu}
              <span aria-hidden="true" className="flex w-5 flex-col gap-[5px]">
                <span className="block h-px w-full bg-bone" />
                <span className="block h-px w-full bg-bone" />
              </span>
            </button>
          </div>
        </div>
      </header>

      <MobileMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        pathname={pathname}
        returnFocusTo={menuButtonRef}
      />
    </>
  )
}

function BrandMark({ compact }: { compact: boolean }) {
  return (
    <Link
      href={routes.home}
      className="justify-self-center"
      aria-label={`${siteConfig.name} — ${siteConfig.tagline}`}
    >
      <Image
        src={brand.logoDark}
        alt=""
        width={989}
        height={162}
        priority
        className={cn(
          'w-auto transition-[height] duration-500 ease-[var(--ease-lux)]',
          compact ? 'h-7 lg:h-8' : 'h-8 lg:h-12',
        )}
      />
    </Link>
  )
}

function NavItem({
  href,
  active,
  children,
}: {
  href: string
  active: boolean
  children: React.ReactNode
}) {
  return (
    <li>
      <Link
        href={href}
        aria-current={active ? 'page' : undefined}
        className={cn(
          'group relative block py-2 text-nav transition-colors duration-300',
          active ? 'text-gold' : 'text-bone hover:text-gold',
        )}
      >
        {children}
        {/* Underline por máscara — a rota atual fica marcada sem pills. */}
        <span
          aria-hidden="true"
          className={cn(
            'absolute -bottom-0.5 left-0 h-px w-full origin-left bg-current transition-transform duration-300 ease-[var(--ease-lux)]',
            active ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100',
          )}
        />
      </Link>
    </li>
  )
}

function isActive(pathname: string, href: string): boolean {
  if (href === routes.home) return pathname === routes.home
  return pathname.startsWith(href)
}
