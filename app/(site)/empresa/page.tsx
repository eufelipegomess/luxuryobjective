import type { Metadata } from 'next'
import { EmpresaHero } from '@/components/sections/EmpresaHero'
import { FinalCta } from '@/components/sections/FinalCta'
import { Lideranca } from '@/components/sections/Lideranca'
import { ValoresMarquee } from '@/components/sections/ValoresMarquee'
import { IconMissao, IconValores, IconVisao } from '@/components/ui/Icons'
import { empresa, home, nav } from '@/content/pt-PT'
import { truncate } from '@/lib/utils'

export const metadata: Metadata = {
  title: nav.empresa,
  description: truncate(empresa.quemSomos.body, 155),
  alternates: { canonical: '/empresa' },
  openGraph: {
    title: `${nav.empresa} — Luxury Objective`,
    description: truncate(empresa.quemSomos.body, 155),
    url: '/empresa',
  },
}

/**
 * A abertura não repete a hero da Home. Título, texto e imagem formam um só
 * bloco — antes eram três faixas soltas empilhadas. O único título grande é
 * "Quem somos": o briefing proíbe inventar um subtítulo.
 */
export default function EmpresaPage() {
  return (
    <>
      <EmpresaHero />

      <MissaoVisaoValores />
      <Lideranca />

      <FinalCta text={home.chamadaFinal.body} cta={home.chamadaFinal.cta} />
    </>
  )
}

function MissaoVisaoValores() {
  const { mvv } = empresa

  return (
    <section className="shell py-(--spacing-section)" aria-labelledby="mvv-titulo">
      <h2 id="mvv-titulo" data-reveal className="text-eyebrow text-bone-muted">
        {mvv.title}
      </h2>

      <div className="grid-editorial mt-14 gap-y-16">
        {/* Missão e visão com a mesma tipografia e a mesma largura: são
            afirmações do mesmo nível. A missão em escala de título lia-se como
            um cabeçalho solto. */}
        <article className="col-span-4 md:col-span-8 lg:col-span-5">
          <IconMissao className="h-11 w-11 text-gold" />
          <h3 className="mt-6 text-eyebrow text-gold">{mvv.missaoLabel}</h3>
          <p data-reveal className="measure mt-5 leading-relaxed text-bone-muted">
            {mvv.missao}
          </p>
        </article>

        <article className="col-span-4 md:col-span-8 lg:col-span-5 lg:col-start-8">
          <IconVisao className="h-11 w-11 text-gold" />
          <h3 className="mt-6 text-eyebrow text-gold">{mvv.visaoLabel}</h3>
          <p data-reveal className="measure mt-5 leading-relaxed text-bone-muted">
            {mvv.visao}
          </p>
        </article>
      </div>

      {/* Valores como faixa tipográfica contínua — não oito cards iguais. */}
      <div className="mt-(--spacing-section-tight) border-t border-line pt-12">
        <div className="flex items-center gap-4">
          <IconValores className="h-9 w-9 text-gold" />
          <h3 className="text-eyebrow text-bone-muted">{mvv.valoresLabel}</h3>
        </div>
        <div className="mt-10">
          <ValoresMarquee values={mvv.valores} />
        </div>
      </div>
    </section>
  )
}
