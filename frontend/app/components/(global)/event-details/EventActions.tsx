"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { AlertCircle, Ban } from "lucide-react"
import type { User } from "@/hooks/useAuth"
import QRModal from "@/app/components/(ui)/QRModal"

interface EventActionsProps {
  user: User | null
  // Agrupamos datos del evento para limpiar
  eventData: {
    id: string
    title: string
    assistanceId?: string
  }
  // Roles
  roles: {
    isAdmin: boolean
    isPresenter: boolean
    isAttendee: boolean
  }
  // Estado lógico agrupado
  status: {
    isEnrolled: boolean
    isPending: boolean
    isApproved: boolean
    isRejected: boolean
    isPastEvent: boolean
    isEventFinished: boolean
    isAttended: boolean
    hasChanges: boolean // Para el presenter
  }
  // Acciones agrupadas
  actions: {
    onSaveChanges: () => void
    onEnroll: () => void
    onCancel: () => void
  }
}

export default function EventActions({
  user,
  eventData,
  roles,
  status,
  actions,
}: EventActionsProps) {
  const router = useRouter()
  const [isQRModalOpen, setIsQRModalOpen] = useState(false)

  // Desestructuramos para no cambiar tu JSX original y mantenerlo limpio
  const { isAdmin, isPresenter, isAttendee } = roles
  const { isEnrolled, isPending, isApproved, isRejected, isPastEvent, isEventFinished, isAttended, hasChanges } = status
  const { onSaveChanges, onEnroll, onCancel } = actions

  if (!user) return null

  return (
    console.log(status),
    <div className="mt-6">
      {/* --- ADMIN ACTIONS --- */}
      {isAdmin && (
        <div className="flex gap-4">
          <button
            onClick={() => router.push(`/event-edit/${eventData.id}`)}
            className="flex-1 py-3 bg-white hover:bg-white/90 text-black rounded-xl font-base transition-all duration-300 cursor-pointer hover:rounded-3xl"
          >
            Editar
          </button>
          <button
            onClick={() => router.push(`/attendees/${eventData.id}`)}
            className="flex-1 py-3 bg-white hover:bg-white/90 text-black rounded-xl font-base transition-all duration-300 cursor-pointer hover:rounded-3xl"
          >
            Gestionar asistentes
          </button>
        </div>
      )}

      {/* --- PRESENTER ACTIONS --- */}
      {isPresenter && (
        <div className="flex gap-4">
          <button
            disabled={!hasChanges}
            onClick={onSaveChanges}
            className={`flex-1 py-3 rounded-xl font-base transition-all duration-300 ${hasChanges
              ? "bg-white text-black hover:bg-gray-200 hover:shadow-lg hover:shadow-white/20 hover:rounded-3xl duration-300 cursor-pointer"
              : "bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700"
              }`}
          >
            Guardar cambios
          </button>

          <button
            onClick={() => router.push(`/attendees/${eventData.id}`)}
            className="flex-1 py-3 bg-white hover:bg-white/90 text-black rounded-xl font-base transition-all duration-300 cursor-pointer hover:rounded-3xl"
          >
            Gestionar asistentes
          </button>
        </div>
      )}

      {/* --- ATTENDEE ACTIONS --- */}
      {isAttendee && (
        <div className="flex flex-col gap-3">

          {/* ESTADO: ASISTIÓ Y AUN NO TERMINÓ EL EVENTO */}
          {isAttended && !isEventFinished && (
            <div className="flex flex-col">
              <p className="text-green-400 text-sm font-medium my-2 flex items-center gap-2">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                Ya asististe a este evento, al finalizar el evento podrás enviar tu retroalimentación.
              </p>
            </div>
          )}

          {/* ESTADO: ASISTIÓ Y EL EVENTO TERMINÓ */}
          {isAttended && isEventFinished && (
            <div className="flex flex-col">
              <p className="text-green-400 text-sm font-medium my-2 flex items-center gap-2">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                Ya asististe a este evento, puedes enviar tu retroalimentación.
              </p>
              <button
                onClick={() => router.push(`/send-feedback/${eventData.id}`)}
                className="flex-1 py-3 bg-white hover:bg-white/90 text-black rounded-xl font-base transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 hover:rounded-3xl"
              >
                Enviar retroalimentación
              </button>
            </div>
          )}

          {/* ESTADO: NO INSCRITO (Nuevo o Rechazado) Y NO ASISTIÓ */}
          {!isEnrolled && !isAttended && !isEventFinished && (
            <>
              {isRejected && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium animate-in fade-in slide-in-from-bottom-2">
                  <AlertCircle size={18} />
                  <span>Tu solicitud para este evento ha sido rechazada.</span>
                </div>
              )}

              <button
                onClick={onEnroll}
                disabled={isRejected}
                className={`flex-1 py-3 rounded-xl font-base transition-all duration-300 flex items-center justify-center gap-2
                  ${isRejected
                    ? "bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700 opacity-70"
                    : "bg-white hover:bg-white/90 text-black rounded-xl font-base transition-all duration-300 cursor-pointer"
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
                className="flex-1 py-3 bg-white hover:bg-white/90 text-black rounded-xl font-base transition-all duration-300 cursor-pointer hover:rounded-3xl"
              >
                Cancelar inscripción
              </button>
            </div>
          )}

          {/* ESTADO: APROBADO */}
          {isApproved && !isEventFinished && (
            <>
              <div className="flex gap-4">
                <button
                  onClick={onCancel}
                  className="flex-1 py-3 bg-gray-800 text-white border border-gray-700 rounded-xl font-base transition-all duration-300 cursor-pointer hover:bg-gray-700"
                >
                  Cancelar inscripción
                </button>
                <button
                  onClick={() => setIsQRModalOpen(true)}
                  className="flex-1 py-3 bg-white hover:bg-white/90 text-black rounded-xl font-base transition-all duration-300 cursor-pointer hover:rounded-3xl shadow-lg hover:shadow-green-500/20"
                >
                  Ver QR
                </button>
              </div>

              {eventData.assistanceId && (
                <QRModal
                  isOpen={isQRModalOpen}
                  onClose={() => setIsQRModalOpen(false)}
                  qrUrl={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
                    `${process.env.NEXT_PUBLIC_FRONTEND_URL}/checkin?assistanceId=${eventData.assistanceId}`
                  )}`}
                  title={eventData.title}
                />
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}