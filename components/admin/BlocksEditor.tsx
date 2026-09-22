'use client'

import type { ContentBlock } from '@/lib/types'

const TYPES: { value: ContentBlock['type']; label: string }[] = [
  { value: 'paragraph', label: 'Parágrafo' },
  { value: 'heading', label: 'Subtítulo' },
  { value: 'quote', label: 'Citação' },
  { value: 'list', label: 'Lista' },
  { value: 'meta', label: 'Ficha técnica' },
]

const field =
  'w-full min-h-[44px] border border-line bg-ink-raised px-3 py-2 text-sm text-bone focus:border-gold focus:outline-none'

/**
 * Editor da narrativa do projeto.
 *
 * Blocos estruturados, não um campo de HTML: o que o editor escreve é sempre
 * texto, e o site decide como o desenhar. Isso mantém a direção de arte
 * consistente e elimina o risco de injeção de markup.
 */
export function BlocksEditor({
  blocks,
  onChange,
}: {
  blocks: ContentBlock[]
  onChange: (next: ContentBlock[]) => void
}) {
  const update = (index: number, block: ContentBlock) => {
    onChange(blocks.map((item, i) => (i === index ? block : item)))
  }

  const move = (from: number, to: number) => {
    if (to < 0 || to >= blocks.length) return
    const next = blocks.slice()
    const [moved] = next.splice(from, 1)
    if (!moved) return
    next.splice(to, 0, moved)
    onChange(next)
  }

  const add = (type: ContentBlock['type']) => {
    const created: ContentBlock =
      type === 'list'
        ? { type: 'list', items: [''] }
        : type === 'meta'
          ? { type: 'meta', items: [{ label: '', value: '' }] }
          : { type, text: '' }
    onChange([...blocks, created])
  }

  return (
    <div className="flex flex-col gap-5">
      {blocks.map((block, index) => (
        <div key={index} className="border border-line p-4">
          <div className="flex items-center justify-between gap-4">
            <span className="text-eyebrow text-bone-muted">
              {TYPES.find((type) => type.value === block.type)?.label}
            </span>
            <div className="flex gap-3 text-sm text-bone-muted">
              <button
                type="button"
                onClick={() => move(index, index - 1)}
                disabled={index === 0}
                aria-label={`Mover bloco ${index + 1} para cima`}
                className="hover:text-bone disabled:opacity-30"
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => move(index, index + 1)}
                disabled={index === blocks.length - 1}
                aria-label={`Mover bloco ${index + 1} para baixo`}
                className="hover:text-bone disabled:opacity-30"
              >
                ↓
              </button>
              <button
                type="button"
                onClick={() => onChange(blocks.filter((_, i) => i !== index))}
                className="hover:text-gold"
              >
                Remover
              </button>
            </div>
          </div>

          <div className="mt-3">
            {block.type === 'list' ? (
              <ListFields block={block} onChange={(next) => update(index, next)} />
            ) : block.type === 'meta' ? (
              <MetaFields block={block} onChange={(next) => update(index, next)} />
            ) : (
              <textarea
                value={block.text}
                rows={block.type === 'paragraph' ? 4 : 2}
                onChange={(event) => update(index, { ...block, text: event.target.value })}
                className={field}
              />
            )}
          </div>
        </div>
      ))}

      <div className="flex flex-wrap gap-3">
        {TYPES.map((type) => (
          <button
            key={type.value}
            type="button"
            onClick={() => add(type.value)}
            className="min-h-[44px] border border-line px-4 py-2 text-eyebrow text-bone-muted hover:text-bone"
          >
            + {type.label}
          </button>
        ))}
      </div>
    </div>
  )
}

function ListFields({
  block,
  onChange,
}: {
  block: Extract<ContentBlock, { type: 'list' }>
  onChange: (next: ContentBlock) => void
}) {
  return (
    <div className="flex flex-col gap-2">
      {block.items.map((item, index) => (
        <div key={index} className="flex gap-2">
          <input
            value={item}
            onChange={(event) =>
              onChange({
                ...block,
                items: block.items.map((value, i) => (i === index ? event.target.value : value)),
              })
            }
            className={field}
          />
          <button
            type="button"
            onClick={() => onChange({ ...block, items: block.items.filter((_, i) => i !== index) })}
            aria-label={`Remover item ${index + 1}`}
            className="shrink-0 border border-line px-3 text-sm text-bone-muted hover:text-gold"
          >
            ×
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange({ ...block, items: [...block.items, ''] })}
        className="self-start text-eyebrow text-bone-muted hover:text-bone"
      >
        + Item
      </button>
    </div>
  )
}

function MetaFields({
  block,
  onChange,
}: {
  block: Extract<ContentBlock, { type: 'meta' }>
  onChange: (next: ContentBlock) => void
}) {
  return (
    <div className="flex flex-col gap-2">
      {block.items.map((item, index) => (
        <div key={index} className="flex gap-2">
          <input
            value={item.label}
            placeholder="Rótulo"
            onChange={(event) =>
              onChange({
                ...block,
                items: block.items.map((value, i) =>
                  i === index ? { ...value, label: event.target.value } : value,
                ),
              })
            }
            className={field}
          />
          <input
            value={item.value}
            placeholder="Valor"
            onChange={(event) =>
              onChange({
                ...block,
                items: block.items.map((value, i) =>
                  i === index ? { ...value, value: event.target.value } : value,
                ),
              })
            }
            className={field}
          />
          <button
            type="button"
            onClick={() => onChange({ ...block, items: block.items.filter((_, i) => i !== index) })}
            aria-label={`Remover linha ${index + 1}`}
            className="shrink-0 border border-line px-3 text-sm text-bone-muted hover:text-gold"
          >
            ×
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange({ ...block, items: [...block.items, { label: '', value: '' }] })}
        className="self-start text-eyebrow text-bone-muted hover:text-bone"
      >
        + Linha
      </button>
    </div>
  )
}
