import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  /**
   * INICIALIZAÇÃO DA RESPOSTA
   * Criamos a resposta antecipadamente para que possamos anexar cookies nela,
   * garantindo a sincronização entre o servidor e o cliente.
   */
  let supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  /**
   * CLIENTE SUPABASE SSR
   * Configuramos o cliente para ler e escrever cookies diretamente na requisição/resposta.
   */
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

  /**
   * VERIFICAÇÃO DE SESSÃO
   * Chamada crítica para verificar se o token JWT presente no cookie é válido.
   */
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname;

  /**
   * REGRAS DE PROTEÇÃO DE ROTAS (ACL)
   * 
   * REGRA 1 (Autorização): Bloqueia acesso às áreas restritas se o usuário não estiver autenticado.
   */
  if (!user && (pathname.startsWith('/admin') || pathname.startsWith('/caixa') || pathname.startsWith('/cozinha'))) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  /**
   * REGRA 2 (Redirecionamento Inteligente): Se o usuário já está logado, 
   * não faz sentido ele ver a tela de login. Mandamos para o Painel Admin.
   */
  if (user && pathname === '/login') {
    const url = request.nextUrl.clone()
    url.pathname = '/admin'
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