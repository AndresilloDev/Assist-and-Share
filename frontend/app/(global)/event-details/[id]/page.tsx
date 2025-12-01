"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import api from "@/lib/api"

import LoadingSpinner from "@/app/components/(ui)/LoadingSpinner"
import ErrorDisplay from "@/app/components/(ui)/ErrorDisplay"
import ConfirmationModal from "@/app/components/(ui)/ConfirmationModal"
import EventHeader from "@/app/components/(global)/event-details/EventHeader"
import EventInfo from "@/app/components/(global)/event-details/EventInfo"
import EventActions from "@/app/components/(global)/event-details/EventActions"
import EventDescription from "@/app/components/(global)/event-details/EventDescription"
import EventRequirements from "@/app/components/(global)/event-details/EventRequirements"
import EventMaterials from "@/app/components/(global)/event-details/EventMaterials"

interface Event {
  _id: string
  title: string
  coverImage: string
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
  attendees?: string[]
  createdAt: string
  updatedAt: string
  materials?: string[]
}

interface Presenter {
  _id: string
  first_name: string
  last_name: string
  email: string
}

interface Material {
  id: string
  name: string
  type: "pptx" | "xlsx" | "pdf" | "docx" | "image"
  uploadDate: string
  url: string
}

export default function EventDetail() {
  const params = useParams()
  const id = params.id as string
  const { user, loading: loadingAuth } = useAuth()

  // Estado de los datos
  const [event, setEvent] = useState<Event | null>(null)
  const [presenter, setPresenter] = useState<Presenter | null>(null)
  const [materials, setMaterials] = useState<Material[]>([])
  const [assistance, setAssistance] = useState<any>(null)

  // Estado de la UI
  const [isLoadingEvent, setIsLoadingEvent] = useState(true)
  const [error, setError] = useState("")
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)

  // Estado de Edición
  const [description, setDescription] = useState("")
  const [requirements, setRequirements] = useState("")
  const [hasChanges, setHasChanges] = useState(false)

  // --- LÓGICA DE ESTADOS Y VALIDACIÓN (OPTIMIZADA) ---

  const getFileType = (url: string): Material["type"] => {
    if (url.match(/\.pdf$/i)) return "pdf"
    if (url.match(/\.(pptx|ppt)$/i)) return "pptx"
    if (url.match(/\.(xlsx|xls)$/i)) return "xlsx"
    if (url.match(/\.(docx|doc)$/i)) return "docx"
    if (url.match(/\.(jpg|jpeg|png|gif|webp)$/i)) return "image"
    return "docx"
  }

  // --- ARREGLO DEL ERROR DE FECHA Y CONSTANTES ---
  // Nota: Usamos .getTime() para que sea una comparación numérica válida
  const eventDateMs = event ? new Date(event.date).getTime() : 0
  const nowMs = Date.now()

  const statusLogic = {
    isPending: assistance?.status === "pending",
    isApproved: assistance?.status === "approved",
    isRejected: assistance?.status === "rejected",
    isAttended: assistance?.status === "attended",
    // Verifica si hay asistencia y si el estado es válido
    isEnrolled: !!assistance && ["pending", "approved"].includes(assistance.status),
    isPastEvent: event ? eventDateMs < nowMs : false,
    // Corrección específica que pediste:
    isEventFinished: event ? (eventDateMs + (event.duration * 60 * 1000)) < nowMs : false,
    hasChanges
  }

  // --- Carga de Datos ---

  const fetchEvent = async () => {
    setIsLoadingEvent(true)
    setError("")
    try {
      const { data: eventData } = await api.get(`/events/${id}`)
      const currentEvent = eventData.value
      console.log("Datos del Evento:", eventData);
      setEvent(currentEvent)

      // Cargar estados del formulario
      setDescription(currentEvent.description || "")
      setRequirements(currentEvent.requirements?.join("\n") || "")

      if (currentEvent.presenter) {
        const { data: presenterData } = await api.get(`/users/${currentEvent.presenter}`)
        setPresenter(presenterData.value)
      }

      if (Array.isArray(currentEvent.materials)) {
        const formatted = currentEvent.materials.map((url: string, index: number) => {
          const fileName = url.split("/").pop() || `material_${index + 1}`
          return {
            id: `${index + 1}`,
            name: fileName,
            type: getFileType(fileName),
            uploadDate: new Date(currentEvent.updatedAt).toLocaleDateString("es-MX"),
            url
          }
        })
        setMaterials(formatted)
      } else {
        setMaterials([])
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al cargar el evento")
    } finally {
      setIsLoadingEvent(false)
    }
  }

  const fetchUserAssistance = async () => {
    if (!user) return
    const { data } = await api.get(`/assistance/user/${user.id}`)
    const found = data.value.find((a: any) => a.event?._id === id)

    if (!found || found.status === "cancelled") {
      setAssistance(null)
    } else {
      setAssistance(found)
    }
    console.log("Datos de asistencia:", assistance);
  }

  useEffect(() => {
    if (!id || !user) return
    fetchEvent()
    fetchUserAssistance()
  }, [id, user])

  useEffect(() => {
    console.log("El estado de assistance cambió a:", assistance)
  }, [assistance])

  // --- Handlers ---

  const handleSaveChanges = async () => {
    try {
      await api.put(`/events/${id}`, {
        description,
        requirements: requirements.split("\n").map((r) => r.trim()).filter(Boolean),
      })
      setHasChanges(false)
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al guardar cambios")
    }
  }

  const handleEnroll = async () => {
    try {
      await api.post(`/assistance/${id}`)
      await fetchUserAssistance()
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al inscribirse")
    }
  }

  const handleConfirmCancel = async () => {
    if (!assistance) return
    setIsCancelling(true)
    try {
      await api.delete(`/assistance/${assistance._id}`)
      setShowCancelModal(false)
      setAssistance(null)
      await fetchUserAssistance()
      await fetchEvent()
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al cancelar inscripción")
      await fetchUserAssistance()
    } finally {
      setIsCancelling(false)
    }
  }

  // --- Render ---

  if (loadingAuth || isLoadingEvent) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <ErrorDisplay message={error} />
      </div>
    )
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <p className="text-white text-xl">Evento no encontrado</p>
      </div>
    )
  }

  const isPresenterUser = user?.role === "presenter" && user?.id === event?.presenter

  return (
    <div className="min-h-screen text-white px-8 py-10" style={{ background: "linear-gradient(180deg, #1B293A 0%, #040711 10%)" }}>
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <EventHeader imageUrl={event.coverImage} />

          <div className="flex flex-col justify-between">
            <EventInfo
              event={event}
              presenterName={presenter ? `${presenter.first_name} ${presenter.last_name}` : "No disponible"}
            />

            <EventActions
              user={user}
              eventData={{
                id: event._id,
                title: event.title,
                assistanceId: assistance?._id
              }}
              roles={{
                isAdmin: user?.role === "admin",
                isPresenter: isPresenterUser,
                isAttendee: user?.role === "attendee"
              }}
              status={statusLogic}
              actions={{
                onSaveChanges: handleSaveChanges,
                onEnroll: handleEnroll,
                onCancel: () => setShowCancelModal(true)
              }}
            />

          </div>
        </div>

        <EventDescription
          description={description}
          canEdit={isPresenterUser}
          onChange={(val) => { setDescription(val); setHasChanges(true); }}
        />

        <EventRequirements
          requirements={requirements}
          canEdit={isPresenterUser}
          onChange={(val) => { setRequirements(val); setHasChanges(true); }}
        />

        <EventMaterials
          materials={materials}
          canEdit={isPresenterUser}
          onRemove={(matId) => {
            setMaterials(materials.filter((m) => m.id !== matId))
            setHasChanges(true)
          }}
        />

        <ConfirmationModal
          isOpen={showCancelModal}
          onClose={() => !isCancelling && setShowCancelModal(false)}
          onConfirm={handleConfirmCancel}
          title="Cancelar inscripción"
          message="¿Estás seguro de que deseas cancelar tu inscripción a este evento? Esta acción no se puede deshacer."
          confirmText="Sí, cancelar"
          cancelText="No, mantener"
          variant="danger"
          isLoading={isCancelling}
        />
      </div>
    </div>
  )
}