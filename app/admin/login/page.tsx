import Image from 'next/image'
import { LoginForm } from '@/components/admin/LoginForm'
import { brand } from '@/lib/media'

type Props = { searchParams: Promise<{ proximo?: string; erro?: string }> }

export default async function LoginPage({ searchParams }: Props) {
  const { proximo, erro } = await searchParams

  return (
    <div className="flex min-h-svh items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        <Image
          src={brand.iconPrimary}
          alt="Luxury Objective"
          width={44}
          height={81}
          className="mx-auto h-12 w-auto"
        />

        <h1 className="mt-10 text-center text-title text-bone">Painel</h1>

        {erro === 'sem-permissao' ? (
          <p role="alert" className="mt-6 border border-line px-4 py-3 text-center text-sm text-gold">
            Esta conta não tem acesso ao painel.
          </p>
        ) : null}

        <div className="mt-10">
          <LoginForm next={sanitizeNext(proximo)} />
        </div>
      </div>
    </div>
  )
}

/** Só aceitamos caminhos internos — senão o `proximo` vira open redirect. */
function sanitizeNext(value: string | undefined): string {
  if (!value) return '/admin'
  if (!value.startsWith('/admin')) return '/admin'
  if (value.startsWith('//')) return '/admin'
  return value
}
