import type { Metadata } from 'next'
import { Hero } from '@/components/sections/Hero'
import { CompanyIntro } from '@/components/sections/CompanyIntro'
import { Areas } from '@/components/sections/Areas'
import { Stats } from '@/components/sections/Stats'
import { FutureProjects } from '@/components/sections/FutureProjects'
import { FinalCta } from '@/components/sections/FinalCta'
import { ProjectAccordion } from '@/components/projects/ProjectAccordion'
import { getFeaturedProjects } from '@/lib/queries/projects'
import { routes, siteConfig } from '@/lib/config'
import { home } from '@/content/pt-PT'

export const metadata: Metadata = {
  // `absolute` porque o título já traz o nome da empresa: sem isto, o template
  // acrescentava-o outra vez e a home aparecia na pesquisa como «Luxury
  // Objective — Promotora Imobiliária Integrada — Luxury Objective».
  title: { absolute: 'Luxury Objective — Promotora Imobiliária Integrada' },
  description: home.hero.subtitle,
  alternates: { canonical: '/' },
  openGraph: {
    title: 'Luxury Objective',
    description: home.hero.subtitle,
    url: '/',
    images: [siteConfig.ogImage],
  },
}

// Os projetos vêm do painel; cinco minutos chegam para o ritmo de publicação.
export const revalidate = 300

export default async function HomePage() {
  const featured = await getFeaturedProjects()

  return (
    <>
      <Hero />
      <CompanyIntro />
      <Areas />
      <Stats />

      {/* Projetos dinâmicos: sem frase institucional inventada à volta —
          apenas os dados publicados no painel. */}
      {featured.length > 0 ? (
        <section className="shell pb-(--spacing-section)" aria-label="Projetos">
          <ProjectAccordion projects={featured} />
        </section>
      ) : null}

      <FutureProjects
        title={home.futuros.title}
        body={home.futuros.body}
        cta={home.futuros.cta}
        href={routes.futurosProjetosParceria}
      />
      <FinalCta text={home.chamadaFinal.body} cta={home.chamadaFinal.cta} />
    </>
  )
}
