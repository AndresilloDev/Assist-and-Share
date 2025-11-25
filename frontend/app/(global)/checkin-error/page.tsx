"use client"

import { AlertTriangle } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"

export default function CheckInError() {
  const params = useSearchParams()
  const message = params.get("msg") || "Ha ocurrido un error inesperado."

  return (
    <div
      className="min-h-screen flex items-center justify-center px-6"
      style={{
        background: "linear-gradient(180deg, #1B293A 0%, #040711 100%)",
      }}
    >
      <div className="max-w-md w-full bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8 shadow-xl text-center">

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
      </div>
    </div>
  )
}