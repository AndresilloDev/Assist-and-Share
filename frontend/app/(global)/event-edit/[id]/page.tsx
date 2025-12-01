"use client"

import { useState, useEffect, ChangeEvent } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import api from "@/lib/api"

import LoadingSpinner from "@/app/components/(ui)/LoadingSpinner"
import ErrorDisplay from "@/app/components/(ui)/ErrorDisplay"
import ConfirmationModal from "@/app/components/(ui)/ConfirmationModal"

// --- Componentes Reutilizables ---
import EventBasicInfo from "@/app/components/(global)/create-event/EventBasicInfo"
import EventLogistics from "@/app/components/(global)/create-event/EventLogistics"
import EventRequirements from "@/app/components/(global)/create-event/EventRequirements"
import EventMaterials from "@/app/components/(global)/create-event/EventMaterials"
// CAMBIO: Importamos el componente de Solo Lectura
import EventFeedbackReadOnly from "@/app/components/(global)/create-event/EventFeedbackReadOnly"
import EventCoverImage from "@/app/components/(global)/create-event/EventCoverImage"

import {
    EventFormData,
    Presenter,
    MaterialItem,
    QuizQuestion
} from "@/app/components/(global)/create-event/types"

// Textos para comparación
const GENERIC_QUESTIONS_TEXTS = [
    "¿Qué tan satisfecho estás con el contenido presentado?",
    "¿Cómo calificarías la calidad de la presentación?",
    "¿El presentador demostró dominio del tema?",
    "¿Las instalaciones y logística fueron adecuadas?",
    "¿Recomendarías este evento a otras personas?"
]

const GENERIC_QUESTIONS_DATA = GENERIC_QUESTIONS_TEXTS.map((text, index) => ({
    text,
    order: index + 1
}))

function getMinDateTime(): string {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    const hours = String(now.getHours()).padStart(2, '0')
    const minutes = String(now.getMinutes()).padStart(2, '0')
    return `${year}-${month}-${day}T${hours}:${minutes}`
}

