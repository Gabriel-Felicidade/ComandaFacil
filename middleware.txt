import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  // Configura a resposta padrão do servidor
  let supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Cria o cliente do Supabase especial para o servidor (SSR)
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Verifica se existe um usuário logado
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname;

  // REGRA 1: Se NÃO está logado e tentar acessar admin, caixa ou cozinha -> vai pro /login
  if (!user && (pathname.startsWith('/admin') || pathname.startsWith('/caixa') || pathname.startsWith('/cozinha'))) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // REGRA 2: Se JÁ ESTÁ logado e tentar acessar a tela de /login -> vai direto pro /caixa
  if (user && pathname === '/login') {
    const url = request.nextUrl.clone()
    url.pathname = '/caixa'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

// Essa configuração diz ao Next.js para rodar esse segurança em todas as páginas, 
// exceto em imagens, arquivos estáticos e ícones.
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}