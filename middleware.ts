import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const TOKEN_NAME = 'parcelflow_token';

// Helper to decode JWT payload without Node crypto dependencies in Edge runtime
function decodeJwtPayload(token: string) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    let base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }
    const jsonPayload = atob(base64);
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(TOKEN_NAME)?.value;
  const payload = token ? decodeJwtPayload(token) : null;

  const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/forgot-password');
  const isAdminRoute = pathname.startsWith('/admin');
  const isManagerRoute = pathname.startsWith('/manager');

  // Check token expiry
  const isTokenExpired = payload?.exp ? payload.exp < Math.floor(Date.now() / 1000) : false;
  const isAuthenticated = payload && !isTokenExpired;

  // 1. If trying to access protected routes without valid auth -> Redirect to login
  if ((isAdminRoute || isManagerRoute) && !isAuthenticated) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 2. If logged in and trying to access auth pages -> Redirect to appropriate dashboard
  if (isAuthRoute && isAuthenticated) {
    if (payload.role === 'super_admin') {
      return NextResponse.redirect(new URL('/admin', request.url));
    } else if (payload.role === 'apartment_manager') {
      return NextResponse.redirect(new URL('/manager', request.url));
    }
  }

  // 3. Role protection
  if (isAdminRoute && payload?.role !== 'super_admin') {
    return NextResponse.redirect(new URL('/manager', request.url));
  }

  if (isManagerRoute && payload?.role !== 'apartment_manager') {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/manager/:path*', '/login', '/forgot-password'],
};
