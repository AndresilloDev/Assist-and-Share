"use client"

import { useState, useEffect, ChangeEvent } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import api from "@/lib/api"
import { Save } from "lucide-react"

import LoadingSpinner from "@/app/components/(ui)/LoadingSpinner"
import ErrorDisplay from "@/app/components/(ui)/ErrorDisplay"

// --- Componentes Reutilizables ---
import EventBasicInfo from "@/app/components/(global)/create-event/EventBasicInfo"
import EventLogistics from "@/app/components/(global)/create-event/EventLogistics"
import EventRequirements from "@/app/components/(global)/create-event/EventRequirements"
import EventMaterials from "@/app/components/(global)/create-event/EventMaterials"
import EventFeedback from "@/app/components/(global)/create-event/EventFeedback"
import EventCoverImage from "@/app/components/(global)/create-event/EventCoverImage"

// --- Tipos ---
import {
    EventFormData,
    Presenter,
    MaterialItem,
    QuizQuestion
} from "@/app/components/(global)/create-event/types"

// --- Constantes ---
const GENERIC_QUESTIONS_DATA = [
    { text: "¿Qué tan satisfecho estás con el contenido presentado?", order: 1 },
    { text: "¿Cómo calificarías la calidad de la presentación?", order: 2 },
    { text: "¿El presentador demostró dominio del tema?", order: 3 },
    { text: "¿Las instalaciones y logística fueron adecuadas?", order: 4 },
    { text: "¿Recomendarías este evento a otras personas?", order: 5 },
]

function getMinDateTime(): string {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    const hours = String(now.getHours()).padStart(2, '0')
    const minutes = String(now.getMinutes()).padStart(2, '0')
    return `${year}-${month}-${day}T${hours}:${minutes}`
}

