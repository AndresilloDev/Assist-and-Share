"use client"

import { Calendar, MapPin, User, GraduationCap, Users } from 'lucide-react'
import InfoCard from "@/app/components/(ui)/InfoCard"

interface Event {
  _id: string
  title: string
  modality: "in-person" | "online" | "hybrid"
  date: string
  location?: string
  link?: string
  capacity: number
  attendees?: string[]  // Solo IDs de asistentes aprobados
  type: "workshop" | "conference" | "seminar"
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
  const dateFormatted = new Date(event.date).toLocaleDateString("es-MX", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  })

  const hourFormatted = new Date(event.date).toLocaleTimeString("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
  })

  // Contar solo aprobados
  const approvedCount = event.attendees?.length ?? 0

  return (
    <div className="space-y-6">

      <div className="flex items-center gap-3 flex-wrap">
        <h1 className="text-4xl font-bold leading-tight">{event.title}</h1>
        <span
          className={`px-3 py-1 rounded-md text-md font-semibold ${EVENT_TYPE_COLORS[event.type]}`}
        >
          {EVENT_TYPE_LABELS[event.type]}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4">

        <div className="space-y-3">

          <InfoCard
            icon={<Calendar className="text-blue-400 flex-shrink-0" size={20} />}
            label="Fecha y hora"
            text={`${dateFormatted} • ${hourFormatted}`}
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

          <InfoCard
            icon={<User className="text-blue-400 flex-shrink-0" size={20} />}
            label="Ponente"
            text={presenterName}
          />

        </div>

        <div className="space-y-3">

          <InfoCard
            icon={<GraduationCap className="text-blue-400 flex-shrink-0" size={20} />}
            label="Modalidad"
            text={Modalities[event.modality]}
          />

          
          <InfoCard
            icon={<Users className="text-blue-400 flex-shrink-0" size={20} />}
            label="Capacidad"
            text={`${event.capacity} Asistentes`}
          />
          

        </div>

      </div>
    </div>
  )
}
