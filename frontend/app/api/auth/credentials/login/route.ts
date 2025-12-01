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

    // Llamar al backend (Elastic Beanstalk / API Gateway)
    const backendUrl = process.env.NEXT_PUBLIC_API_URL;

    // Agregamos un try/catch específico para el fetch por si el backend está caído
    let response;
    try {
      response = await fetch(`${backendUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
    } catch (fetchError) {
      console.error("Error conectando con el backend:", fetchError);
      return NextResponse.json({ success: false, message: 'El servicio de autenticación no responde' }, { status: 503 });
    }

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: data.message || 'Error al iniciar sesión' },
        { status: response.status }
      );
    }

    // Verificar datos
    if (!data.success || !data.value?.token) {
      return NextResponse.json(
        { success: false, message: 'Respuesta inválida del servidor' },
        { status: 500 }
      );
    }

    // --- GESTIÓN DE COOKIES ---
    const cookieStore = await cookies();
    cookieStore.delete('auth-token');
    const isProduction = process.env.NODE_ENV === 'production';

    cookieStore.set('auth-token', data.value.token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    });

    console.log(`[Login] Cookie establecida. Secure: ${isProduction}`);

    return NextResponse.json({
      success: true,
      message: 'Inicio de sesión exitoso',
      user: data.value.user,
    });

  } catch (error) {
    console.error('[Credentials Login] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}