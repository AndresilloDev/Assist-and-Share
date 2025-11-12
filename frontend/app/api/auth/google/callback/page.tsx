"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function GoogleCallbackLogic() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  useEffect(() => {
    console.log("[Google Callback] Iniciando procesamiento...");
    
    const token = searchParams.get("token");
    const error = searchParams.get("error");
    
    // Si hay error, redirigir a login con el error
    if (error) {
      console.error("[Google Callback] Error recibido:", error);
      router.push(`/login?error=${error}`);
      return;
    }
    
    // Si hay token, guardarlo y redirigir
    if (token) {
      console.log("[Google Callback] Token recibido, guardando...");
      
      // Guardar en cookie (Es la que usa el proxy / middleware)
      document.cookie = `auth-token=${token}; path=/; max-age=${60 * 60 * 24 * 30}; samesite=lax`;
      
      console.log("[Google Callback] Cookie guardada, redirigiendo a /");
      
      // Pequeño delay para asegurar que la cookie se guardó
      setTimeout(() => {
        router.push("/");
      }, 100);
      
    } else {
      // No hay token ni error
      console.error("[Google Callback] No se recibió token ni error");
      router.push("/login?error=no_token");
    }
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mb-6" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Procesando inicio de sesión
        </h2>
        <p className="text-gray-600">
          Autenticando con Google...
        </p>
      </div>
    </div>
  );
}

export default function GoogleCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600" />
      </div>
    }>
      <GoogleCallbackLogic />
    </Suspense>
  );
}