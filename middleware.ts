import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

/**
 * Proteção das rotas de administração no edge, antes de qualquer render.
 *
 * A UI nunca decide quem é admin — decide-se aqui e, de novo, na RLS. Sem
 * sessão válida, /admin/* redireciona para o login. Com sessão, /admin/login
 * redireciona para o painel.
 */
export async function middleware(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    // Em desenvolvimento o painel corre sobre o armazenamento local, sem
    // autenticação, para ser utilizável antes de existir base de dados.
    if (process.env.NODE_ENV !== 'production') {
      // O login não tem função nenhuma neste modo: vai direto ao painel.
      if (request.nextUrl.pathname === '/admin/login') {
        const redirect = request.nextUrl.clone()
        redirect.pathname = '/admin'
        redirect.search = ''
        return NextResponse.redirect(redirect)
      }
      return NextResponse.next()
    }

    // Em produção sem Supabase não há como autenticar ninguém: fecha. Um painel
    // sem autenticação exposto na internet seria pior do que um indisponível.
    if (request.nextUrl.pathname.startsWith('/admin')) {
      return new NextResponse('Painel indisponível: Supabase não configurado. Ver README.', {
        status: 503,
        headers: { 'content-type': 'text/plain; charset=utf-8' },
      })
    }
    return NextResponse.next()
  }

  let response = NextResponse.next({ request })

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value)
        }
        response = NextResponse.next({ request })
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options)
        }
      },
    },
  })

  // getUser() revalida o token no servidor; getSession() aceitaria um cookie
  // forjado.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl
  const isLogin = pathname === '/admin/login'

  if (pathname.startsWith('/admin') && !isLogin && !user) {
    const redirect = request.nextUrl.clone()
    redirect.pathname = '/admin/login'
    redirect.searchParams.set('proximo', pathname)
    return NextResponse.redirect(redirect)
  }

  if (isLogin && user) {
    const redirect = request.nextUrl.clone()
    redirect.pathname = '/admin'
    redirect.search = ''
    return NextResponse.redirect(redirect)
  }

  return response
}

export const config = {
  matcher: ['/admin/:path*'],
}