export default function CreateEventPage() {
    const router = useRouter()
    const { user } = useAuth()

    // --- Estados de UI ---
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [error, setError] = useState("")
    const [dateError, setDateError] = useState("")
    const [quizError, setQuizError] = useState("")

    // --- Datos ---
    const [presenters, setPresenters] = useState<Presenter[]>([])
    const [minDateTime] = useState(getMinDateTime())

    // --- Formulario Principal ---
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

    // --- Materiales (Estado gestionado por EventMaterials, almacenado aquí) ---
    const [materials, setMaterials] = useState<MaterialItem[]>([])

    // --- Encuesta ---
    const [useGenericQuiz, setUseGenericQuiz] = useState(true)
    const [dynamicQuestions, setDynamicQuestions] = useState<QuizQuestion[]>([])

    // --- Carga de Presentadores ---
    useEffect(() => {
        const fetchPresenters = async () => {
            try {
                const presentersReq = await api.get("/users", { params: { role: "presenter" } })
                setPresenters(presentersReq.data.value.results)

                // Pre-seleccionar el primer presentador si existe
                if (presentersReq.data.value.results.length > 0) {
                    setFormData(prev => ({
                        ...prev,
                        presenter: prev.presenter || presentersReq.data.value.results[0]._id
                    }))
                }
            } catch (err: any) {
                console.error(err)
                setError("Error al cargar la lista de presentadores.")
            } finally {
                setIsLoading(false)
            }
        }

        if (user) fetchPresenters()
    }, [user])

    // --- Handlers de Información Básica y Logística ---
    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        if (name === 'date') {
            const selectedDate = new Date(value)
            const currentDate = new Date()
            if (selectedDate < currentDate) {
                setDateError("No puedes seleccionar fechas pasadas.")
            } else {
                setDateError("")
            }
        }
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSelectChange = (field: keyof EventFormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    // --- Handlers de Requisitos ---
    const handleAddRequirement = (req: string) => {
        setFormData(prev => ({ ...prev, requirements: [...prev.requirements, req] }))
    }

    const handleRemoveRequirement = (index: number) => {
        setFormData(prev => ({ ...prev, requirements: prev.requirements.filter((_, i) => i !== index) }))
    }

    // --- SUBMIT (Crear Evento + Encuesta) ---
    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSaving(true)
        setError("")
        setQuizError("")

        // 1. Validar Encuesta Personalizada
        if (!useGenericQuiz) {
            if (dynamicQuestions.length === 0) {
                setQuizError("Debes añadir al menos una pregunta.")
                setIsSaving(false); return;
            }
            if (dynamicQuestions.some(q => q.text.trim() === "")) {
                setQuizError("Todas las preguntas deben tener texto.")
                setIsSaving(false); return;
            }
        }

        try {
            // 2. Preparar payload del Evento
            // Extraemos solo las URLs del array de objetos materials
            const materialsUrls = materials.map(m => m.url);

            const eventData = {
                ...formData,
                date: new Date(formData.date).toISOString(),
                materials: materialsUrls // Enviamos array de strings al backend
            }

            const eventResponse = await api.post('/events', eventData)
            const newEventId = eventResponse.data.value._id

            // 3. Preparar Encuesta
            let surveyQuestionsToCreate
            let surveyTitle = "Encuesta de Retroalimentación"
            let surveyDescription = ""

            if (useGenericQuiz) {
                surveyQuestionsToCreate = GENERIC_QUESTIONS_DATA.map(q => ({
                    text: q.text,
                    order: q.order
                }))
                surveyTitle = "Encuesta de Retroalimentación Estándar"
                surveyDescription = "Preguntas predefinidas para evaluar la calidad general del evento."
            } else {
                surveyQuestionsToCreate = dynamicQuestions.map(q => ({
                    text: q.text,
                    order: q.order
                }))
                surveyTitle = "Encuesta Personalizada"
            }

            // 4. Crear la Encuesta asociada
            await api.post('/surveys', {
                event: newEventId,
                title: surveyTitle,
                description: surveyDescription,
                questions: surveyQuestionsToCreate
            })

            // 5. Redirigir
            router.push(`/event-details/${newEventId}`)

        } catch (err: any) {
            console.error(err)
            setError(err.response?.data?.message || "Error al crear el evento.")
            setIsSaving(false)
        }
    }

    if (isLoading) return <div className="min-h-screen bg-gray-950 flex items-center justify-center"><LoadingSpinner /></div>

    return (
        <div className="min-h-screen text-white p-4 md:p-8" style={{ background: "linear-gradient(180deg, #1B293A 0%, #040711 10%)" }}>
            <div className="max-w-5xl mx-auto pb-20 md:pb-0">

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 border-b border-gray-800 pb-6">
                    <div>
                        <h1 className="text-3xl md:text-5xl font-bold mb-2">Crear Nuevo Evento</h1>
                    </div>
                </div>

                {error && <ErrorDisplay message={error} />}

                <form onSubmit={handleCreate} className="space-y-8">

                    {/* Componentes Reutilizables */}
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

                    {/* Componente de Materiales Actualizado */}
                    {/* Le pasamos el array completo y la función para actualizarlo */}
                    <EventMaterials
                        materials={materials}
                        onChange={setMaterials}
                    />

                    {/* Componente de Feedback con Drag & Drop */}
                    <EventFeedback
                        useGenericQuiz={useGenericQuiz}
                        setUseGenericQuiz={setUseGenericQuiz}
                        questions={dynamicQuestions}
                        setQuestions={setDynamicQuestions}
                        quizError={quizError}
                        setQuizError={setQuizError}
                    />

                    {/* Botón de Submit */}
                    <div className="flex justify-end pt-4">
                        <button
                            type="submit"
                            disabled={isSaving || !!dateError || !!quizError || (!useGenericQuiz && dynamicQuestions.length === 0)}
                            className="w-full md:w-auto px-8 py-2.5 bg-white text-black font-base rounded-xl hover:bg-gray-200 hover:rounded-3xl duration-300 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer shadow-lg shadow-white/10"
                        >
                            {isSaving ? (
                                <>
                                    <span className="inline-block w-4 h-4 rounded-full border-2 border-black/30 border-t-black animate-spin" aria-hidden="true" />
                                    <span>Creando Evento...</span>
                                </>
                            ) : (
                                <>
                                    Crear Evento
                                </>
                            )}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    )
}