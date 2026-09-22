import { ButtonLink } from '@/components/ui/Button'
import { SplitLines } from '@/components/motion/SplitLines'
import { routes } from '@/lib/config'

/**
 * Encerramento limpo e amplo: texto centrado, botão por baixo. Sem cards e sem
 * repetir blocos anteriores.
 *
 * A largura máxima é em `rem`, não em `ch`: a unidade `ch` resolve contra o
 * tamanho de fonte herdado do contentor, não contra o do título, e deixava a
 * frase partida em nove linhas.
 */
export function FinalCta({
  text,
  cta,
  href = routes.contacto,
}: {
  text: string
  cta: string
  href?: string
}) {
  return (
    <section className="border-t border-line bg-ink">
      <div className="shell py-(--spacing-section)">
        <div className="mx-auto flex max-w-[46rem] flex-col items-center text-center">
          <p className="font-[family-name:var(--font-display)] text-[clamp(1.75rem,3.2vw,2.75rem)] leading-[1.12] tracking-tight text-balance text-bone">
            <SplitLines text={text} />
          </p>

          <div data-reveal data-delay="0.2" className="mt-12">
            <ButtonLink href={href} variant="primary" withArrow magnetic>
              {cta}
            </ButtonLink>
          </div>
        </div>
      </div>
    </section>
  )
}
