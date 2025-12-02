"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { CheckCircle, AlertTriangle, Loader2 } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/hooks/useAuth"

export default function CheckInPage() {
  const params = useSearchParams()
  const assistanceId = params.get("assistanceId")

  const [status, setStatus] = useState("loading") 
  // "loading" | "success" | "error"
  const [message, setMessage] = useState("")

  const { user, loading } = useAuth()

  useEffect(() => {
    if (!assistanceId) {
        setStatus("error")
        setMessage("No se encontró el ID de asistencia en el QR.")
        return
    }

    if (loading) return;

    // Si ya cargó y no hay usuario → error real
    if (!user) {
        setStatus("error");
        setMessage("Debes iniciar sesión para continuar.");
        return;
    }

    if (user.role !== "admin" && user.role !== "presenter") {
        setStatus("error")
        setMessage("Solo ponentes o administradores pueden validar asistencia.")
        return
    }

    const doCheckIn = async () => {
        try {
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/assistance/checkin/${assistanceId}`,
            { method: "PATCH" }
        );

        const data = await res.json();

        if (!res.ok) {
            setStatus("error");
            setMessage(data.message || "Error al registrar asistencia.");
            return;
        }

        setStatus("success");
        } catch {
        setStatus("error");
        setMessage("Error de conexión al servidor.");
        }
    };

    doCheckIn();
    }, [assistanceId, user]);

  return (
    <div
      className="min-h-screen flex items-center justify-center px-6"
      style={{
        background: "linear-gradient(180deg, #1B293A 0%, #040711 100%)",
      }}
    >
      <div className="max-w-md w-full bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8 shadow-xl text-center">

        {/* LOADING */}
        {status === "loading" && (
          <>
            <Loader2 className="w-16 h-16 text-blue-400 mx-auto animate-spin" />
            <h1 className="text-2xl font-bold text-white mt-6">
              Validando asistencia...
            </h1>
            <p className="text-gray-300 mt-3">
              Por favor espera un momento.
            </p>
          </>
        )}

        {/* SUCCESS */}
        {status === "success" && (
          <>
            <CheckCircle className="w-20 h-20 text-green-400 mx-auto" />
            <h1 className="text-3xl font-bold text-white mt-6">
              ¡Asistencia Registrada!
            </h1>
            <p className="text-gray-300 mt-3">
              El check-in se completó exitosamente.
            </p>
            <Link
              href="/"
              className="mt-8 inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 transition rounded-xl text-white font-semibold"
            >
              Volver al inicio
            </Link>
          </>
        )}

        {/* ERROR */}
        {status === "error" && (
          <>
            <AlertTriangle className="w-20 h-20 text-red-400 mx-auto animate-pulse" />
            <h1 className="text-3xl font-bold text-white mt-6">
              Error en el Check-In
            </h1>
            <p className="text-gray-300 mt-3">
              {message}
            </p>
            <Link
              href="/"
              className="mt-8 inline-block px-6 py-3 bg-red-600 hover:bg-red-700 transition rounded-xl text-white font-semibold"
            >
              Volver al inicio
            </Link>
          </>
        )}
      </div>
    </div>
  )
}
