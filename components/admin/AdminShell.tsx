import Link from 'next/link'
import { signOutAdmin } from '@/lib/actions/projects'

const links = [
  { href: '/admin', label: 'Visão geral' },
  { href: '/admin/projetos', label: 'Projetos' },
  { href: '/admin/projetos/novo', label: 'Novo projeto' },
]

export function AdminShell({
  email,
  title,
  actions,
  local = false,
  children,
}: {
  email: string
  title: string
  actions?: React.ReactNode
  /** Painel a correr sobre o armazenamento local, sem base de dados nem login. */
  local?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="mx-auto w-full max-w-[1400px] px-6 py-10 lg:px-10">
      {/* O modo local é fácil de confundir com o real: mais vale dizê-lo. */}
      {local ? (
        <p className="mb-8 border border-gold/40 bg-gold/10 px-5 py-4 text-sm text-bone">
          <strong className="font-normal text-gold">Modo local.</strong> Os projetos são guardados
          em <code className="text-bone-muted">.data/projects.json</code> e as imagens em{' '}
          <code className="text-bone-muted">public/uploads/</code>, só nesta máquina. Não há
          autenticação. Para publicar a sério, configura o Supabase — ver README.
        </p>
      ) : null}

      <header className="flex flex-col gap-6 border-b border-line pb-8 lg:flex-row lg:items-center lg:justify-between">
        <nav aria-label="Painel">
          <ul className="flex flex-wrap items-center gap-6">
            {links.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-nav text-bone-muted hover:text-bone">
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/" className="text-nav text-bone-muted hover:text-bone">
                Ver site
              </Link>
            </li>
          </ul>
        </nav>

        <div className="flex items-center gap-6">
          <span className="text-sm text-bone-muted">{email}</span>
          {local ? null : (
            <form action={signOutAdmin}>
              <button type="submit" className="text-nav text-bone-muted hover:text-gold">
                Sair
              </button>
            </form>
          )}
        </div>
      </header>

      <div className="mt-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <h1 className="text-title text-bone">{title}</h1>
        {actions}
      </div>

      <div className="mt-10">{children}</div>
    </div>
  )
}
