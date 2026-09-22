'use client'

import { useId, useRef, useState } from 'react'
import { useFormContext, type FieldValues, type Path, type PathValue } from 'react-hook-form'
import { allowedSubmissionTypes, uploads } from '@/lib/config'
import { formatBytes } from '@/lib/utils'
import { ui } from '@/content/pt-PT'
import type { SubmissionFile } from '@/lib/types'

type Item = SubmissionFile & { id: string; status: 'uploading' | 'done' | 'error'; error?: string }

/**
 * Upload de anexos com estado e remoção por item.
 *
 * Cada ficheiro sobe individualmente para o bucket privado assim que é
 * escolhido; o formulário guarda apenas os metadados devolvidos. Uma falha
 * isolada não bloqueia os restantes nem o envio do formulário.
 *
 * A lista vive num ref além do state: os uploads terminam fora de ordem e uma
 * closure sobre o state antigo perderia ficheiros.
 */
export function FileUpload<T extends FieldValues>({
  name,
  label,
}: {
  name: Path<T>
  label: string
}) {
  const { setValue } = useFormContext<T>()
  const [items, setItems] = useState<Item[]>([])
  const itemsRef = useRef<Item[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const inputId = useId()
  const statusId = `${inputId}-estado`

  const commit = (next: Item[]) => {
    itemsRef.current = next
    setItems(next)
    setValue(
      name,
      next
        .filter((item) => item.status === 'done')
        .map(({ path, name: fileName, size, type }) => ({
          path,
          name: fileName,
          size,
          type,
        })) as PathValue<T, Path<T>>,
      { shouldValidate: true },
    )
  }

  const patch = (id: string, changes: Partial<Item>) => {
    commit(itemsRef.current.map((item) => (item.id === id ? { ...item, ...changes } : item)))
  }

  const upload = async (file: File, id: string) => {
    const body = new FormData()
    body.append('file', file)

    try {
      const response = await fetch('/api/uploads', { method: 'POST', body })
      const data = (await response.json()) as { path?: string; error?: string }

      if (response.ok && data.path) {
        patch(id, { path: data.path, status: 'done' })
      } else {
        patch(id, { status: 'error', error: data.error ?? ui.erroEnvio })
      }
    } catch {
      patch(id, { status: 'error', error: ui.erroEnvio })
    }
  }

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const chosen = Array.from(event.target.files ?? [])
    event.target.value = ''
    if (chosen.length === 0) return

    const pending: { item: Item; file: File }[] = []

    for (const file of chosen) {
      if (itemsRef.current.length + pending.length >= uploads.maxFiles) break

      const invalidType = !(allowedSubmissionTypes as readonly string[]).includes(file.type)
      const tooLarge = file.size > uploads.maxBytes

      pending.push({
        file,
        item: {
          id: `${file.name}-${file.size}-${pending.length}-${itemsRef.current.length}`,
          path: '',
          name: file.name,
          size: file.size,
          type: file.type,
          status: invalidType || tooLarge ? 'error' : 'uploading',
          error: invalidType ? ui.ficheiroInvalido : tooLarge ? ui.ficheiroGrande : undefined,
        },
      })
    }

    commit([...itemsRef.current, ...pending.map((entry) => entry.item)])

    for (const entry of pending) {
      if (entry.item.status === 'uploading') void upload(entry.file, entry.item.id)
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <span className="block text-eyebrow text-bone-muted">{label}</span>

      <input
        ref={inputRef}
        id={inputId}
        type="file"
        multiple
        accept={allowedSubmissionTypes.join(',')}
        onChange={onChange}
        aria-describedby={statusId}
        className="sr-only"
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="flex min-h-[52px] w-full items-center justify-center border border-dashed border-line px-5 py-4 text-nav text-bone-muted transition-colors hover:border-line-strong hover:text-bone"
      >
        + {label}
      </button>

      <p id={statusId} className="text-xs text-bone-muted">
        {ui.ficheirosPermitidos}
      </p>

      {items.length > 0 ? (
        <ul className="flex flex-col gap-2" aria-live="polite">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between gap-4 border border-line px-4 py-3 text-sm"
            >
              <span className="flex min-w-0 flex-col">
                <span className="truncate text-bone">{item.name}</span>
                <span className="text-xs text-bone-muted">
                  {item.status === 'uploading' ? ui.aEnviar : null}
                  {item.status === 'done' ? formatBytes(item.size) : null}
                  {item.status === 'error' ? item.error : null}
                </span>
              </span>
              <button
                type="button"
                onClick={() => commit(itemsRef.current.filter((entry) => entry.id !== item.id))}
                className="shrink-0 text-eyebrow text-bone-muted transition-colors hover:text-gold"
              >
                {ui.removerFicheiro}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
