import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const secretStr = process.env.JWT_SECRET || 'd72f1dacc1f462f81d9b5e7075884c325ef310d43afd2700a23a3b3643031ebf';
const secret = new TextEncoder().encode(secretStr);

const publicRoutes = [
  '/login',
  '/signup',
  '/forgot-password',
  '/reset-password',
  '/unauthorized'
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
    console.error(`[Middleware] Token verification failed: ${error.message}`);
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (publicRoutes.some(route => pathname === route || pathname.startsWith(route))) {
    return NextResponse.next();
  }
  if (
    apiRoutes.some(route => pathname.startsWith(route)) ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.match(/\.(svg|png|jpg|jpeg|gif|webp|ico)$/)
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get('auth-token')?.value;

  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  const payload = await verifyToken(token);

  if (!payload) {
    console.log('[Middleware] Invalid token. Destroying session.');
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('error', 'session_expired');

    const response = NextResponse.redirect(loginUrl);

    response.cookies.delete('auth-token');

    return response;
  }

  for (const [route, allowedRoles] of Object.entries(roleBasedRoutes)) {
    if (pathname.startsWith(route)) {
      const userRole = payload.role as string;
      if (!allowedRoles.includes(userRole)) {
        console.log(`[Middleware] Access denied for role ${userRole}`);
        return NextResponse.rewrite(new URL('/unauthorized', request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};