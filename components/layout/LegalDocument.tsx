import type { LegalDocument as Documento } from '@/content/legal'
import { legalUpdatedAt } from '@/content/legal'
import { noWidow } from '@/lib/utils'

/**
 * Um documento legal: título, introdução e secções numeradas.
 *
 * Sem reveal por linha nem qualquer outro movimento. Quem abre uma política de
 * privacidade quer lê-la, e quer poder usar o Ctrl+F — texto que só aparece ao
 * passar por ele atrapalha as duas coisas. A medida da linha é curta pela mesma
 * razão.
 */
export function LegalDocument({ doc }: { doc: Documento }) {
  return (
    <article className="shell pb-(--spacing-section) pt-[clamp(7rem,16vh,10rem)]">
      <header className="border-b border-line pb-12">
        <h1 className="text-display max-w-[16ch] text-bone">{doc.title}</h1>
        <p className="measure mt-8 leading-relaxed text-bone-muted">{noWidow(doc.intro)}</p>
      </header>

      <div className="mt-16 flex flex-col gap-16">
        {doc.sections.map((section, index) => (
          <section key={section.title} className="grid-editorial gap-y-6">
            <h2 className="col-span-4 text-eyebrow text-bone-muted md:col-span-8 lg:col-span-3">
              <span className="text-bone/40">{String(index + 1).padStart(2, '0')}</span>{' '}
              {section.title}
            </h2>

            <div className="col-span-4 flex flex-col gap-5 md:col-span-8 lg:col-span-8 lg:col-start-5">
              {section.paragraphs?.map((texto) => (
                <p key={texto} className="measure leading-relaxed text-bone-muted">
                  {noWidow(texto)}
                </p>
              ))}

              {section.list ? (
                <ul className="measure flex flex-col gap-3">
                  {section.list.map((item) => (
                    <li key={item} className="flex gap-3 leading-relaxed text-bone-muted">
                      <span aria-hidden="true" className="mt-[0.6em] h-px w-4 shrink-0 bg-gold" />
                      <span>{noWidow(item)}</span>
                    </li>
                  ))}
                </ul>
              ) : null}

              {section.listFooter ? (
                <p className="measure leading-relaxed text-bone-muted">
                  {noWidow(section.listFooter)}
                </p>
              ) : null}
            </div>
          </section>
        ))}
      </div>

      <footer className="mt-16 border-t border-line pt-8">
        <p className="text-sm text-bone-muted">Última atualização: {legalUpdatedAt}.</p>
      </footer>
    </article>
  )
}
