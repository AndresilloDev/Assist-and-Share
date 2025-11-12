import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email y contraseña son requeridos' },
        { status: 400 }
      );
    }

    // Llamar al backend para autenticar
    const backendUrl = process.env.NEXT_PUBLIC_API_URL;
    const response = await fetch(`${backendUrl}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: data.message || 'Error al iniciar sesión' },
        { status: response.status }
      );
    }

    // Verificar que tenemos los datos necesarios
    if (!data.success || !data.value?.token) {
      return NextResponse.json(
        { success: false, message: 'Respuesta inválida del servidor' },
        { status: 500 }
      );
    }

    // Guardar el token en una cookie httpOnly
    const cookieStore = await cookies();
    cookieStore.set('auth-token', data.value.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 días
      path: '/',
    });

    console.log('[Credentials Login] Login exitoso, cookie configurada');

    // Devolver los datos del usuario
    return NextResponse.json({
      success: true,
      message: 'Inicio de sesión exitoso',
      user: data.value.user,
      token: data.value.token, // Para que el cliente también pueda acceder
    });
  } catch (error) {
    console.error('[Credentials Login] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}