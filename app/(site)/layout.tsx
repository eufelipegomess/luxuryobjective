import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Preloader } from '@/components/motion/Preloader'
import { PageTransition } from '@/components/motion/PageTransition'
import { SmoothScroll } from '@/components/motion/SmoothScroll'
import { RevealController } from '@/components/motion/Reveal'
import { CustomCursor } from '@/components/motion/CustomCursor'
import { OrganizationJsonLd } from '@/components/layout/JsonLd'
import { ui } from '@/content/pt-PT'

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <OrganizationJsonLd />
      <Preloader />
      <PageTransition />
      <SmoothScroll />

      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[110] focus:bg-gold focus:px-5 focus:py-3 focus:text-nav focus:text-ink"
      >
        {ui.saltarParaConteudo}
      </a>

      <Header />
      <main id="conteudo">{children}</main>
      <Footer />

      <RevealController />
      <CustomCursor />
    </>
  )
}
