import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

export type UserRole = 'attendee' | 'presenter' | 'admin';

export interface UserSession {
  id: string;
  role: UserRole;
  email?: string;
  iat?: number;
  exp?: number;
}

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret'
);

async function verifyToken(token: string): Promise<UserSession | null> {
  if (!token) return null;
  
  try {
    const { payload } = await jwtVerify(token, secret);

    if (typeof payload !== 'object' || payload === null) return null;

    const anyPayload = payload as any;
    const id = anyPayload.id;
    const role = anyPayload.role;

    if (typeof id !== 'string') return null;
    if (role !== 'attendee' && role !== 'presenter' && role !== 'admin') return null;

    const user: UserSession = {
      id,
      role,
      email: typeof anyPayload.email === 'string' ? anyPayload.email : undefined,
      iat: typeof anyPayload.iat === 'number' ? anyPayload.iat : undefined,
      exp: typeof anyPayload.exp === 'number' ? anyPayload.exp : undefined,
    };

    return user;
  } catch (error) {
    console.error('[Auth Utils] Error al verificar token:', error);
    return null;
  }
}

export async function getSession(): Promise<UserSession | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    
    if (!token) {
      return null;
    }
    
    const user = await verifyToken(token);
    return user;
  } catch (error) {
    console.error('[Auth Utils] Error al obtener sesión:', error);
    return null;
  }
}

export async function getAuthToken(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    return cookieStore.get('auth-token')?.value || null;
  } catch (error) {
    console.error('[Auth Utils] Error al obtener token:', error);
    return null;
  }
}

export async function clearSession(): Promise<void> {
  try {
    const cookieStore = await cookies();
    cookieStore.delete('auth-token');
  } catch (error) {
    console.error('[Auth Utils] Error al limpiar sesión:', error);
  }
}