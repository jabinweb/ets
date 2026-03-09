import { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
import { auth } from '@/auth';

export interface AuthUser {
  userId: string;
  email: string;
  role: string;
  name: string | null;
}

/**
 * Verify mobile app JWT token from Authorization header
 */
export async function verifyMobileToken(request: NextRequest): Promise<AuthUser | null> {
  try {
    const authHeader = request.headers.get('authorization');
    console.log('verifyMobileToken - Auth header:', authHeader ? 'present' : 'missing');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('verifyMobileToken - Invalid auth header format');
      return null;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    console.log('verifyMobileToken - Token length:', token.length);
    console.log('verifyMobileToken - Token first 100 chars:', token.substring(0, 100));
    console.log('verifyMobileToken - Token has dots:', (token.match(/\./g) || []).length);
    console.log('verifyMobileToken - Full auth header:', authHeader.substring(0, 120));
    
    const secretKey = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || 'your-secret-key-min-32-characters-long';
    const secret = new TextEncoder().encode(secretKey);
    console.log('verifyMobileToken - Using AUTH_SECRET:', !!process.env.AUTH_SECRET);
    console.log('verifyMobileToken - Using NEXTAUTH_SECRET:', !!process.env.NEXTAUTH_SECRET);

    const { payload } = await jwtVerify(token, secret);
    console.log('verifyMobileToken - Token verified successfully for:', payload.email);
    
    return {
      userId: payload.userId as string,
      email: payload.email as string,
      role: payload.role as string,
      name: payload.name as string | null
    };
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

/**
 * Get authenticated user from either NextAuth session or mobile JWT token
 */
export async function getAuthUser(request: NextRequest): Promise<AuthUser | null> {
  console.log('getAuthUser - Checking authentication...');
  
  // First try NextAuth session (for web app)
  const session = await auth();
  if (session?.user?.email) {
    console.log('getAuthUser - NextAuth session found for:', session.user.email);
    return {
      userId: session.user.id || '',
      email: session.user.email,
      role: session.user.role || '',
      name: session.user.name || null
    };
  }
  
  console.log('getAuthUser - No NextAuth session, trying JWT token...');

  // Then try mobile JWT token
  const mobileUser = await verifyMobileToken(request);
  if (mobileUser) {
    console.log('getAuthUser - JWT token valid for:', mobileUser.email);
  } else {
    console.log('getAuthUser - JWT token validation failed');
  }
  return mobileUser;
}

/**
 * Check if user has required role
 */
export function hasRole(user: AuthUser | null, allowedRoles: string[]): boolean {
  if (!user) return false;
  return allowedRoles.includes(user.role.toUpperCase());
}
