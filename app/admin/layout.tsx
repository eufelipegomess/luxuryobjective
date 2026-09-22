import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Painel',
  // O painel nunca deve ser indexado, mesmo que o robots.txt falhe.
  robots: { index: false, follow: false, nocache: true },
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-svh bg-ink text-bone">{children}</div>
}
