"use client"

import { useMemo } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { Computer, MapPin, User } from "lucide-react"

interface Event {
  _id: string
  title: string
  description: string
  capacity: number
  duration: number
  modality: "in-person" | "online" | "hybrid"
  date: string
  presenter: string
  location?: string
  link?: string
  requirements: string[]
  type: "workshop" | "conference" | "seminar"
  createdAt: string
  updatedAt: string
}

interface EventCardProps {
  event: Event
  presenterName: string
}

const EVENT_TYPE_LABELS: Record<string, string> = {
  workshop: "Taller",
  conference: "Conferencia",
  seminar: "Seminario",
}

const EVENT_TYPE_COLORS: Record<string, string> = {
  workshop: "bg-yellow-500/20 text-yellow-300 border border-yellow-500/20",
  conference: "bg-blue-500/20 text-blue-300 border border-blue-500/20",
  seminar: "bg-purple-500/20 text-purple-300 border border-purple-500/20",
}

export default function EventCard({ event, presenterName }: EventCardProps) {
  const { user } = useAuth()
  const router = useRouter()

  const buttonText = useMemo(() => {
    if (user && user.role === "presenter" && user.id === event.presenter) {
      return "Gestionar ponencia"
    }
    return "Ver Detalles"
  }, [user, event.presenter])

  const handleNavigate = () => router.push(`/event-details/${event._id}`)

  // --- LÓGICA DE TIEMPO ---
  const startMs = new Date(event.date).getTime()
  const endMs = startMs + (event.duration * 60 * 1000)
  const nowMs = Date.now()

  // Está en curso si: Ya empezó Y Aún no termina
  const isInProgress = nowMs >= startMs && nowMs < endMs

  return (
    <div
      className="group relative bg-gray-900 border border-gray-800 rounded-2xl p-4 md:p-6 transition-all duration-300 hover:border-gray-700 overflow-hidden"
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top
        e.currentTarget.style.setProperty("--mouse-x", `${x}px`)
        e.currentTarget.style.setProperty("--mouse-y", `${y}px`)
      }}
    >
      <div
        className="pointer-events-none absolute opacity-0 group-hover:opacity-100 transition-opacity duration-500 -inset-px rounded-2xl"
        style={{
          background: "radial-gradient(600px circle at var(--mouse-x) var(--mouse-y), rgba(59, 130, 246, 0.15), transparent 40%)",
        }}
      />

      <div className="relative z-10 flex flex-col md:flex-row gap-6">
        <div className="flex-grow space-y-3 order-2 md:order-1">

          {/* Hora (Limpio, sin label aquí) */}
          <div className="flex justify-between items-start">
            <p className="text-lg font-base">
              {new Date(event.date).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>

          {/* Título y Badges (AQUÍ ESTÁN LOS LABELS JUNTOS) */}
          <div className="flex items-start md:items-center gap-3 flex-col md:flex-row">
            <h3 className="text-xl font-semibold leading-tight">{event.title}</h3>

            {/* Contenedor de etiquetas para mantenerlas juntas */}
            <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">

              {/* Label de Tipo */}
              <span className={`px-3 py-1 rounded-md text-xs font-semibold ${EVENT_TYPE_COLORS[event.type]}`}>
                {EVENT_TYPE_LABELS[event.type]}
              </span>

              {/* Label de En Curso (Estilo idéntico + animación) */}
              {isInProgress && (
                <span className="px-3 py-1 rounded-md text-xs font-semibold bg-red-500/20 text-red-300 border border-red-500/20 flex items-center gap-1.5 animate-pulse">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                  </span>
                  En curso
                </span>
              )}
            </div>
          </div>

          {(event.location || event.modality === "online") && (
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-md bg-gray-800/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                {event.modality === "online" ? <Computer size={24} className="text-gray-400" /> : <MapPin size={24} className="text-gray-400" />}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-400">
                  {event.modality === "in-person" ? "Presencial" : event.modality === "online" ? "En línea" : "Híbrido"}
                </p>
                <p className="text-sm text-white">
                  {event.duration ? <span>{event.duration} minutos</span> : "En línea"}
                </p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-md bg-gray-800/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <User size={24} className="text-gray-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-400">Ponente</p>
              <p className="text-sm text-white">{presenterName}</p>
            </div>
          </div>
        </div>

        <div className="order-1 md:order-2 flex-shrink-0 w-full md:w-64 h-48 md:h-40 bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          <img
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS9VzbIhiRMB3MDNu1_rl05tug8QtXXRpKuUA&s"
            alt="Event preview"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      <div className="relative z-10 mt-6">
        <button
          className="w-full py-3 bg-white text-black rounded-xl font-medium hover:bg-gray-200 transition-all duration-300 hover:shadow-lg hover:shadow-white/20 hover:rounded-3xl cursor-pointer"
          onClick={handleNavigate}
        >
          {buttonText}
        </button>
      </div>
    </div>
  )
}