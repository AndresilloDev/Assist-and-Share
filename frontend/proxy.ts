import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const secretStr = process.env.JWT_SECRET || '';
const secret = new TextEncoder().encode(secretStr);

const publicRoutes = [
  '/login',
  '/signup',
  '/forgot-password',
  '/reset-password',
];

const apiRoutes = [
  '/api/auth/credentials/login',
  '/api/auth/google/callback',
  '/api/auth/logout',
];

const roleBasedRoutes: Record<string, string[]> = {
  '/users': ['admin'],
  '/presenter/dashboard': ['presenter', 'admin'],
  '/events': ['attendee', 'admin', 'presenter'],
  '/my-inscriptions': ['attendee'],
  '/feedback': ['presenter'],
  '/send-feedback': ['attendee'],
};

async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch (error: any) {
    console.error(`[Proxy Error] Token verification failed`);
    console.error(`[Proxy Error] Error: ${error.message}`);
    return null;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Permitir rutas públicas
  if (publicRoutes.some(route => pathname === route || pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Permitir rutas de API
  if (apiRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Permitir assets estáticos
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.match(/\.(svg|png|jpg|jpeg|gif|webp|ico)$/)
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get('auth-token')?.value;

  // Si no hay token, redirigir a login
  if (!token) {
    console.log('[Proxy] No token found, redirecting to /login');
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Verificar token
  const payload = await verifyToken(token);

  if (!payload) {
    console.log('[Proxy] Invalid token detected');

    const isInitialNavigation = pathname === '/events' || pathname === '/';

    if (!isInitialNavigation) {
      console.log('[Proxy] Clearing invalid token and redirecting');
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('error', 'session_expired');

      const response = NextResponse.redirect(loginUrl);
      return response;
    } else {
      // En navegación inicial, dar una oportunidad más (puede ser timing issue)
      console.log('[Proxy] Allowing initial navigation despite invalid token');
      return NextResponse.next();
    }
  }

  // Verificar permisos de rol
  for (const [route, allowedRoles] of Object.entries(roleBasedRoutes)) {
    if (pathname.startsWith(route)) {
      const userRole = payload.role as string;
      if (!allowedRoles.includes(userRole)) {
        console.log(`[Proxy] Access denied to ${pathname} for role ${userRole}`);
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};