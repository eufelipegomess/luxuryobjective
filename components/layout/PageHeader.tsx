import { SplitLines } from '@/components/motion/SplitLines'
import { noWidow } from '@/lib/utils'

/**
 * Abertura partilhada por Serviços, Projetos e Contacto.
 *
 * Título e texto assentam na mesma linha de base, dentro da mesma grelha, com
 * uma régua a fechar o bloco. Antes cada página resolvia isto à sua maneira e o
 * texto flutuava desalinhado do título.
 */
export function PageHeader({
  title,
  body,
  children,
}: {
  title: string
  body: string
  children?: React.ReactNode
}) {
  return (
    <section className="shell pt-[clamp(7rem,16vh,10rem)]">
      <div className="grid-editorial items-end gap-y-8">
        <div className="col-span-4 md:col-span-8 lg:col-span-6">
          <h1 className="text-display text-bone">
            <SplitLines text={title} delay={0.1} />
          </h1>
        </div>

        <div className="col-span-4 md:col-span-8 lg:col-span-5 lg:col-start-8">
          <p data-reveal data-delay="0.2" className="leading-relaxed text-bone-muted">
            {noWidow(body)}
          </p>
        </div>
      </div>

      <div className="mt-12 border-t border-line pt-8">{children}</div>
    </section>
  )
}
