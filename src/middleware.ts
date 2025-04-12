import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const isAuthenticated = request.cookies.has('fabr_auth_token')
  const isLoginPage = request.nextUrl.pathname === '/login'
  
  // Se o usuário não está autenticado e não está na página de login, redireciona para o login
  if (!isAuthenticated && !isLoginPage) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  // Se o usuário está autenticado e está tentando acessar a página de login, redireciona para home
  if (isAuthenticated && isLoginPage) {
    return NextResponse.redirect(new URL('/', request.url))
  }
  
  return NextResponse.next()
}

// Definindo em quais caminhos o middleware deve ser executado
export const config = {
  // Quais caminhos serão protegidos pela autenticação
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.png|.*\\.svg).*)']
}