import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value || 
                request.headers.get('authorization')?.replace('Bearer ', '');
  
  const isAdminPath = request.nextUrl.pathname.startsWith('/admin');
  const isLoginPage = request.nextUrl.pathname === '/admin/login';

  // If accessing admin area (except login) without token, redirect to login
  if (isAdminPath && !isLoginPage && !token) {
    // Check localStorage via client-side
    const url = new URL('/admin/login', request.url);
    return NextResponse.redirect(url);
  }

  // If already logged in and trying to access login, redirect to admin
  if (isLoginPage && token) {
    const url = new URL('/admin', request.url);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
