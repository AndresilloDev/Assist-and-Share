"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { AlertCircle, Ban, CheckCircle } from "lucide-react" // Agregué CheckCircle para el icono de éxito
import type { User } from "@/hooks/useAuth"
import QRModal from "@/app/components/(ui)/QRModal"

interface EventActionsProps {
  user: User | null
  isAdmin: boolean
  isPresenter: boolean
  isAttendee: boolean
  changed: boolean
  eventId: string
  eventTitle: string
  assistanceId?: string
  onSaveChanges: () => void
  onEnroll: () => void
  isEnrolled: boolean
  onCancel: () => void
  isPending: boolean
  isApproved: boolean
  isRejected: boolean
  isPastEvent: boolean
  isAttended: boolean // <--- NUEVA PROP
}

export default function EventActions({
  user,
  isAdmin,
  isPresenter,
  isAttendee,
  changed,
  eventId,
  eventTitle,
  assistanceId,
  onSaveChanges,
  onEnroll,
  isEnrolled,
  onCancel,
  isPending,
  isApproved,
  isRejected,
  isPastEvent,
  isAttended, // <--- RECIBIR PROP
}: EventActionsProps) {
  const router = useRouter()
  const [isQRModalOpen, setIsQRModalOpen] = useState(false)

  if (!user) return null

  return (
    <div className="mt-6">
      {/* --- ADMIN ACTIONS --- */}
      {isAdmin && (
        <div className="flex gap-4">
          <button
            onClick={() => router.push(`/event-edit/${eventId}`)}
            className="flex-1 py-3 bg-white hover:bg-white/90 text-black rounded-xl font-semibold transition-all duration-300 cursor-pointer hover:rounded-3xl"
          >
            Editar
          </button>
          <button
            onClick={() => router.push(`/attendees/${eventId}`)}
            className="flex-1 py-3 bg-white hover:bg-white/90 text-black rounded-xl font-semibold transition-all duration-300 cursor-pointer hover:rounded-3xl"
          >
            Gestionar asistentes
          </button>
        </div>
      )}

      {/* --- PRESENTER ACTIONS --- */}
      {isPresenter && (
        <div className="flex gap-4">
          <button
            disabled={!changed}
            onClick={onSaveChanges}
            className={`flex-1 py-3 rounded-xl font-semibold transition-all duration-300 ${changed
              ? "bg-white text-black hover:bg-gray-200 hover:shadow-lg hover:shadow-white/20 hover:rounded-3xl duration-300 cursor-pointer"
              : "bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700"
              }`}
          >
            Guardar cambios
          </button>

          <button
            onClick={() => router.push(`/attendees/${eventId}`)}
            className="flex-1 py-3 bg-white hover:bg-white/90 text-black rounded-xl font-semibold transition-all duration-300 cursor-pointer hover:rounded-3xl"
          >
            Gestionar asistentes
          </button>
        </div>
      )}

      {/* --- ATTENDEE ACTIONS --- */}
      {isAttendee && (
        <div className="flex flex-col gap-3">

          {/* ESTADO: ASISTIÓ (NUEVO BLOQUE PRIORITARIO) */}
          {isAttended && (
            <>
              <div className="flex flex-col">
                <p className="text-green-400 text-sm font-medium my-2 flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  Ya asististe a este evento.
                </p>
                <button
                  // Ajusta la ruta a donde tengas tu página de feedback
                  onClick={() => router.push(`/feedback/${eventId}`)}
                  className="flex-1 py-3 bg-white hover:bg-white/90 text-black rounded-xl font-semibold transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 hover:rounded-3xl"
                >
                  Enviar retroalimentación
                </button>
              </div>


            </>
          )}

          {/* ESTADO: NO INSCRITO (Nuevo o Rechazado) Y NO ASISTIÓ */}
          {/* Solo mostramos el botón de Inscribirse si NO está inscrito Y NO ha asistido */}
          {!isEnrolled && !isAttended && !isPastEvent && (
            <>
              {/* Label de Rechazado */}
              {isRejected && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium animate-in fade-in slide-in-from-bottom-2">
                  <AlertCircle size={18} />
                  <span>Tu solicitud para este evento ha sido rechazada.</span>
                </div>
              )}

              {/* Botón Inscribirse */}
              <button
                onClick={onEnroll}
                disabled={isRejected}
                className={`flex-1 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2
                  ${isRejected
                    ? "bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700 opacity-70"
                    : "bg-white hover:bg-white/90 text-black rounded-xl font-semibold transition-all duration-300 cursor-pointer"
                  }`}
              >
                {isRejected && <Ban size={18} />}
                Inscribirse
              </button>
            </>
          )}

          {/* ESTADO: PENDIENTE */}
          {isPending && !isPastEvent && (
            <div className="flex flex-col">
              <p className="text-yellow-400 text-sm font-medium my-2 flex items-center gap-2">
                <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                Tu solicitud está pendiente de aprobación.
              </p>
              <button
                onClick={onCancel}
                className="flex-1 py-3 bg-white hover:bg-white/90 text-black rounded-xl font-semibold transition-all duration-300 cursor-pointer hover:rounded-3xl"
              >
                Cancelar inscripción
              </button>
            </div>
          )}

          {/* ESTADO: APROBADO */}
          {isApproved && !isPastEvent && (
            <>
              <div className="flex gap-4">
                <button
                  onClick={onCancel}
                  className="flex-1 py-3 bg-gray-800 text-white border border-gray-700 rounded-xl font-semibold transition-all duration-300 cursor-pointer hover:bg-gray-700"
                >
                  Cancelar inscripción
                </button>
                <button
                  onClick={() => setIsQRModalOpen(true)}
                  className="flex-1 py-3 bg-white hover:bg-white/90 text-black rounded-xl font-semibold transition-all duration-300 cursor-pointer hover:rounded-3xl shadow-lg hover:shadow-green-500/20"
                >
                  Ver QR
                </button>
              </div>

              {assistanceId && (
                <QRModal
                  isOpen={isQRModalOpen}
                  onClose={() => setIsQRModalOpen(false)}
                  qrUrl={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
                    `${process.env.NEXT_PUBLIC_API_URL}/assistance/checkin/${assistanceId}`
                  )}`}
                  title={eventTitle}
                />
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}