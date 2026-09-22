import Link from 'next/link'
import { nav } from '@/content/pt-PT'

/**
 * O texto "Página não encontrada." é um rótulo técnico de interface — não
 * existe equivalente no PDF aprovado e é indispensável nesta rota.
 */
export default function NotFound() {
  return (
    <section className="flex min-h-[70svh] items-center">
      <div className="shell">
        <p className="text-eyebrow text-bone-muted">404</p>
        <h1 className="text-headline mt-6 max-w-[16ch] text-bone">Página não encontrada.</h1>
        <Link
          href="/"
          className="mt-10 inline-flex min-h-[52px] items-center bg-gold px-7 py-4 text-nav text-ink"
        >
          {nav.home}
        </Link>
      </div>
    </section>
  )
}
