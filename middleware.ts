import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getRequiredRoles } from '@/config/routeRole';

// Decode JWT token to get payload
function decodeJwt(token: string) {
  try {
    // JWT format: header.payload.signature
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.error('Invalid JWT format - not 3 parts');
      return null;
    }

    const payload = parts[1];
    const decoded = JSON.parse(
      Buffer.from(payload, 'base64').toString('utf-8')
    );
    console.log('✓ Decoded JWT:', JSON.stringify(decoded));
    return decoded;
  } catch (e) {
    console.error('✗ Error decoding JWT:', e);
    return null;
  }
}

// Extract and normalize role from JWT payload
function extractRole(decodedToken: any): string | null {
  let role: string | null = null;

  // Try different role fields in JWT
  if (decodedToken.role) {
    // Remove "ROLE_" prefix if exists: "ROLE_QLV" -> "QLV"
    role = decodedToken.role.replace(/^ROLE_/, '');
  } else if (decodedToken.roleName) {
    role = decodedToken.roleName;
  } else if (decodedToken.sub) {
    // Use 'sub' as fallback, uppercase it: "qlv" -> "QLV"
    role = decodedToken.sub.toUpperCase();
  } else if (decodedToken.roles && Array.isArray(decodedToken.roles) && decodedToken.roles.length > 0) {
    role = decodedToken.roles[0].replace(/^ROLE_/, '');
  }

  // Ensure role is uppercase for comparison
  if (role) {
    role = role.toUpperCase();
  }

  console.log('  Extracted Role:', role);
  return role;
}

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const pathname = request.nextUrl.pathname;
  const isAdminPath = pathname.startsWith('/admin');
  const isLoginPage = pathname === '/admin/login';
  const isDashboard = pathname === '/admin';

  console.log('🔍 [Middleware] Request to:', pathname);
  console.log('  Token exists:', !!token);

  // If accessing admin area (except login) without token, redirect to login
  if (isAdminPath && !isLoginPage && !token) {
    console.log('  ⚠️ No token, redirecting to login');
    const url = new URL('/admin/login', request.url);
    return NextResponse.redirect(url);
  }

  // If already logged in and trying to access login, redirect to admin homepage
  if (isLoginPage && token) {
    console.log('  ℹ️ Already logged in, redirecting to admin');
    const url = new URL('/admin', request.url);
    return NextResponse.redirect(url);
  }

  // Check role-based access for protected routes
  if (isAdminPath && !isLoginPage && !isDashboard && token) {
    console.log('  📋 Checking role-based access...');
    const requiredRoles = getRequiredRoles(pathname);
    
    console.log('  Required Roles:', requiredRoles);
    
    if (requiredRoles && requiredRoles.length > 0) {
      // Decode JWT to get user role
      const decodedToken = decodeJwt(token);
      
      if (decodedToken) {
        const userRole = extractRole(decodedToken);
        
        if (userRole) {
          const hasAccess = requiredRoles.includes(userRole);
          console.log('  Has access?:', hasAccess);
          
          if (!hasAccess) {
            console.log('  ❌ Access DENIED - user role not in required roles');
            const url = new URL('/admin', request.url);
            return NextResponse.redirect(url);
          } else {
            console.log('  ✅ Access GRANTED');
          }
        } else {
          console.log('  ⚠️ User role not found in JWT, denying access');
          const url = new URL('/admin', request.url);
          return NextResponse.redirect(url);
        }
      } else {
        console.log('  ⚠️ Failed to decode JWT');
        const url = new URL('/admin', request.url);
        return NextResponse.redirect(url);
      }
    } else {
      console.log('  ℹ️ No required roles defined for this path - allowing access');
    }
  }

  console.log('  → Allowing request to proceed');
  return NextResponse.next();
}



export const config = {
  matcher: ['/admin/:path*'],
};
