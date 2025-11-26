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
  attendees?: string[]
  createdAt: string
  updatedAt: string
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
  type: "pptx" | "xlsx" | "pdf" | "docx"
  uploadDate: string
  url: string
}

// --- Componente Principal ---

export default function EventDetail() {
  const params = useParams()
  const id = params.id as string
  const { user, loading: loadingAuth } = useAuth()

  // Estado de los datos
  const [event, setEvent] = useState<Event | null>(null)
  const [presenter, setPresenter] = useState<Presenter | null>(null)
  const [materials, setMaterials] = useState<Material[]>([])
  const [assistance, setAssistance] = useState<any>(null)

  const ACTIVE_STATUSES = ["pending", "approved"]
  const isPending = assistance?.status === "pending"
  const isApproved = assistance?.status === "approved"
  const isEnrolled = !!assistance && ACTIVE_STATUSES.includes(assistance.status)
  const isPastEvent = event ? new Date(event.date) < new Date() : false
  const isRejected = assistance?.status === "rejected"

  const getFileType = (url: string): Material["type"] | "image" => {
  if (url.match(/\.pdf$/i)) return "pdf"
  if (url.match(/\.(pptx|ppt)$/i)) return "pptx"
  if (url.match(/\.(xlsx|xls)$/i)) return "xlsx"
  if (url.match(/\.(docx|doc)$/i)) return "docx"
  if (url.match(/\.(jpg|jpeg|png|gif|webp)$/i)) return "image"
  return "docx" // fallback seguro
}


  // Estado de la UI (carga y errores)
  const [isLoadingEvent, setIsLoadingEvent] = useState(true)
  const [error, setError] = useState("")

  // Estado de Edición (Formulario)
  const [description, setDescription] = useState("")
  const [requirements, setRequirements] = useState("")
  const [hasChanges, setHasChanges] = useState(false)

  // Estado del modal de confirmación de cancelación
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)

  // --- Carga de Datos ---

  const fetchEvent = async () => {
    setIsLoadingEvent(true)
    setError("")
    try {
      const { data: eventData } = await api.get(`/events/${id}`)
      const currentEvent = eventData.value

      setEvent(currentEvent)
      setDescription(currentEvent.description || "")
      setRequirements(currentEvent.requirements?.join("\n") || "")

      if (currentEvent.presenter) {
        const { data: presenterData } = await api.get(
            `/users/${currentEvent.presenter}`
        )
        setPresenter(presenterData.value)
      }

// TODO: Esto debería venir de la API a futuro cracks
// Cargar materiales si vienen como arreglo de URLs
if (Array.isArray(currentEvent.materials)) {
  const formatted = currentEvent.materials.map((url: string, index: number) => {
    const fileName = url.split("/").pop() || `material_${index + 1}`;
    const fileType = getFileType(fileName);

    return {
      id: `${index + 1}`,
      name: fileName,
      type: fileType,
      uploadDate: new Date(currentEvent.updatedAt).toLocaleDateString("es-MX"),
      url
    };
  });

  setMaterials(formatted);
} else {
  setMaterials([]);
}

    } catch (err: any) {
      const errMsg = err.response?.data?.message || "Error al cargar el evento"
      setError(errMsg)
    } finally {
      setIsLoadingEvent(false)
    }
  }

  const fetchUserAssistance = async () => {
    if (!user) return

    const { data } = await api.get(`/assistance/user/${user.id}`)
    const found = data.value.find((a: any) => a.event?._id === id)
    console.log("Asistencia encontrada:", found)

    if (!found || found.status === "cancelled") {
      setAssistance(null)
    } else {
      setAssistance(found)
    }
  }

  useEffect(() => {
    if (!id || !user) return
    fetchEvent()
    fetchUserAssistance()
  }, [id, user])

  // --- Manejadores de Eventos (Handlers) ---

  const handleSaveChanges = async () => {
    try {
      await api.put(`/events/${id}`, {
        description,
        requirements: requirements
            .split("\n")
            .map((r) => r.trim())
            .filter((r) => r !== ""),
      })
      setHasChanges(false)
    } catch (err: any) {
      const errMsg = err.response?.data?.message || "Error al guardar cambios"
      setError(errMsg)
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

  const handleCancelClick = () => {
    setShowCancelModal(true)
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
      await fetchUserAssistance()
      setError(err.response?.data?.message || "Error al cancelar inscripción")
    } finally {
      setIsCancelling(false)
    }
  }

  const handleCloseModal = () => {
    if (!isCancelling) {
      setShowCancelModal(false)
    }
  }

  const handleRemoveMaterial = (materialId: string) => {
    setMaterials(materials.filter((m) => m.id !== materialId))
    setHasChanges(true)
  }

  const handleDescriptionChange = (value: string) => {
    setDescription(value)
    setHasChanges(true)
  }

  const handleRequirementsChange = (value: string) => {
    setRequirements(value)
    setHasChanges(true)
  }

  // --- Lógica de Renderizado ---

  const isLoading = loadingAuth || isLoadingEvent

  if (isLoading) {
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

  // --- TSX Principal ---

  return (
      <div className="min-h-screen text-white px-8 py-10" style={{ background: "linear-gradient(180deg, #1B293A 0%, #040711 10%)" }}>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <EventHeader imageUrl="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS9VzbIhiRMB3MDNu1_rl05tug8QtXXRpKuUA&s" />

            <div className="flex flex-col justify-between">
              <EventInfo
                  event={event}
                  presenterName={
                    presenter
                        ? `${presenter.first_name} ${presenter.last_name}`
                        : "No disponible"
                  }
              />

              <EventActions
                  user={user}
                  isAdmin={user?.role === "admin"}
                  isPresenter={user?.role === "presenter" && user?.id === event?.presenter}
                  isAttendee={user?.role === "attendee"}
                  changed={hasChanges}
                  eventId={event._id}
                  eventTitle={event.title}
                  assistanceId={assistance?._id}
                  onSaveChanges={handleSaveChanges}
                  onEnroll={handleEnroll}
                  onCancel={handleCancelClick}
                  isEnrolled={isEnrolled}
                  isPending={isPending}
                  isApproved={isApproved}
                  isRejected={isRejected}
                  isPastEvent={isPastEvent}
              />

            </div>
          </div>

          <EventDescription
              description={description}
              canEdit={user?.role === "presenter" && user?.id === event?.presenter}
              onChange={handleDescriptionChange}
          />

          <EventRequirements
              requirements={requirements}
              canEdit={user?.role === "presenter" && user?.id === event?.presenter}
              onChange={handleRequirementsChange}
          />

          <EventMaterials
              materials={materials}
              canEdit={user?.role === "presenter" && user?.id === event?.presenter}
              onRemove={handleRemoveMaterial}
          />

          {/* Modal de Confirmación */}
          <ConfirmationModal
              isOpen={showCancelModal}
              onClose={handleCloseModal}
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