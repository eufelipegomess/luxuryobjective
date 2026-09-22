import type { Metadata } from 'next'
import { ButtonLink } from '@/components/ui/Button'
import { MediaSlot } from '@/components/ui/MediaSlot'
import { PageHeader } from '@/components/layout/PageHeader'
import { OrcamentosOportunidades } from '@/components/sections/OrcamentosOportunidades'
import { media, type MediaRef } from '@/lib/media'
import { routes } from '@/lib/config'
import { nav, servicos } from '@/content/pt-PT'
import { noWidow, truncate } from '@/lib/utils'

export const metadata: Metadata = {
  title: nav.servicos,
  description: truncate(servicos.intro.body, 155),
  alternates: { canonical: '/servicos' },
  openGraph: {
    title: `${nav.servicos} — Luxury Objective`,
    description: truncate(servicos.intro.body, 155),
    url: '/servicos',
  },
}

/**
 * As três áreas dominam a página: painéis largos e alternância de superfície
 * escura/clara/escura. Depois delas, o percurso para os formulários.
 */
export default function ServicosPage() {
  return (
    <>
      {/* O PDF não define título para a abertura de Serviços e o briefing
          proíbe inventar um: usamos o rótulo de navegação aprovado. */}
      <PageHeader title={nav.servicos} body={servicos.intro.body} />

      <AreaBlock
        title={servicos.desenvolvimento.title}
        body={servicos.desenvolvimento.body}
        cta={servicos.desenvolvimento.cta}
        href={routes.projetosDesenvolvimento}
        slot={media.areaDesenvolvimento}
      />

      {/* Sem categoria de projetos própria: o botão leva ao contacto. */}
      <AreaBlock
        title={servicos.construcao.title}
        body={servicos.construcao.body}
        cta={servicos.construcao.cta}
        href={routes.contacto}
        slot={media.areaConstrucao}
        light
        reversed
      />

      <AreaBlock
        title={servicos.remodelacao.title}
        body={servicos.remodelacao.body}
        cta={servicos.remodelacao.cta}
        href={routes.projetosRemodelacao}
        slot={media.areaRemodelacao}
      />

      <OrcamentosOportunidades />
    </>
  )
}

function AreaBlock({
  title,
  body,
  cta,
  href,
  slot,
  light = false,
  reversed = false,
}: {
  title: string
  body: string
  cta: string
  href: string
  slot: MediaRef
  light?: boolean
  reversed?: boolean
}) {
  return (
    <section className={light ? 'surface-light' : 'bg-ink'}>
      <div className="shell py-(--spacing-section)">
        <div className="grid-editorial items-center gap-y-12">
          <div
            className={
              reversed
                ? 'col-span-4 md:col-span-8 lg:col-span-6 lg:col-start-7'
                : 'col-span-4 md:col-span-8 lg:col-span-6'
            }
          >
            <h2 className={light ? 'text-headline text-ink' : 'text-headline text-bone'}>
              {title}
            </h2>
            <p
              data-reveal
              className={
                light
                  ? 'measure mt-8 leading-relaxed text-ink/75'
                  : 'measure mt-8 leading-relaxed text-bone-muted'
              }
            >
              {noWidow(body)}
            </p>
            <div data-reveal data-delay="0.1" className="mt-12 hidden lg:block">
              <ButtonLink href={href} variant={light ? 'onLight' : 'secondary'} withArrow>
                {cta}
              </ButtonLink>
            </div>
          </div>

          <div
            className={
              reversed
                ? 'col-span-4 md:col-span-8 lg:col-span-5 lg:col-start-1 lg:row-start-1'
                : 'col-span-4 md:col-span-8 lg:col-span-5 lg:col-start-8'
            }
          >
            <MediaSlot media={slot} reveal sizes="(min-width: 1024px) 42vw, 100vw" />
          </div>

          {/* Abaixo de lg o botão vem depois da imagem. */}
          <div data-reveal className="col-span-4 md:col-span-8 lg:hidden">
            <ButtonLink href={href} variant={light ? 'onLight' : 'secondary'} withArrow>
              {cta}
            </ButtonLink>
          </div>
        </div>
      </div>
    </section>
  )
}
