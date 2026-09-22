import Link from 'next/link'
import { CATEGORY_LABELS, PROJECT_CATEGORIES, type ProjectCategory } from '@/lib/types'
import { routes } from '@/lib/config'
import { ui } from '@/content/pt-PT'
import { cn } from '@/lib/utils'

/**
 * Filtro por categoria.
 *
 * São links reais, não botões com estado no cliente: o filtro fica na query
 * string, funciona sem JavaScript, entra no histórico e pode ser partilhado.
 *
 * Cada opção mostra quantos projetos tem. Sem esse número, escolher uma
 * categoria e cair num estado vazio parecia um erro da página.
 */
export function ProjectFilters({
  active,
  counts,
}: {
  active: ProjectCategory | null
  counts: Record<ProjectCategory, number>
}) {
  const total = counts.desenvolvimento + counts.remodelacao

  const options = [
    { key: 'todos', label: ui.todos, href: routes.projetos, count: total, selected: active === null },
    ...PROJECT_CATEGORIES.map((category) => ({
      key: category,
      label: CATEGORY_LABELS[category],
      href: `${routes.projetos}?categoria=${category}`,
      count: counts[category],
      selected: active === category,
    })),
  ]

  return (
    <nav aria-label={ui.filtrar}>
      <ul className="flex flex-col gap-px bg-line sm:flex-row">
        {options.map((option) => (
          <li key={option.key} className="flex-1">
            <Link
              href={option.href}
              scroll={false}
              aria-current={option.selected ? 'true' : undefined}
              className={cn(
                'flex min-h-[64px] items-center justify-between gap-4 px-5 py-4 text-nav transition-colors duration-300',
                option.selected
                  ? 'bg-bone text-ink'
                  : 'bg-ink text-bone-muted hover:bg-ink-elevated hover:text-bone',
              )}
            >
              <span>{option.label}</span>
              <span
                className={cn(
                  'text-[0.6875rem] tabular-nums',
                  option.selected ? 'text-ink/50' : 'text-bone-muted/70',
                )}
              >
                {option.count}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
