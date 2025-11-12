import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    const cookieStore = await cookies();
    
    // Eliminar la cookie del token
    cookieStore.delete('auth-token');

    console.log('[Logout] Sesión cerrada correctamente');

    return NextResponse.json({
      success: true,
      message: 'Sesión cerrada correctamente',
    });
  } catch (error) {
    console.error('[Logout] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Error al cerrar sesión' },
      { status: 500 }
    );
  }
}