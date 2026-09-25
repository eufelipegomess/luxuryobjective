import type { Metadata, Viewport } from 'next'
import { Fahkwang, Jost } from 'next/font/google'
import { MotionFlags } from '@/components/motion/MotionFlags'
import { siteConfig } from '@/lib/config'
import './globals.css'

/**
 * Duas famílias, pesos mínimos. Fahkwang carrega apenas 200/300 (editorial,
 * nunca decorativa); Jost apenas 300/400 (leitura clara em qualquer tamanho).
 */
const fahkwang = Fahkwang({
  subsets: ['latin'],
  weight: ['200', '300'],
  variable: '--font-fahkwang',
  display: 'swap',
})

const jost = Jost({
  subsets: ['latin'],
  weight: ['300', '400'],
  variable: '--font-jost',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} — ${siteConfig.tagline}`,
    template: `%s — ${siteConfig.name}`,
  },
  description:
    'A Luxury Objective desenvolve projetos e oportunidades imobiliárias, combinando visão estratégica, capacidade de execução e acompanhamento próximo em cada etapa.',
  applicationName: siteConfig.name,
  icons: { icon: '/favicon.svg' },
  openGraph: {
    type: 'website',
    locale: 'pt_PT',
    siteName: siteConfig.name,
    url: siteConfig.url,
    images: [siteConfig.ogImage],
  },
  twitter: { card: 'summary_large_image' },
  // O robots.txt é só um pedido; esta meta tag é o que fecha mesmo a porta.
  robots: siteConfig.noindex
    ? { index: false, follow: false, nocache: true }
    : { index: true, follow: true },
}

export const viewport: Viewport = {
  themeColor: '#0E0E0E',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

/**
 * Marca o documento antes da hidratação para que os estados iniciais de
 * animação só existam quando o JS está de facto a correr. Sem JS, o conteúdo
 * fica visível — nunca escondido à espera de um reveal que não vai acontecer.
 *
 * São atributos, e não classes: o React compara o `className` que ele próprio
 * renderizou e acusaria erro de hidratação; um atributo que nunca renderiza
 * fica de fora dessa comparação.
 *
 * `data-hero-scrub` liga o vídeo conduzido pelo scroll e alonga a hero. Fica
 * até ao fim da visita, porque removê-lo a meio encolheria a página debaixo dos
 * pés do utilizador.
 *
 * `data-hero-intro` esconde o header e o texto da hero até o vídeo chegar perto
 * do fim. É retirado assim que isso acontece. Só na primeira carga da sessão e
 * só na Home — noutra página deixaria o header escondido sem nada que o
 * voltasse a mostrar.
 *
 * Os dois `try` são separados de propósito: em navegação privada o acesso ao
 * `sessionStorage` atira, e isso não pode desligar o movimento do site inteiro.
 *
 * Este script trata do antes da hidratação. O depois é do <MotionFlags />: o
 * React pode reescrever o <html> e levar estes atributos à frente. Ver
 * `lib/animations/flags.ts`.
 */
const MOTION_FLAG = [
  `try{if(!matchMedia('(prefers-reduced-motion: reduce)').matches){document.documentElement.setAttribute('data-motion','')}}catch(e){}`,
  `try{if(document.documentElement.hasAttribute('data-motion')&&location.pathname==='/'&&!sessionStorage.getItem('lo:hero-intro')){document.documentElement.setAttribute('data-hero-scrub','');document.documentElement.setAttribute('data-hero-intro','')}}catch(e){}`,
].join('')

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // O `data-motion` é escrito pelo script acima antes da hidratação, por isso
    // o <html> do cliente diverge do servidor de propósito. Sem esta supressão,
    // o React descarta o HTML do servidor e volta a renderizar tudo no cliente.
    <html
      lang="pt-PT"
      className={`${fahkwang.variable} ${jost.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: MOTION_FLAG }} />
      </head>
      <body>
        <MotionFlags />
        {children}
      </body>
    </html>
  )
}