export default function EditEventPage() {
    const params = useParams()
    const eventId = params.id as string
    const router = useRouter()
    const { user } = useAuth()

    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)

    const [error, setError] = useState("")
    const [dateError, setDateError] = useState("")
    // Eliminamos quizError ya que no validaremos el quiz al editar

    const [presenters, setPresenters] = useState<Presenter[]>([])
    const [minDateTime] = useState(getMinDateTime())

    const [formData, setFormData] = useState<EventFormData>({
        title: "",
        coverImage: "",
        description: "",
        capacity: 0,
        duration: 60,
        modality: "in-person",
        date: "",
        presenter: "",
        location: "",
        link: "",
        requirements: [],
        type: "conference",
        materials: []
    })

    const [materials, setMaterials] = useState<MaterialItem[]>([])

    // Estado de la encuesta (Solo para visualizar)
    const [useGenericQuiz, setUseGenericQuiz] = useState(true)
    const [dynamicQuestions, setDynamicQuestions] = useState<QuizQuestion[]>([])

    // --- Carga Inicial ---
    useEffect(() => {
        const initData = async () => {
            try {
                // 1. Presentadores
                const presentersReq = await api.get("/users", { params: { role: "presenter" } })
                setPresenters(presentersReq.data.value.results)

                // 2. Evento
                const eventReq = await api.get(`/events/${eventId}`)
                const event = eventReq.data.value

                const dateObj = new Date(event.date)
                const offset = dateObj.getTimezoneOffset()
                const localDate = new Date(dateObj.getTime() - (offset * 60 * 1000))
                const formattedDate = localDate.toISOString().slice(0, 16)

                setFormData({
                    title: event.title,
                    coverImage: event.coverImage || "",
                    description: event.description || "",
                    capacity: event.capacity || 0,
                    duration: event.duration,
                    modality: event.modality,
                    date: formattedDate,
                    presenter: event.presenter,
                    location: event.location || "",
                    link: event.link || "",
                    requirements: event.requirements || [],
                    type: event.type,
                    materials: event.materials || []
                })

                if (event.materials && Array.isArray(event.materials)) {
                    const formattedMaterials = event.materials.map((url: string) => ({
                        name: url.split('/').pop() || "Archivo adjunto",
                        size: "unknown",
                        url: url
                    }))
                    setMaterials(formattedMaterials)
                }

                // 3. Cargar Encuesta (Solo para mostrar)
                try {
                    const surveyReq = await api.get(`/surveys/${eventId}`)
                    const survey = surveyReq.data.value

                    if (survey) {
                        const currentQuestions = survey.questions || []

                        // Detectar si es genérica
                        const isGeneric = currentQuestions.length === GENERIC_QUESTIONS_DATA.length &&
                            currentQuestions.every((q: any, i: number) => q.text === GENERIC_QUESTIONS_TEXTS[i])

                        setUseGenericQuiz(isGeneric)

                        // Mapear solo para visualización
                        const mappedQuestions = currentQuestions.map((q: any, idx: number) => ({
                            text: q.text,
                            order: q.order,
                            tempId: idx
                        }))
                        setDynamicQuestions(mappedQuestions)
                    }
                } catch (surveyErr) {
                    console.log("No se cargó encuesta (puede no existir aún), mostrando default.")
                    setDynamicQuestions(GENERIC_QUESTIONS_DATA.map((q, i) => ({ ...q, tempId: i })))
                }

            } catch (err: any) {
                console.error(err)
                setError("Error al cargar los datos del evento.")
            } finally {
                setIsLoading(false)
            }
        }

        if (eventId) initData()
    }, [eventId])


    // --- Handlers (Sin cambios) ---
    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        if (name === 'date') {
            const selectedDate = new Date(value)
            const currentDate = new Date()
            if (selectedDate < currentDate) {
                setDateError("Advertencia: Estás seleccionando una fecha pasada.")
            } else {
                setDateError("")
            }
        }
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSelectChange = (field: keyof EventFormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    const handleAddRequirement = (req: string) => {
        setFormData(prev => ({ ...prev, requirements: [...prev.requirements, req] }))
    }

    const handleRemoveRequirement = (index: number) => {
        setFormData(prev => ({ ...prev, requirements: prev.requirements.filter((_, i) => i !== index) }))
    }

    const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return
        const file = e.target.files[0]

        setIsSaving(true)
        const formDataToSend = new FormData()
        formDataToSend.append("file", file)

        try {
            const uploadRes = await api.post("/uploads/material", formDataToSend, {
                headers: { "Content-Type": "multipart/form-data" }
            })

            setMaterials(prev => [...prev, {
                name: file.name,
                size: `${(file.size / 1024).toFixed(1)} KB`,
                url: uploadRes.data.secure_url
            }])
        } catch (err) {
            console.error(err)
            setError("Error al subir archivo.")
        } finally {
            setIsSaving(false)
        }
    }

    const handleRemoveMaterial = (index: number) => {
        setMaterials(prev => prev.filter((_, i) => i !== index))
    }

    // --- Save Logic (Simplificada) ---
    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSaving(true)
        setError("")

        try {
            await api.put(`/events/${eventId}`, {
                ...formData,
                date: new Date(formData.date).toISOString(),
                materials: materials.map(m => m.url)
            })

            router.push(`/event-details/${eventId}`)

        } catch (err: any) {
            console.error(err)
            setError(err.response?.data?.message || "Error al actualizar el evento")
            setIsSaving(false)
        }
    }

    const handleConfirmDelete = async () => {
        setIsDeleting(true)
        try {
            await api.delete(`/events/${eventId}`)
            router.push("/events")
        } catch (err: any) {
            console.error(err)
            setError(err.response?.data?.message || "Error al eliminar el evento")
            setIsDeleting(false)
            setShowDeleteModal(false)
        }
    }

    if (isLoading) return <div className="min-h-screen bg-gray-950 flex items-center justify-center"><LoadingSpinner /></div>

    return (
        <div className="min-h-screen text-white p-4 md:p-8" style={{ background: "linear-gradient(180deg, #1B293A 0%, #040711 10%)" }}>
            <div className="max-w-5xl mx-auto pb-20 md:pb-0">

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 border-b border-gray-800 pb-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-3xl md:text-5xl font-bold">Editar Evento</h1>
                        </div>
                    </div>
                </div>

                {error && <ErrorDisplay message={error} />}

                <form onSubmit={handleSave} className="space-y-8">

                    <EventCoverImage
                        imageUrl={formData.coverImage || ""}
                        onChange={(url) => setFormData(prev => ({ ...prev, coverImage: url }))}
                    />

                    <EventBasicInfo
                        formData={formData}
                        handleChange={handleChange}
                        handleSelectChange={handleSelectChange}
                        presenters={presenters}
                    />

                    <EventLogistics
                        formData={formData}
                        handleChange={handleChange}
                        handleSelectChange={handleSelectChange}
                        minDateTime={minDateTime}
                        dateError={dateError}
                    />

                    <EventRequirements
                        requirements={formData.requirements}
                        onAddRequirement={handleAddRequirement}
                        onRemoveRequirement={handleRemoveRequirement}
                    />

                    <EventMaterials
                        materials={materials}
                        onChange={setMaterials}
                    />

                    {/* Componente SOLO LECTURA */}
                    <EventFeedbackReadOnly
                        useGenericQuiz={useGenericQuiz}
                        questions={dynamicQuestions}
                    />

                    <div className="flex flex-col-reverse md:flex-row gap-4 justify-end pt-4">
                        <button
                            type="button"
                            onClick={() => setShowDeleteModal(true)}
                            className="px-6 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-xl font-base transition-all flex items-center justify-center gap-2 cursor-pointer hover:rounded-3xl duration-300"
                        >
                            Eliminar
                        </button>

                        <button
                            type="submit"
                            disabled={isSaving || !!dateError}
                            className="w-full md:w-auto px-8 py-2.5 bg-white text-black font-base rounded-xl hover:bg-gray-200 hover:rounded-3xl duration-300 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer shadow-lg shadow-white/10"
                        >
                            {isSaving ? (
                                <>
                                    <span className="inline-block w-4 h-4 rounded-full border-2 border-black/30 border-t-black animate-spin" aria-hidden="true" />
                                    <span>Guardando...</span>
                                </>
                            ) : (
                                <>
                                    Guardar Cambios
                                </>
                            )}
                        </button>
                    </div>

                </form>
            </div>

            <ConfirmationModal
                isOpen={showDeleteModal}
                onClose={() => !isDeleting && setShowDeleteModal(false)}
                onConfirm={handleConfirmDelete}
                title="Eliminar evento"
                message="¿Estás seguro de que deseas eliminar este evento? Se borrarán todos los datos asociados."
                confirmText="Sí, eliminar"
                cancelText="Cancelar"
                variant="danger"
                isLoading={isDeleting}
            />
        </div>
    )
}