"use client"

import { CheckCircle } from "lucide-react"
import Link from "next/link"

export default function CheckInSuccess() {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-6"
      style={{
        background: "linear-gradient(180deg, #1B293A 0%, #040711 100%)",
      }}
    >
      <div className="max-w-md w-full bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8 shadow-xl text-center">

        <CheckCircle className="w-20 h-20 text-green-400 mx-auto" />

        <h1 className="text-3xl font-bold text-white mt-6">
          ¡Asistencia Registrada!
        </h1>

        <p className="text-gray-300 mt-3">
          Tu check-in se ha completado exitosamente.  
          Gracias por participar en este evento.
        </p>

        <Link
          href="/"
          className="mt-8 inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 transition rounded-xl text-white font-semibold"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  )
}