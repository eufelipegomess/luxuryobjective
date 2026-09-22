import type { ContentBlock } from '@/lib/types'
import { compactMeta } from '@/lib/utils'

/**
 * Narrativa do projeto.
 *
 * Renderiza apenas blocos estruturados vindos do painel — nunca HTML livre.
 * É esta escolha que fecha a porta a XSS por conteúdo administrativo, e é por
 * isso que não existe aqui nenhum `dangerouslySetInnerHTML`.
 *
 * Blocos vazios são descartados: o site não mostra títulos sem texto nem
 * labels sem valor.
 */
export function ProjectBlocks({ blocks }: { blocks: ContentBlock[] }) {
  const visible = blocks.filter(isMeaningful)
  if (visible.length === 0) return null

  return (
    <div className="flex flex-col gap-10">
      {visible.map((block, index) => (
        <Block key={index} block={block} />
      ))}
    </div>
  )
}

function Block({ block }: { block: ContentBlock }) {
  switch (block.type) {
    case 'heading':
      return <h3 className="text-title text-bone">{block.text}</h3>

    case 'paragraph':
      return <p className="measure leading-relaxed text-bone-muted">{block.text}</p>

    case 'quote':
      return (
        <blockquote className="border-l border-gold pl-6 text-title text-bone">
          {block.text}
        </blockquote>
      )

    case 'list':
      return (
        <ul className="measure flex flex-col gap-3 text-bone-muted">
          {block.items.filter((item) => item.trim().length > 0).map((item, index) => (
            <li key={index} className="flex gap-4">
              <span aria-hidden="true" className="mt-3 block h-px w-4 shrink-0 bg-line-strong" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )

    case 'meta': {
      const items = compactMeta(block.items)
      return (
        <dl className="grid grid-cols-2 gap-x-8 gap-y-6 border-t border-line pt-8 md:grid-cols-4">
          {items.map((item) => (
            <div key={item.label}>
              <dt className="text-eyebrow text-bone-muted">{item.label}</dt>
              <dd className="mt-2 text-bone">{item.value}</dd>
            </div>
          ))}
        </dl>
      )
    }
  }
}

function isMeaningful(block: ContentBlock): boolean {
  switch (block.type) {
    case 'heading':
    case 'paragraph':
    case 'quote':
      return block.text.trim().length > 0
    case 'list':
      return block.items.some((item) => item.trim().length > 0)
    case 'meta':
      return compactMeta(block.items).length > 0
  }
}
