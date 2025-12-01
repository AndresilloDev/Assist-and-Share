"use client"

import { Calendar, MapPin, User, GraduationCap, Users, Radio, Timer, Clock } from 'lucide-react'
import InfoCard from "@/app/components/(ui)/InfoCard"

interface Event {
  _id: string
  title: string
  modality: "in-person" | "online" | "hybrid"
  date: string
  location?: string
  link?: string
  capacity: number
  attendees?: string[]
  type: "workshop" | "conference" | "seminar"
  duration: number
}

interface EventInfoProps {
  event: Event
  presenterName: string
}

const EVENT_TYPE_LABELS: Record<string, string> = {
  workshop: "Taller",
  conference: "Conferencia",
  seminar: "Seminario",
}

const EVENT_TYPE_COLORS: Record<string, string> = {
  workshop: "bg-yellow-500/20 text-yellow-300",
  conference: "bg-blue-500/20 text-blue-300",
  seminar: "bg-purple-500/20 text-purple-300",
}

const Modalities: { [key: string]: string } = {
  'hybrid': 'Híbrido',
  'online': 'En línea',
  'in-person': 'Presencial',
}

export default function EventInfo({ event, presenterName }: EventInfoProps) {
  // --- LÓGICA DE TIEMPO ---
  const startDate = new Date(event.date)
  const startTimeMs = startDate.getTime()
  const durationMs = (event.duration || 0) * 60 * 1000
  const endTimeMs = startTimeMs + durationMs
  const nowMs = Date.now()


  const isInProgress = nowMs >= startTimeMs && nowMs < endTimeMs
  const isFinished = nowMs >= endTimeMs

  const dateFormatted = startDate.toLocaleDateString("es-MX", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  })

  const hourFormatted = startDate.toLocaleTimeString("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
  })

  return (
    <div className="space-y-6">

      <div className="flex items-center gap-3 flex-wrap">
        <h1 className="text-4xl font-bold leading-tight">{event.title}</h1>

        <span
          className={`px-3 py-1 rounded-md text-md font-semibold border border-transparent ${EVENT_TYPE_COLORS[event.type]}`}
        >
          {EVENT_TYPE_LABELS[event.type]}
        </span>

        {isInProgress && (
          <span className="flex items-center gap-2 px-3 py-1 rounded-md text-md font-semibold bg-red-500/10 text-red-400 border border-red-500/20 animate-pulse">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            En curso
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">

        <div className="space-y-3">
          <InfoCard
            icon={<Calendar className="text-blue-400 flex-shrink-0" size={20} />}
            label="Fecha"
            text={`${dateFormatted}`}
          />

          <InfoCard
            icon={<GraduationCap className="text-blue-400 flex-shrink-0" size={20} />}
            label="Modalidad"
            text={Modalities[event.modality]}
          />

          <InfoCard
            icon={<User className="text-blue-400 flex-shrink-0" size={20} />}
            label="Ponente"
            text={presenterName}
          />

          <InfoCard
            icon={<MapPin className="text-blue-400 flex-shrink-0" size={20} />}
            label={event.modality === "online" ? "Enlace" : "Ubicación"}
            text={
              event.modality === "online"
                ? event.link || "Enlace no especificado"
                : event.location || "Ubicación no especificada"
            }
          />
        </div>

        <div className="space-y-3">

          <InfoCard
            icon={<Clock className="text-blue-400 flex-shrink-0" size={20} />}
            label="Hora"
            text={`${hourFormatted}`}
          />



          <InfoCard
            icon={<Users className="text-blue-400 flex-shrink-0" size={20} />}
            label="Capacidad"
            text={`${event.capacity} Asistentes`}
          />

          <InfoCard
            icon={<Timer className="text-blue-400 flex-shrink-0" size={20} />}
            label="Duración"
            text={`${event.duration} minutos`}
          />

        </div>

      </div>
    </div>
  )
}