"use client"

import { useState, useEffect, ChangeEvent, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import api from "@/lib/api"
import {
    ArrowLeft, Save, Trash2, UploadCloud,
    X, Plus, FileText, Calendar, MapPin, Link as LinkIcon,
    MessageSquare, GripVertical
} from "lucide-react"
import Link from "next/link"

import LoadingSpinner from "@/app/components/(ui)/LoadingSpinner"
import ErrorDisplay from "@/app/components/(ui)/ErrorDisplay"
import CustomSelect from "@/app/components/(ui)/CustomSelect"
import ConfirmationModal from "@/app/components/(ui)/ConfirmationModal"

// --- Interfaces ---

interface Presenter {
    _id: string
    first_name: string
    last_name: string
}

interface EventFormData {
    title: string
    description: string
    capacity: number
    duration: number
    modality: "in-person" | "online" | "hybrid"
    date: string
    presenter: string
    location: string
    link: string
    requirements: string[]
    type: "workshop" | "seminar" | "conference"
}

interface MockMaterial {
    name: string
    size: string
}

interface Question {
    _id?: string
    text: string
    order: number
}

interface SurveyData {
    _id?: string
    title: string
    description: string
    isActive: boolean
    questions: Question[]
}

// --- Opciones Estáticas ---
const EVENT_TYPE_OPTIONS = [
    { value: "conference", label: "Conferencia" },
    { value: "workshop", label: "Taller" },
    { value: "seminar", label: "Seminario" },
]

const MODALITY_OPTIONS = [
    { value: "in-person", label: "Presencial" },
    { value: "online", label: "En línea" },
    { value: "hybrid", label: "Híbrido" },
]

// Función auxiliar para obtener fecha mínima
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

    // --- Estados ---
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [error, setError] = useState("")
    const [dateError, setDateError] = useState("")
    const [presenters, setPresenters] = useState<Presenter[]>([])
    const [minDateTime] = useState(getMinDateTime())

    // Estados del modal de eliminación
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)

    const [formData, setFormData] = useState<EventFormData>({
        title: "",
        description: "",
        capacity: 0,
        duration: 60,
        modality: "in-person",
        date: "",
        presenter: "",
        location: "",
        link: "",
        requirements: [],
        type: "conference"
    })

    const [newReq, setNewReq] = useState("")
    const [materials, setMaterials] = useState<MockMaterial[]>([])

    // Estados para la encuesta
    const [surveyData, setSurveyData] = useState<SurveyData>({
        title: "Encuesta de retroalimentación",
        description: "",
        isActive: true,
        questions: []
    })
    const [newQuestionText, setNewQuestionText] = useState("")
    const [hasSurvey, setHasSurvey] = useState(false)

    // --- Carga Inicial ---
    useEffect(() => {
        const initData = async () => {
            try {
                const presentersReq = await api.get("/users", { params: { role: "presenter" } })
                setPresenters(presentersReq.data.value.results)

                const eventReq = await api.get(`/events/${eventId}`)
                const event = eventReq.data.value

                const dateObj = new Date(event.date)
                const offset = dateObj.getTimezoneOffset()
                const localDate = new Date(dateObj.getTime() - (offset * 60 * 1000))
                const formattedDate = localDate.toISOString().slice(0, 16)

                setFormData({
                    title: event.title,
                    description: event.description || "",
                    capacity: event.capacity || 0,
                    duration: event.duration,
                    modality: event.modality,
                    date: formattedDate,
                    presenter: event.presenter,
                    location: event.location || "",
                    link: event.link || "",
                    requirements: event.requirements || [],
                    type: event.type
                })

                // Cargar encuesta si existe
                try {
                    const surveyReq = await api.get(`/surveys/${eventId}`)
                    const survey = surveyReq.data.value

                    if (survey) {
                        setHasSurvey(true)
                        setSurveyData({
                            _id: survey._id,
                            title: survey.title || "Encuesta de retroalimentación",
                            description: survey.description || "",
                            isActive: survey.isActive !== undefined ? survey.isActive : true,
                            questions: survey.questions || []
                        })
                    }
                } catch (surveyErr: any) {
                    // Si no existe encuesta, no pasa nada
                    console.log("No hay encuesta para este evento")
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

    // --- Mapeo de Opciones ---
    const presenterOptions = useMemo(() => {
        return presenters.map(p => ({
            value: p._id,
            label: `${p.first_name} ${p.last_name}`
        }))
    }, [presenters])

    // --- Manejadores del Evento ---

    const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = event.target

        if (name === 'date') {
            const selectedDate = new Date(value)
            const currentDate = new Date()

            if (selectedDate < currentDate) {
                setDateError("No puedes seleccionar fechas pasadas. Por favor, elige una fecha futura.")
                return
            } else {
                setDateError("")
            }
        }

        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSelectChange = (field: keyof EventFormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    const handleAddRequirement = () => {
        if (newReq.trim() === "") return
        setFormData(prev => ({
            ...prev,
            requirements: [...prev.requirements, newReq.trim()]
        }))
        setNewReq("")
    }

    const handleRemoveRequirement = (index: number) => {
        setFormData(prev => ({
            ...prev,
            requirements: prev.requirements.filter((_, i) => i !== index)
        }))
    }

    const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0]
            setMaterials(prev => [...prev, { name: file.name, size: `${(file.size / 1024).toFixed(1)} KB` }])
        }
    }

    const handleRemoveMaterial = (index: number) => {
        setMaterials(prev => prev.filter((_, i) => i !== index))
    }

    // --- Manejadores de la Encuesta ---

    const handleSurveyChange = (field: keyof SurveyData, value: any) => {
        setSurveyData(prev => ({ ...prev, [field]: value }))
    }

    const handleAddQuestion = () => {
        if (newQuestionText.trim() === "") return

        const newQuestion: Question = {
            text: newQuestionText.trim(),
            order: surveyData.questions.length
        }

        setSurveyData(prev => ({
            ...prev,
            questions: [...prev.questions, newQuestion]
        }))
        setNewQuestionText("")
    }

    const handleRemoveQuestion = (index: number) => {
        setSurveyData(prev => ({
            ...prev,
            questions: prev.questions.filter((_, i) => i !== index).map((q, i) => ({
                ...q,
                order: i
            }))
        }))
    }

    const handleQuestionTextChange = (index: number, text: string) => {
        setSurveyData(prev => ({
            ...prev,
            questions: prev.questions.map((q, i) =>
                i === index ? { ...q, text } : q
            )
        }))
    }

    const moveQuestion = (index: number, direction: 'up' | 'down') => {
        const newQuestions = [...surveyData.questions]
        const targetIndex = direction === 'up' ? index - 1 : index + 1

        if (targetIndex < 0 || targetIndex >= newQuestions.length) return

        [newQuestions[index], newQuestions[targetIndex]] = [newQuestions[targetIndex], newQuestions[index]]

        setSurveyData(prev => ({
            ...prev,
            questions: newQuestions.map((q, i) => ({ ...q, order: i }))
        }))
    }

    // --- Guardar Evento y Encuesta ---

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSaving(true)
        setError("")

        try {
            // Actualizar evento
            await api.put(`/events/${eventId}`, {
                ...formData,
                date: new Date(formData.date).toISOString()
            })

            // Actualizar o crear encuesta si tiene preguntas
            if (surveyData.questions.length > 0) {
                const surveyPayload = {
                    event: eventId,
                    title: surveyData.title,
                    description: surveyData.description,
                    isActive: surveyData.isActive,
                    questions: surveyData.questions
                }

                if (hasSurvey && surveyData._id) {
                    // Actualizar encuesta existente
                    await api.patch(`/surveys/${surveyData._id}`, surveyPayload)
                } else {
                    // Crear nueva encuesta
                    await api.post('/surveys', surveyPayload)
                }
            }

            router.push(`/event-details/${eventId}`)
        } catch (err: any) {
            console.error(err)
            setError(err.response?.data?.message || "Error al actualizar el evento")
            setIsSaving(false)
        }
    }

    const handleDeleteClick = () => {
        setShowDeleteModal(true)
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

    const handleCloseModal = () => {
        if (!isDeleting) {
            setShowDeleteModal(false)
        }
    }

    if (isLoading) return <div className="min-h-screen bg-gray-950 flex items-center justify-center"><LoadingSpinner /></div>

    return (
        <div className="min-h-screen text-white p-4 md:p-8" style={{ background: "linear-gradient(180deg, #1B293A 0%, #040711 10%)" }}>
            <div className="max-w-7xl mx-auto pb-20 md:pb-0">

                {/* Header */}
                <div className="mb-6 md:mb-8 space-y-4">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-800 pb-6">
                        <div>
                            <h1 className="text-3xl md:text-5xl font-bold mb-2">Editar Evento</h1>
                            {formData.title && (
                                <h2 className="text-lg md:text-xl text-blue-400 font-medium flex items-center gap-2 truncate max-w-[300px] md:max-w-none">
                                    {formData.title}
                                </h2>
                            )}
                        </div>
                    </div>
                </div>

                {error && <ErrorDisplay message={error} />}

                <div className="space-y-8">

                    {/* Sección 1: Información Básica */}
                    <div className="bg-[#0B1121] border border-gray-800 rounded-2xl p-6">
                        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                            Información Básica
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="col-span-2">
                                <label className="block text-sm text-gray-400 mb-1">Título del Evento</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
                                    required
                                />
                            </div>

                            <div className="relative z-20">
                                <label className="block text-sm text-gray-400 mb-1">Tipo de Evento</label>
                                <CustomSelect
                                    value={formData.type}
                                    onChange={(val) => handleSelectChange("type", val)}
                                    options={EVENT_TYPE_OPTIONS}
                                    placeholder="Seleccionar tipo"
                                />
                            </div>

                            <div className="relative z-20">
                                <label className="block text-sm text-gray-400 mb-1">Presentador</label>
                                <CustomSelect
                                    value={formData.presenter}
                                    onChange={(val) => handleSelectChange("presenter", val)}
                                    options={presenterOptions}
                                    placeholder={presenters.length > 0 ? "Seleccionar presentador" : "Cargando..."}
                                />
                            </div>

                            <div className="col-span-2">
                                <label className="block text-sm text-gray-400 mb-1">Descripción</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows={4}
                                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:outline-none resize-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Sección 2: Logística */}
                    <div className="bg-[#0B1121] border border-gray-800 rounded-2xl p-6">
                        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                            Logística y Ubicación
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Fecha y Hora</label>
                                <input
                                    type="datetime-local"
                                    name="date"
                                    value={formData.date}
                                    onChange={handleChange}
                                    min={minDateTime}
                                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:outline-none [color-scheme:dark]"
                                    required
                                />
                                {dateError && (
                                    <div className="mt-2 flex items-start gap-2 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
                                        <div className="text-red-400 text-xs leading-relaxed">{dateError}</div>
                                    </div>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Duración (minutos)</label>
                                <input
                                    type="number"
                                    name="duration"
                                    value={formData.duration}
                                    onChange={handleChange}
                                    min={1}
                                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
                                    required
                                />
                            </div>

                            <div className="relative z-10">
                                <label className="block text-sm text-gray-400 mb-1">Modalidad</label>
                                <CustomSelect
                                    value={formData.modality}
                                    onChange={(val) => handleSelectChange("modality", val)}
                                    options={MODALITY_OPTIONS}
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Capacidad Máxima</label>
                                <input
                                    type="number"
                                    name="capacity"
                                    value={formData.capacity}
                                    onChange={handleChange}
                                    min={0}
                                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
                                />
                            </div>

                            {(formData.modality === 'in-person' || formData.modality === 'hybrid') && (
                                <div className="col-span-2">
                                    <label className="block text-sm text-gray-400 mb-1 flex items-center gap-1"><MapPin size={14} /> Ubicación Física</label>
                                    <input
                                        type="text"
                                        name="location"
                                        value={formData.location}
                                        onChange={handleChange}
                                        placeholder="Ej. Auditorio A, Edificio Central"
                                        className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
                                    />
                                </div>
                            )}

                            {(formData.modality === 'online' || formData.modality === 'hybrid') && (
                                <div className="col-span-2">
                                    <label className="block text-sm text-gray-400 mb-1 flex items-center gap-1"><LinkIcon size={14} /> Enlace de Reunión</label>
                                    <input
                                        type="url"
                                        name="link"
                                        value={formData.link}
                                        onChange={handleChange}
                                        placeholder="Ej. https://zoom.us/j/..."
                                        className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sección 3: Requisitos */}
                    <div className="bg-[#0B1121] border border-gray-800 rounded-2xl p-6">
                        <h2 className="text-xl font-semibold mb-4 text-white">Requisitos del Evento</h2>
                        <div className="flex gap-2 mb-4">
                            <input
                                type="text"
                                value={newReq}
                                onChange={(e) => setNewReq(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddRequirement())}
                                placeholder="Ej. Traer laptop, Conocimientos básicos de JS..."
                                className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
                            />
                            <button
                                type="button"
                                onClick={handleAddRequirement}
                                className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
                            >
                                <Plus size={20} />
                            </button>
                        </div>

                        <div className="space-y-2">
                            {formData.requirements.length === 0 && <p className="text-gray-500 text-sm italic">No hay requisitos agregados.</p>}
                            {formData.requirements.map((req, idx) => (
                                <div key={idx} className="flex justify-between items-center bg-gray-900 px-4 py-3 rounded-lg border border-gray-800">
                                    <span className="text-gray-300 text-sm">• {req}</span>
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveRequirement(idx)}
                                        className="text-gray-500 hover:text-red-400"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Sección 4: Materiales */}
                    <div className="bg-[#0B1121] border border-gray-800 rounded-2xl p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-semibold text-white">Materiales y Recursos</h2>
                            <label className="cursor-pointer bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-600/30 px-4 py-2 rounded-lg flex items-center gap-2 transition-all text-sm font-medium">
                                <UploadCloud size={18} /> Subir archivo
                                <input type="file" className="hidden" onChange={handleFileUpload} />
                            </label>
                        </div>

                        <div className="space-y-3">
                            {materials.length === 0 && <p className="text-gray-500 text-sm italic text-center py-4">No se han subido materiales.</p>}
                            {materials.map((file, idx) => (
                                <div key={idx} className="flex justify-between items-center bg-gray-900 px-4 py-3 rounded-lg border border-gray-800">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded bg-gray-800 border border-gray-700 flex items-center justify-center text-blue-400">
                                            <FileText size={16} />
                                        </div>
                                        <div>
                                            <p className="text-sm text-white font-medium">{file.name}</p>
                                            <p className="text-xs text-gray-500">{file.size}</p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveMaterial(idx)}
                                        className="text-gray-500 hover:text-red-400 p-2"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                        <p className="text-xs text-gray-600 mt-4">* La subida de archivos es una simulación visual.</p>
                    </div>

                    {/* Sección 5: Encuesta de Retroalimentación */}
                    <div className="bg-[#0B1121] border border-gray-800 rounded-2xl p-6">
                        <div className="flex items-center gap-2 mb-6">
                            <MessageSquare className="text-blue-400" size={24} />
                            <h2 className="text-xl font-semibold text-white">Encuesta de Retroalimentación</h2>
                        </div>

                        <div className="space-y-6">
                            {/* Título y descripción de la encuesta */}
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Título de la Encuesta</label>
                                <input
                                    type="text"
                                    value={surveyData.title}
                                    onChange={(e) => handleSurveyChange('title', e.target.value)}
                                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
                                    placeholder="Ej. Encuesta de retroalimentación"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Descripción (opcional)</label>
                                <textarea
                                    value={surveyData.description}
                                    onChange={(e) => handleSurveyChange('description', e.target.value)}
                                    rows={2}
                                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:outline-none resize-none"
                                    placeholder="Breve descripción de la encuesta..."
                                />
                            </div>

                            {/* Estado activo */}
                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    id="isActive"
                                    checked={surveyData.isActive}
                                    onChange={(e) => handleSurveyChange('isActive', e.target.checked)}
                                    className="w-4 h-4 rounded border-gray-700 bg-gray-900 text-blue-600 focus:ring-blue-500"
                                />
                                <label htmlFor="isActive" className="text-sm text-gray-300">
                                    Encuesta activa (los participantes podrán responderla)
                                </label>
                            </div>

                            {/* Agregar pregunta */}
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Preguntas de la Encuesta</label>
                                <div className="flex gap-2 mb-4">
                                    <input
                                        type="text"
                                        value={newQuestionText}
                                        onChange={(e) => setNewQuestionText(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddQuestion())}
                                        placeholder="Escribe una pregunta para la encuesta..."
                                        className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleAddQuestion}
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                                    >
                                        <Plus size={20} />
                                        <span className="hidden sm:inline">Agregar</span>
                                    </button>
                                </div>

                                {/* Lista de preguntas */}
                                <div className="space-y-2">
                                    {surveyData.questions.length === 0 && (
                                        <p className="text-gray-500 text-sm italic text-center py-4 bg-gray-900/50 rounded-lg border border-gray-800">
                                            No hay preguntas agregadas. Agrega al menos una pregunta para crear la encuesta.
                                        </p>
                                    )}
                                    {surveyData.questions.map((question, idx) => (
                                        <div
                                            key={idx}
                                            className="flex items-center gap-2 bg-gray-900 px-4 py-3 rounded-lg border border-gray-800 group"
                                        >
                                            {/* Botones de orden */}
                                            <div className="flex flex-col gap-1 opacity-50 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    type="button"
                                                    onClick={() => moveQuestion(idx, 'up')}
                                                    disabled={idx === 0}
                                                    className="text-gray-500 hover:text-blue-400 disabled:opacity-30 disabled:cursor-not-allowed"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                                    </svg>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => moveQuestion(idx, 'down')}
                                                    disabled={idx === surveyData.questions.length - 1}
                                                    className="text-gray-500 hover:text-blue-400 disabled:opacity-30 disabled:cursor-not-allowed"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                    </svg>
                                                </button>
                                            </div>

                                            {/* Número de pregunta */}
                                            <span className="text-gray-500 font-medium min-w-[2rem]">
                                                {idx + 1}.
                                            </span>

                                            {/* Input de texto de la pregunta */}
                                            <input
                                                type="text"
                                                value={question.text}
                                                onChange={(e) => handleQuestionTextChange(idx, e.target.value)}
                                                className="flex-1 bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white text-sm focus:border-blue-500 focus:outline-none"
                                                placeholder="Texto de la pregunta..."
                                            />

                                            {/* Botón eliminar */}
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveQuestion(idx)}
                                                className="text-gray-500 hover:text-red-400 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X size={18} />
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                {surveyData.questions.length > 0 && (
                                    <p className="text-xs text-gray-500 mt-3">
                                        Usa las flechas para reordenar las preguntas. Los participantes las verán en este orden.
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Botones de acción */}
                    <div className="flex gap-3 w-full md:w-auto justify-end">
                        <button
                            type="button"
                            onClick={handleDeleteClick}
                            className="flex-1 md:flex-none px-4 py-2 bg-red-900/20 hover:bg-red-900/40 cursor-pointer text-red-400 border border-red-900/50 rounded-lg flex items-center justify-center gap-2 transition-all"
                        >
                            Eliminar
                        </button>
                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={isSaving}
                            className="flex-1 md:flex-none px-6 py-2 bg-white text-black font-semibold rounded-lg hover:rounded-3xl duration-300 hover:cursor-pointer hover:bg-gray-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {isSaving ? "Guardando..." : "Guardar Cambios"}
                        </button>
                    </div>

                </div>
            </div>

            {/* Modal de Confirmación de Eliminación */}
            <ConfirmationModal
                isOpen={showDeleteModal}
                onClose={handleCloseModal}
                onConfirm={handleConfirmDelete}
                title="Eliminar evento"
                message="¿Estás seguro de que deseas eliminar este evento? Esta acción no se puede deshacer y todos los datos relacionados se perderán permanentemente."
                confirmText="Sí, eliminar"
                cancelText="No, mantener"
                variant="danger"
                isLoading={isDeleting}
            />
        </div>
    )
}