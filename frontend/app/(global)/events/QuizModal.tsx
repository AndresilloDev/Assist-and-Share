"use client"

import { useState, useEffect } from "react"
import { X, Star, Loader2, CheckCircle, FileText } from "lucide-react" // Añadimos FileText si se usa para el botón
import api from "@/lib/api"

// --- Interfaces ---

interface Question {
    _id: string
    text: string
    order: number
}

interface Survey {
    _id: string
    event: string
    title: string
    description?: string
    questions: Question[]
}

interface QuizModalProps {
    isOpen: boolean
    onClose: () => void
    eventId: string
    eventTitle: string
}

// Preguntas genéricas predefinidas
const GENERIC_QUESTIONS = [
    { id: "generic_1", text: "¿Qué tan satisfecho estás con el contenido presentado?", order: 1 },
    { id: "generic_2", text: "¿Cómo calificarías la calidad de la presentación?", order: 2 },
    { id: "generic_3", text: "¿El presentador demostró dominio del tema?", order: 3 },
    { id: "generic_4", text: "¿Las instalaciones y logística fueron adecuadas?", order: 4 },
    { id: "generic_5", text: "¿Recomendarías este evento a otras personas?", order: 5 },
]

// --- Componente Principal ---

export default function QuizModal({ isOpen, onClose, eventId, eventTitle }: QuizModalProps) {
    const [survey, setSurvey] = useState<Survey | null>(null)
    const [isLoadingSurvey, setIsLoadingSurvey] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [hasSubmitted, setHasSubmitted] = useState(false)
    const [error, setError] = useState("")

    // Estado para las respuestas
    const [ratings, setRatings] = useState<Record<string, number>>({})
    const [hoveredRatings, setHoveredRatings] = useState<Record<string, number>>({})
    const [comment, setComment] = useState("")

    // Determinar si usar preguntas genéricas o dinámicas
    const questions = survey?.questions || GENERIC_QUESTIONS.map(q => ({
        _id: q.id,
        text: q.text,
        order: q.order
    }))

    const isGeneric = !survey

    // Cargar survey del evento
    useEffect(() => {
        if (!isOpen) return

        const fetchSurvey = async () => {
            setIsLoadingSurvey(true)
            setError("")

            try {
                const { data } = await api.get(`/surveys/event/${eventId}`)
                setSurvey(data.value)

            } catch (err: any) {
                console.log("No se encontró survey personalizado, usando genérico", err)
                setSurvey(null)
            } finally {
                setIsLoadingSurvey(false)
            }
        }

        fetchSurvey()
    }, [isOpen, eventId])

    // Reset al cerrar
    const handleClose = () => {
        setRatings({})
        setHoveredRatings({})
        setComment("")
        setHasSubmitted(false)
        setError("")
        onClose()
    }

    // Enviar respuestas
    const handleSubmit = async () => {
        // Validar que todas las preguntas estén respondidas
        const allAnswered = questions.every(q => ratings[q._id] !== undefined)

        if (!allAnswered) {
            setError("Por favor responde todas las preguntas")
            return
        }

        setIsSubmitting(true)
        setError("")

        try {
            const answers = questions.map(q => ({
                question: q._id,
                rating: ratings[q._id]
            }))

            if (isGeneric) {
                const surveyResponse = await api.post("/surveys", {
                    event: eventId,
                    title: "Encuesta de retroalimentación",
                    questions: GENERIC_QUESTIONS.map(q => ({
                        text: q.text,
                        order: q.order
                    }))
                })

                const createdSurvey = surveyResponse.data.value

                const realAnswers = createdSurvey.questions.map((q: any, idx: number) => ({
                    question: q._id,
                    rating: ratings[GENERIC_QUESTIONS[idx].id]
                }))

                await api.post(`/surveys/${createdSurvey._id}/responses`, {
                    answers: realAnswers,
                    comment: comment.trim()
                })
            } else {
                await api.post(`/surveys/${survey!._id}/responses`, {
                    answers,
                    comment: comment.trim()
                })
            }

            setHasSubmitted(true)

            setTimeout(() => {
                handleClose()
            }, 2000)
        } catch (err: any) {
            const errMsg = err.response?.data?.message || "Error al enviar respuestas"
            setError(errMsg)
            console.error("Error submitting survey:", err)
        } finally {
            setIsSubmitting(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="relative w-full max-w-xl max-h-[95vh] bg-[#0B1121] rounded-2xl border border-gray-800 shadow-2xl overflow-hidden transition-all duration-300">

                {/* Header fijo */}
                <div className="sticky top-0 z-20 bg-[#0B1121] border-b border-gray-800 p-6">
                    <div className="flex items-start justify-between">
                        <div>
                            <h2 className="text-3xl font-extrabold text-white mb-1">
                                {survey?.title || "Encuesta de Retroalimentación"}
                            </h2>
                            <p className="text-sm text-blue-400 font-medium">{eventTitle}</p>
                            {survey?.description && (
                                <p className="text-sm text-gray-400 mt-2">{survey.description}</p>
                            )}
                        </div>
                        <button
                            onClick={handleClose}
                            className="text-gray-400 hover:text-red-400 transition-colors p-2 rounded-full hover:bg-gray-800"
                            disabled={isSubmitting}
                        >
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {/* Content - Barra de desplazamiento estilo quiz button */}
                <div className="overflow-y-auto max-h-[calc(95vh-160px)] p-6 space-y-8
                                scrollbar-thin scrollbar-thumb-blue-600/50 scrollbar-track-gray-950">
                    {isLoadingSurvey ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <Loader2 className="animate-spin text-blue-500 mb-4" size={40} />
                            <p className="text-gray-400">Cargando encuesta...</p>
                        </div>
                    ) : hasSubmitted ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <CheckCircle className="text-green-500 mb-6" size={72} />
                            <h3 className="text-3xl font-bold text-white mb-3">
                                ¡Retroalimentación enviada!
                            </h3>
                            <p className="text-gray-400 max-w-xs">
                                Tu opinión es invaluable para mejorar nuestros futuros eventos.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Preguntas */}
                            {questions.sort((a, b) => a.order - b.order).map((question, index) => (
                                <div key={question._id} className="bg-gray-900 border border-gray-800 rounded-xl p-5 transition-shadow hover:shadow-lg hover:shadow-gray-900/50">
                                    <p className="text-lg text-white font-semibold mb-3">
                                        <span className="text-blue-400 mr-2">{index + 1}.</span> {question.text}
                                    </p>

                                    {/* Rating Stars */}
                                    <div className="flex items-center gap-3">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                type="button"
                                                onClick={() => setRatings({ ...ratings, [question._id]: star })}
                                                onMouseEnter={() => setHoveredRatings({ ...hoveredRatings, [question._id]: star })}
                                                onMouseLeave={() => {
                                                    const { [question._id]: _, ...rest } = hoveredRatings
                                                    setHoveredRatings(rest)
                                                }}
                                                className="transition-transform duration-150 hover:scale-110"
                                            >
                                                <Star
                                                    size={30}
                                                    className={`${
                                                        star <= (hoveredRatings[question._id] || ratings[question._id] || 0)
                                                            ? "fill-yellow-400 text-yellow-400"
                                                            : "text-gray-600/70"
                                                    } transition-colors duration-200`}
                                                />
                                            </button>
                                        ))}
                                        {ratings[question._id] && (
                                            <span className="ml-4 text-md font-medium text-blue-400 border border-blue-600/30 bg-blue-600/10 px-3 py-1 rounded-full">
                                                {ratings[question._id]}/5
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}

                            {/* Comentario opcional */}
                            <div className="space-y-3 pt-4 border-t border-gray-800">
                                <label className="text-white font-semibold text-lg block">
                                    Comentarios adicionales <span className="text-gray-500 text-sm font-normal">(Opcional)</span>
                                </label>
                                <textarea
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    placeholder="Comparte tus comentarios o sugerencias detalladas para ayudarnos a mejorar..."
                                    className="w-full px-5 py-4 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors resize-none shadow-inner"
                                    rows={5}
                                    maxLength={500}
                                />
                                <p className="text-xs text-gray-500 text-right">
                                    {comment.length}/500
                                </p>
                            </div>

                            {error && (
                                <div className="p-4 bg-red-600/10 border border-red-500/30 rounded-xl">
                                    <p className="text-red-400 text-sm font-medium flex items-center gap-2">
                                        <X size={16} /> {error}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer (Botón de Envío con nuevo estilo) */}
                {!hasSubmitted && !isLoadingSurvey && (
                    <div className="sticky bottom-0 z-20 bg-[#0B1121] border-t border-gray-800 p-6">
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            // Estilo similar al QuizButton pero con colores azules
                            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl border border-blue-500/30 flex items-center justify-center gap-2 cursor-pointer
                                       hover:from-blue-700 hover:to-indigo-800 hover:rounded-3xl transition-all duration-300 font-medium
                                       disabled:opacity-50 disabled:cursor-not-allowed w-full shadow-lg shadow-blue-900/30"
                        >
                            {isSubmitting ? (
                                <>
                                    {/* Spinner igual al del QuizButton */}
                                    <span
                                        className="inline-block w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin"
                                        aria-hidden="true"
                                    />
                                    <span>Enviando Retroalimentación...</span>
                                </>
                            ) : (
                                <>
                                    <FileText className="w-5 h-5" /> {/* Icono de FileText para el botón */}
                                    <span>Enviar Retroalimentación</span>
                                </>
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}