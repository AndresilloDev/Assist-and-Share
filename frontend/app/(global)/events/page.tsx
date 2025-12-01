"use client"

import { useState, useEffect, useMemo } from "react"
import { useAuth } from "@/hooks/useAuth"
import api from "@/lib/api"
import Link from "next/link"
import { Plus } from "lucide-react"

import AnimatedSwitch from "@/app/components/(ui)/AnimatedSwitch"
import EventFilterBar from "@/app/components/(global)/events/EventFilterBar"
import EventCard from "@/app/components/(global)/events/EventCard"
import LoadingSpinner from "@/app/components/(ui)/LoadingSpinner"
import ErrorDisplay from "@/app/components/(ui)/ErrorDisplay"

// --- Definición de Interfaces ---

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

interface Presenter {
  _id: string
  first_name: string
  last_name: string
  email: string
}

interface AttendanceStatus {
  eventId: string
  status: "registered" | "attended" | "absent"
}

// --- Componente Principal ---

export default function EventsPage() {
  const { user } = useAuth()

  // Estado de los datos
  const [events, setEvents] = useState<Event[]>([])
  const [presenters, setPresenters] = useState<Presenter[]>([])
  const [attendanceStatuses, setAttendanceStatuses] = useState<Map<string, string>>(new Map())

  // Estado de la UI (carga y errores)
  const [isLoadingEvents, setIsLoadingEvents] = useState(true)
  const [isLoadingPresenters, setIsLoadingPresenters] = useState(true)
  const [isLoadingAttendance, setIsLoadingAttendance] = useState(false)
  const [error, setError] = useState("")

  // Estado de los filtros
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [dateFilter, setDateFilter] = useState<string>("upcoming")
  const [presenterFilter, setPresenterFilter] = useState<string>("all")

  // --- Carga de Datos ---

  const fetchPresenters = async () => {
    setIsLoadingPresenters(true)
    try {
      const { data: presentersData } = await api.get("/users", {
        params: { role: "presenter" },
      })
      setPresenters(presentersData.value.results)
    } catch (err: any) {
      const errMsg = err.response?.data?.message || "Error al cargar presentadores"
      setError(errMsg)
      console.error("Error fetching presenters:", err)
    } finally {
      setIsLoadingPresenters(false)
    }
  }

  useEffect(() => {
    fetchPresenters()
  }, [])

  // Función para obtener todas las asistencias del usuario actual
  const fetchUserAttendances = async () => {
    if (!user?.id) return new Map()

    try {
      const { data } = await api.get(`/assistance/user/${user.id}`)
      const statusMap = new Map<string, string>()

      // Mapear cada asistencia por el ID del evento
      data.value?.forEach((assistance: any) => {
        // Si el evento fue borrado, assistance.event puede ser null.
        // Si es null, simplemente saltamos este registro.
        if (!assistance.event) return;

        const eventId = typeof assistance.event === 'string'
          ? assistance.event
          : assistance.event._id

        if (eventId) {
          statusMap.set(eventId, assistance.status)
        }
      })

      return statusMap
    } catch (err) {
      console.error("Error fetching user attendances:", err)
      return new Map()
    }
  }

  const fetchEvents = async () => {
    setIsLoadingEvents(true)
    if (!isLoadingPresenters) setError("")

    try {
      const params: any = {}
      if (typeFilter !== "all") params.type = typeFilter
      if (presenterFilter !== "all") params.presenter = presenterFilter

      const now = new Date()
      const nowMs = now.getTime()

      if (dateFilter === "upcoming") {
        const bufferTime = new Date(nowMs - (24 * 60 * 60 * 1000))
        params["date[gte]"] = bufferTime.toISOString()
      } else if (dateFilter === "past") {
        params["date[lt]"] = now.toISOString()
      }

      params.sort = "date"

      const { data: eventsData } = await api.get("/events", { params })
      const rawEvents: Event[] = eventsData.value.results

      const filteredEvents = rawEvents.filter(event => {
        const startMs = new Date(event.date).getTime()
        const endMs = startMs + (event.duration * 60 * 1000)

        if (dateFilter === "upcoming") {
          // Es próximo si AÚN NO TERMINA (Fin > Ahora)
          // Esto incluye: Futuros Y En Curso
          return endMs > nowMs
        } else {
          // Es pasado solo si YA TERMINÓ (Fin <= Ahora)
          return endMs <= nowMs
        }
      })

      setEvents(filteredEvents)

      // Lógica de asistencias
      if (dateFilter === "past" && user?.role === "attendee") {
        setIsLoadingAttendance(true)
        const statusMap = await fetchUserAttendances()
        setAttendanceStatuses(statusMap)
        setIsLoadingAttendance(false)
      } else {
        setAttendanceStatuses(new Map())
      }

    } catch (err: any) {
      const errMsg = err.response?.data?.message || "Error al cargar eventos"
      setError(errMsg)
    } finally {
      setIsLoadingEvents(false)
    }
  }

  useEffect(() => {
    fetchEvents()
  }, [typeFilter, dateFilter, presenterFilter, user])

  // --- Helpers Optimizados ---

  const presenterMap = useMemo(() => {
    const map = new Map<string, string>()
    presenters.forEach((p) => {
      map.set(p._id, `${p.first_name} ${p.last_name}`)
    })
    return map
  }, [presenters])

  const getPresenterName = (presenterId: string) => {
    return presenterMap.get(presenterId) || "Presentador desconocido"
  }

  const groupedEvents = useMemo(() => {
    const grouped: Record<string, Event[]> = {}
    events.forEach((event) => {
      const date = new Date(event.date)
      const dateKey = date.toISOString().split("T")[0]

      if (!grouped[dateKey]) {
        grouped[dateKey] = []
      }
      grouped[dateKey].push(event)
    })
    return grouped
  }, [events])



  // --- Renderizado ---

  const isLoading = isLoadingEvents || isLoadingPresenters
  const pageTitle = user?.role === "presenter" ? "Ponencias" : "Eventos"

  return (
    <div className="min-h-screen text-white p-4 md:p-8" style={{ background: "linear-gradient(180deg, #1B293A 0%, #040711 10%)" }}>
      <div className="max-w-7xl mx-auto">

        {/* Header Responsive: Columna en móvil, Fila en desktop */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-0 mb-8 md:mb-12">
          <div className="flex flex-col md:flex-row md:items-center gap-4 w-full md:w-auto">
            <h1 className="text-3xl md:text-5xl font-bold">{pageTitle}</h1>
          </div>

          <div className="w-full md:w-auto">
            <AnimatedSwitch
              value={dateFilter}
              onChange={setDateFilter}
              options={[
                { value: "upcoming", label: "Próximos" },
                { value: "past", label: "Finalizados" },
              ]}
            />
          </div>
        </div>

        <EventFilterBar
          typeFilter={typeFilter}
          onTypeChange={setTypeFilter}
          presenterFilter={presenterFilter}
          onPresenterChange={setPresenterFilter}
          presenters={presenters}
        />

        {error && <ErrorDisplay message={error} />}

        {isLoading && <LoadingSpinner />}

        {!isLoading && Object.keys(groupedEvents).length === 0 && (
          <div className="text-center py-12 text-gray-400">No se encontraron eventos</div>
        )}

        {isLoadingAttendance && (
          <div className="text-center py-4 text-gray-400">
            Verificando asistencias...
          </div>
        )}

        {!isLoading && !error && (
          <div className="space-y-8 md:space-y-0">
            {Object.entries(groupedEvents).map(([dateKey, dateEvents], groupIndex) => {
              const groupDate = new Date(dateKey + 'T00:00:00');

              const dayNum = groupDate.toLocaleDateString("es-MX", { day: "numeric" });
              const month = groupDate.toLocaleDateString("es-MX", { month: "long" }).replace(/^\w/, c => c.toUpperCase());
              const weekday = groupDate.toLocaleDateString("es-MX", { weekday: "long" });

              return (
                <div key={dateKey} className="relative flex flex-col md:flex-row">

                  {/* --- VERSIÓN MÓVIL: Encabezado de fecha --- */}
                  <div className="md:hidden pb-4 mb-2 border-b border-gray-800">
                    <p className="text-xl font-bold text-white">
                      {dayNum} de {month} <span className="text-gray-500 font-normal text-base capitalize">({weekday})</span>
                    </p>
                  </div>

                  {/* --- VERSIÓN DESKTOP: Columna Izquierda - Fecha --- */}
                  <div className="hidden md:block flex-shrink-0 w-48 pr-8 pt-2">
                    <div className="text-left">
                      <p className="text-xl font-semibold">
                        {month} {dayNum}
                      </p>
                      <p className="text-sm text-gray-500 capitalize">
                        {weekday}
                      </p>
                    </div>
                  </div>

                  {/* --- VERSIÓN DESKTOP: Línea vertical --- */}
                  <div className="hidden md:flex relative flex-shrink-0 w-8 flex-col items-center">
                    <div className="w-3 h-3 rounded-full bg-gray-600 mt-3 z-10"></div>
                    {groupIndex < Object.keys(groupedEvents).length - 1 && (
                      <div className="absolute top-3 bottom-0 left-1/2 -translate-x-1/2 w-px border-l-2 border-dashed border-gray-800"></div>
                    )}
                  </div>

                  {/* --- CONTENIDO: Lista de Eventos --- */}
                  <div className="flex-grow md:pl-8 md:pb-8 space-y-6">
                    {dateEvents.map((event) => (
                      <EventCard
                        key={event._id}
                        event={event}
                        presenterName={getPresenterName(event.presenter)}
                      />
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}