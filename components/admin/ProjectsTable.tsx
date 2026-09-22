'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import {
  duplicateProject,
  deleteProject,
  setArchived,
  setPublished,
} from '@/lib/actions/projects'
import { CATEGORY_LABELS, STATUS_LABELS } from '@/lib/types'
import type { AdminProjectRow } from '@/lib/queries/admin'

/**
 * Lista de projetos com as ações de gestão.
 *
 * Sem atualização otimista: publicar/arquivar/eliminar podem falhar na RLS, e
 * mostrar um estado que o servidor não confirmou seria mentir ao editor. O
 * botão fica em espera até a ação voltar.
 */
export function ProjectsTable({ projects }: { projects: AdminProjectRow[] }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [busyId, setBusyId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [confirmId, setConfirmId] = useState<string | null>(null)

  const run = (id: string, action: () => Promise<{ ok: boolean; error?: string }>) => {
    setBusyId(id)
    setError(null)
    startTransition(async () => {
      const result = await action()
      setBusyId(null)
      if (!result.ok) {
        setError(result.error ?? 'Não foi possível concluir a ação.')
        return
      }
      setConfirmId(null)
      router.refresh()
    })
  }

  if (projects.length === 0) {
    return (
      <p className="border border-line p-8 text-bone-muted">
        Nenhum projeto corresponde à pesquisa.
      </p>
    )
  }

  return (
    <>
      <p role="alert" aria-live="polite" className="min-h-5 text-sm text-gold">
        {error}
      </p>

      <ul className="mt-4 divide-y divide-[color:var(--color-line)] border border-line">
        {projects.map((project) => {
          const busy = busyId === project.id && pending

          return (
            <li key={project.id} className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center">
              <div className="min-w-0 flex-1">
                <Link
                  href={`/admin/projetos/${project.id}`}
                  className="text-lg text-bone hover:text-gold"
                >
                  {project.title}
                </Link>
                <p className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-eyebrow text-bone-muted">
                  <span>/{project.slug}</span>
                  <span>{CATEGORY_LABELS[project.category]}</span>
                  <span>{STATUS_LABELS[project.status]}</span>
                  <span>{project.published ? 'Publicado' : 'Rascunho'}</span>
                  {project.featured ? <span className="text-gold">Destaque</span> : null}
                  {project.archived ? <span>Arquivado</span> : null}
                  <span>ordem {project.displayOrder}</span>
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-eyebrow">
                {project.published ? (
                  <Link
                    href={`/projetos/${project.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-bone-muted hover:text-bone"
                  >
                    Pré-visualizar
                  </Link>
                ) : null}

                <button
                  type="button"
                  disabled={busy}
                  onClick={() => run(project.id, () => setPublished(project.id, !project.published))}
                  className="text-bone-muted hover:text-bone disabled:opacity-50"
                >
                  {project.published ? 'Despublicar' : 'Publicar'}
                </button>

                <button
                  type="button"
                  disabled={busy}
                  onClick={() => run(project.id, () => duplicateProject(project.id))}
                  className="text-bone-muted hover:text-bone disabled:opacity-50"
                >
                  Duplicar
                </button>

                <button
                  type="button"
                  disabled={busy}
                  onClick={() => run(project.id, () => setArchived(project.id, !project.archived))}
                  className="text-bone-muted hover:text-bone disabled:opacity-50"
                >
                  {project.archived ? 'Restaurar' : 'Arquivar'}
                </button>

                {/* Eliminação permanente exige confirmação explícita. */}
                {confirmId === project.id ? (
                  <span className="flex items-center gap-3">
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => run(project.id, () => deleteProject(project.id))}
                      className="text-gold hover:underline disabled:opacity-50"
                    >
                      Confirmar eliminação
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmId(null)}
                      className="text-bone-muted hover:text-bone"
                    >
                      Cancelar
                    </button>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmId(project.id)}
                    className="text-bone-muted hover:text-gold"
                  >
                    Eliminar
                  </button>
                )}
              </div>
            </li>
          )
        })}
      </ul>
    </>
  )
}
