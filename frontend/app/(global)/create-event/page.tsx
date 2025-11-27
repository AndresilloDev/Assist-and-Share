"use client"

import { useState, useEffect, ChangeEvent, useMemo } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import api from "@/lib/api"
import {
    UploadCloud,
    X, Plus, FileText, MapPin, Link as LinkIcon,
    Trash2
} from "lucide-react"
import LoadingSpinner from "@/app/components/(ui)/LoadingSpinner"
import ErrorDisplay from "@/app/components/(ui)/ErrorDisplay"
import CustomSelect from "@/app/components/(ui)/CustomSelect"

// --- Interfaces y Datos Estáticos (sin cambios) ---

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
    url?: string
}

const GENERIC_QUESTIONS_DATA = [
    { text: "¿Qué tan satisfecho estás con el contenido presentado?", order: 1 },
    { text: "¿Cómo calificarías la calidad de la presentación?", order: 2 },
    { text: "¿El presentador demostró dominio del tema?", order: 3 },
    { text: "¿Las instalaciones y logística fueron adecuadas?", order: 4 },
    { text: "¿Recomendarías este evento a otras personas?", order: 5 },
]

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

function getMinDateTime(): string {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    const hours = String(now.getHours()).padStart(2, '0')
    const minutes = String(now.getMinutes()).padStart(2, '0')
    return `${year}-${month}-${day}T${hours}:${minutes}`
}

// --- Componente Principal ---

