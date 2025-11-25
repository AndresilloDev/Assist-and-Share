"use client";
//esta pajina no se deberia de ver nunca pero por si acaso
import { useRouter } from 'next/navigation';

export default function UnauthorizedPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(180deg, #1B293A 0%, #131517 75%)" }}>

      <div className="relative max-w-md w-full mx-4">
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl shadow-2xl p-8 text-center">
          <div className="mb-12">
            <h1 className="text-3xl text-white">Acceso Denegado</h1>
            <p className="text-gray-400 text-base">No tienes permisos para acceder a este recurso</p>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => router.push('/events')}
              className="w-full py-3 mb-2 bg-black/80 text-white rounded-2xl border border-white/10 flex items-center justify-center gap-3 cursor-pointer hover:bg-black/40 hover:rounded-3xl duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Volver al Inicio
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}