export default function CreateEventPage() {
    const router = useRouter()
    const { user } = useAuth()

    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [error, setError] = useState("")
    const [dateError, setDateError] = useState("")
    const [quizError, setQuizError] = useState("")
    const [presenters, setPresenters] = useState<Presenter[]>([])
    const [minDateTime] = useState(getMinDateTime())

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

    const [useGenericQuiz, setUseGenericQuiz] = useState(true)
    const [dynamicQuestions, setDynamicQuestions] = useState<
        { text: string; order: number; tempId: number }[]
    >([])
    const [nextTempId, setNextTempId] = useState(1)


    useEffect(() => {
        const fetchPresenters = async () => {
            try {
                const presentersReq = await api.get("/users", { params: { role: "presenter" } })
                setPresenters(presentersReq.data.value.results)
                if (presentersReq.data.value.results.length > 0) {
                    setFormData(prev => ({ ...prev, presenter: prev.presenter || presentersReq.data.value.results[0]._id }))
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


    const presenterOptions = useMemo(() => {
        return presenters.map(p => ({
            value: p._id,
            label: `${p.first_name} ${p.last_name}`
        }))
    }, [presenters])

    // --- MANEJADORES PARA PREGUNTAS DINÁMICAS ---
    const handleAddQuestion = () => {
        if (!useGenericQuiz && dynamicQuestions.length > 0 && dynamicQuestions[dynamicQuestions.length - 1].text.trim() === "") {
            setQuizError("La pregunta anterior no puede estar vacía.");
            return;
        }
        setQuizError("");

        setDynamicQuestions(prev => [
            ...prev,
            { text: "", order: prev.length + 1, tempId: nextTempId }
        ]);
        setNextTempId(prev => prev + 1);
    }

    const handleUpdateQuestion = (tempId: number, newText: string) => {
        setDynamicQuestions(prev =>
            prev.map(q =>
                q.tempId === tempId
                    ? { ...q, text: newText }
                    : q
            )
        );
        if (newText.trim() !== "") {
            setQuizError("");
        }
    }

    const handleRemoveQuestion = (tempId: number) => {
        setQuizError("");
        setDynamicQuestions(prev =>
            prev
                .filter(q => q.tempId !== tempId)
                .map((q, index) => ({
                    ...q,
                    order: index + 1
                }))
        );
    }

    const validateQuiz = () => {
        if (!useGenericQuiz) {
            if (dynamicQuestions.length === 0) {
                setQuizError("Para una Encuesta Personalizada, debes añadir al menos una pregunta.");
                return false;
            }
            if (dynamicQuestions.some(q => q.text.trim() === "")) {
                setQuizError("Todas las preguntas de la Encuesta Personalizada deben tener texto válido.");
                return false;
            }
        }
        setQuizError("");
        return true;
    }
    // --- FIN MANEJADORES PARA PREGUNTAS DINÁMICAS ---


    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target

        if (name === 'date') {
            const selectedDate = new Date(value)
            const currentDate = new Date()

            if (selectedDate < currentDate) {
                setDateError("No puedes seleccionar fechas pasadas. El evento debe programarse después de la hora actual.")
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

    const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return

        const file = e.target.files[0]
        const formDataToSend = new FormData()
        formDataToSend.append("file", file)

        setError("")
        setIsSaving(true)

        try {
            const uploadRes = await api.post("/uploads/material", formDataToSend, {
                headers: { "Content-Type": "multipart/form-data" }
            })

            const secureUrl = uploadRes.data.secure_url

            setMaterials(prev => [
                ...prev,
                {
                    name: file.name,
                    size: `${(file.size / 1024).toFixed(1)} KB`,
                    url: secureUrl
                }
            ])

        } catch (err: any) {
            console.error(err)
            setError("Error al subir el archivo. Inténtalo nuevamente.")
        } finally {
            setIsSaving(false)
        }
    }

    const handleRemoveMaterial = (index: number) => {
        setMaterials(prev => prev.filter((_, i) => i !== index))
    }

    // --- Crear Evento (POST) ---
    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSaving(true)
        setError("")
        setQuizError("")

        if (!validateQuiz()) {
            setIsSaving(false);
            return;
        }

        try {
            // A. Crear el evento
            const eventData = {
                ...formData,
                date: new Date(formData.date).toISOString()
            }

            const eventResponse = await api.post('/events', eventData)
            const newEventId = eventResponse.data.value._id

            // B. Preparar datos para crear la Encuesta/Survey asociada
            let surveyQuestionsToCreate;
            let surveyTitle = "Encuesta de Retroalimentación";
            let surveyDescription = "";

            if (useGenericQuiz) {
                surveyQuestionsToCreate = GENERIC_QUESTIONS_DATA.map(q => ({
                    text: q.text,
                    order: q.order
                }))
                surveyTitle = "Encuesta de Retroalimentación Estándar";
                surveyDescription = "Preguntas predefinidas para evaluar la calidad general del evento.";
            } else {
                surveyQuestionsToCreate = dynamicQuestions.map(q => ({
                    text: q.text,
                    order: q.order
                }))
                surveyTitle = "Encuesta Personalizada";
            }

            // C. Llamada al backend de Surveys para crear la encuesta
            await api.post('/surveys', {
                event: newEventId,
                title: surveyTitle,
                description: surveyDescription,
                questions: surveyQuestionsToCreate
            })

            // D. Redirigir
            router.push(`/event-details/${newEventId}`)
        } catch (err: any) {
            console.error(err)
            setError(err.response?.data?.message || "Error al crear el evento o la encuesta asociada.")
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
                                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:border-blue-500 focus:outline-none"
                                    required
                                    placeholder="Ej. Introducción a la Inteligencia Artificial"
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
                                    placeholder="Describe brevemente de qué tratará el evento..."
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
                                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:border-blue-500 focus:outline-none [color-scheme:dark]"
                                    required
                                />
                                {dateError && (
                                    <div className="mt-2 flex items-start gap-2 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
                                        {/* ICONO DE X ELIMINADO AQUÍ */}
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
                                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:border-blue-500 focus:outline-none"
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
                                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:border-blue-500 focus:outline-none"
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
                                        className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:border-blue-500 focus:outline-none"
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
                                        className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:border-blue-500 focus:outline-none"
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
                                <div key={idx} className="flex justify-between items-center bg-gray-900 px-4 py-2.5 rounded-lg border border-gray-800">
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
                                <div key={idx} className="flex justify-between items-center bg-gray-900 px-4 py-2.5 rounded-lg border border-gray-800">
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
                    </div>

                    {/* --- SECCIÓN 5: Opciones de Encuesta / Quiz Dinámico --- */}
                    <div className="bg-[#0B1121] border border-gray-800 rounded-2xl p-6">
                        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-white">
                            <FileText className="w-5 h-5" /> Opciones de Encuesta de Retroalimentación
                        </h2>

                        <div className="space-y-4">
                            {/* Opción Quiz Genérico */}
                            <div className={`p-4 rounded-lg cursor-pointer transition-all border ${useGenericQuiz ? 'bg-blue-900/40 border-blue-500' : 'bg-gray-900/50 border-gray-700 hover:bg-gray-800/50'}`}>
                                <label htmlFor="generic-quiz" className="flex items-center space-x-3 cursor-pointer">
                                    <input
                                        id="generic-quiz"
                                        type="checkbox"
                                        checked={useGenericQuiz}
                                        onChange={() => {
                                            setUseGenericQuiz(true);
                                            setDynamicQuestions([]);
                                            setQuizError("");
                                        }}
                                        className="w-5 h-5 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 shrink-0"
                                    />
                                    <div className="flex flex-col">
                                        <span className="text-white text-lg font-semibold">Usar Encuesta Genérica</span>
                                        <span className="text-gray-400 text-sm">Se usarán las 5 preguntas estándar predefinidas por la plataforma.</span>
                                    </div>
                                </label>
                            </div>

                            {/* Opción Quiz Dinámico */}
                            <div className={`p-4 rounded-lg transition-all border ${!useGenericQuiz ? 'bg-blue-900/40 border-blue-500' : 'bg-gray-900/50 border-gray-700 hover:bg-gray-800/50'}`}>
                                <label htmlFor="dynamic-quiz" className="flex items-center space-x-3 cursor-pointer">
                                    <input
                                        id="dynamic-quiz"
                                        type="checkbox"
                                        checked={!useGenericQuiz}
                                        onChange={() => {
                                            setUseGenericQuiz(false);
                                            setQuizError("");
                                        }}
                                        className="w-5 h-5 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 shrink-0"
                                    />
                                    <div className="flex flex-col">
                                        <span className="text-white text-lg font-semibold">Crear Encuesta Personalizada</span>
                                        <span className="text-gray-400 text-sm">Define tus propias preguntas para el evento (Mínimo 1).</span>
                                    </div>
                                </label>
                            </div>
                        </div>

                        {/* Formulario de Preguntas Dinámicas */}
                        {!useGenericQuiz && (
                            <div className="mt-6 p-5 bg-gray-950 rounded-lg border border-gray-700 space-y-4">
                                <h3 className="text-lg font-semibold text-white border-b border-gray-700 pb-3">
                                    Preguntas Personalizadas
                                </h3>

                                {dynamicQuestions.length === 0 && (
                                    <p className="text-gray-400 italic text-sm">
                                        Presiona "Agregar Pregunta" para empezar a definir tu encuesta.
                                    </p>
                                )}

                                {dynamicQuestions.sort((a, b) => a.order - b.order).map((q, index) => (
                                    <div key={q.tempId} className="flex items-start gap-3 bg-gray-800 p-3 rounded-lg border border-gray-700">
                                        <span className="text-blue-400 font-bold mt-2 w-6 shrink-0 text-center">{index + 1}.</span>
                                        <input
                                            type="text"
                                            value={q.text}
                                            onChange={(e) => handleUpdateQuestion(q.tempId, e.target.value)}
                                            onBlur={() => validateQuiz()}
                                            placeholder="Escribe el texto de la pregunta (Ej: ¿El material de apoyo fue relevante?)"
                                            className="flex-grow px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveQuestion(q.tempId)}
                                            className="p-2 mt-1 text-red-400 hover:text-red-500 hover:bg-gray-700 rounded-full transition-colors shrink-0"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                ))}

                                <button
                                    type="button"
                                    onClick={handleAddQuestion}
                                    className="cursor-pointer bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-600/30 px-4 py-2 rounded-lg flex items-center gap-2 transition-all text-sm font-medium disabled:opacity-50"
                                    disabled={!useGenericQuiz && dynamicQuestions.some(q => q.text.trim() === "")}
                                >
                                    <Plus size={18} /> Agregar Pregunta
                                </button>

                                {quizError && (
                                    <div className="mt-4 flex items-start gap-2 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
                                        <X size={16} className="text-red-400 mt-0.5 shrink-0"/>
                                        <div className="text-red-400 text-xs leading-relaxed">{quizError}</div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                    {/* Fin de Sección de Encuesta */}


                    {/* Footer Actions (Bottom) */}
                    <div className="flex justify-end pt-4">
                        <button
                            type="submit"
                            disabled={
                                isSaving ||
                                !!dateError ||
                                !!quizError ||
                                (!useGenericQuiz && dynamicQuestions.length === 0)
                            }
                            className="w-full md:w-auto px-8 py-2.5 bg-white text-black font-semibold rounded-xl hover:bg-gray-200 hover:rounded-3xl duration-300 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer shadow-lg shadow-white/10"
                        >
                            {isSaving ? (
                                <>
                                    <span
                                        className="inline-block w-4 h-4 rounded-full border-2 border-black/30 border-t-black animate-spin"
                                        aria-hidden="true"
                                    />
                                    <span>Creando Evento...</span>
                                </>
                            ) : "Crear Evento"}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    )
}