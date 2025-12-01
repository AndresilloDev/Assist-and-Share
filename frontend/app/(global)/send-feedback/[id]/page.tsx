"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import api from "@/lib/api"
import { Star, Send, CheckCircle2, AlertCircle, Loader2, ArrowLeft } from "lucide-react"
import Link from "next/link"

// --- Interfaces ---

interface Question {
    _id: string
    text: string
    order: number
}

interface Survey {
    _id: string
    title: string
    description?: string
    isActive: boolean
    questions: Question[]
    event: string | { title: string } // Puede venir poblado o no
}

interface AnswerPayload {
    question: string
    rating: number
}

export default function SendFeedbackPage() {
    const params = useParams()
    const eventId = params.id as string
    const router = useRouter()
    const { user } = useAuth()

    // --- Estados ---
    const [isLoading, setIsLoading] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState("")

    const [survey, setSurvey] = useState<Survey | null>(null)
    const [alreadyResponded, setAlreadyResponded] = useState(false)

    // Estado del formulario
    const [ratings, setRatings] = useState<Record<string, number>>({}) // { questionId: rating }
    const [comment, setComment] = useState("")

    // --- Carga de Datos ---
    useEffect(() => {
        const fetchSurveyData = async () => {
            if (!eventId || !user) return

            try {
                setIsLoading(true)

                const { data: surveyData } = await api.get(`/surveys/${eventId}`)
                const currentSurvey = surveyData.value

                if (!currentSurvey) {
                    setError("No se encontró una encuesta para este evento.")
                    setIsLoading(false)
                    return
                }

                if (!currentSurvey.isActive) {
                    setError("Esta encuesta ya no está activa.")
                    setIsLoading(false)
                    return
                }

                setSurvey(currentSurvey)

                try {
                    const { data: responseData } = await api.get(`/surveys/${currentSurvey._id}/responses/me`)
                    if (responseData.value) {
                        setAlreadyResponded(true)
                    }
                } catch (err) {
                    console.log("Verificación de respuesta previa:", err)
                }

            } catch (err: any) {
                console.error(err)
                setError(err.response?.data?.message || "Error al cargar la encuesta.")
            } finally {
                setIsLoading(false)
            }
        }

        fetchSurveyData()
    }, [eventId, user])

    // --- Manejadores ---

    const handleRatingChange = (questionId: string, value: number) => {
        setRatings(prev => ({
            ...prev,
            [questionId]: value
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!survey) return

        const unansweredQuestions = survey.questions.filter(q => !ratings[q._id])
        if (unansweredQuestions.length > 0) {
            alert(`Por favor responde todas las preguntas. Faltan: ${unansweredQuestions.length}`)
            return
        }

        setIsSubmitting(true)
        setError("")

        try {
            const answersArray: AnswerPayload[] = Object.entries(ratings).map(([qId, rating]) => ({
                question: qId,
                rating
            }))

            const payload = {
                answers: answersArray,
                comment: comment
            }

            await api.post(`/surveys/${survey._id}/responses`, payload)

            setAlreadyResponded(true)

        } catch (err: any) {
            console.error(err)
            setError(err.response?.data?.message || "Error al enviar tu respuesta.")
        } finally {
            setIsSubmitting(false)
        }
    }

    // --- Renderizado de Estrellas ---
    const renderStars = (questionId: string) => {
        const currentRating = ratings[questionId] || 0

        return (
            <div className="flex gap-2 mt-2">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type="button"
                        onClick={() => handleRatingChange(questionId, star)}
                        className="group focus:outline-none transition-transform active:scale-90"
                    >
                        <Star
                            size={32}
                            className={`transition-colors duration-200 ${star <= currentRating
                                ? "fill-yellow-400 text-yellow-400"
                                : "fill-transparent text-gray-600 group-hover:text-yellow-400/50"
                                }`}
                        />
                    </button>
                ))}
            </div>
        )
    }

    // --- Renderizado Condicional ---

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-950 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                    <p className="text-gray-400">Cargando encuesta...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
                <div className="bg-[#0B1121] border border-gray-800 p-8 rounded-2xl max-w-md w-full text-center">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-white mb-2">Hubo un problema</h2>
                    <p className="text-gray-400 mb-6">{error}</p>
                    <button
                        onClick={() => router.back()}
                        className="px-6 py-2 bg-gray-800 text-white rounded-xl hover:bg-gray-700 transition-colors"
                    >
                        Volver
                    </button>
                </div>
            </div>
        )
    }

    if (alreadyResponded) {
        return (
            <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
                <div className="bg-[#0B1121] border border-green-900/30 p-8 rounded-2xl max-w-md w-full text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-green-500" />

                    <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle2 className="w-8 h-8 text-green-500" />
                    </div>

                    <h2 className="text-2xl font-bold text-white mb-2">¡Gracias por tu opinión!</h2>
                    <p className="text-gray-400 mb-8">
                        Tu retroalimentación ha sido registrada correctamente. Agradecemos tu tiempo para ayudarnos a mejorar.
                    </p>

                    <Link
                        href="/events"
                        className="inline-block w-full px-6 py-3 bg-white text-black font-semibold rounded-xl hover:bg-gray-200 transition-colors"
                    >
                        Volver a Eventos
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen text-white p-4 md:p-8" style={{ background: "linear-gradient(180deg, #1B293A 0%, #040711 10%)" }}>
            <div className="max-w-2xl mx-auto">

                {/* Header */}
                <div className="mb-8">
                    <Link href={`/event-details/${eventId}`} className="inline-flex items-center text-gray-400 hover:text-white mb-4 transition-colors">
                        <ArrowLeft size={16} className="mr-2" /> Volver al evento
                    </Link>
                    <h1 className="text-3xl font-bold mb-2">{survey?.title || "Encuesta de Satisfacción"}</h1>
                    {survey?.description && (
                        <p className="text-gray-400">{survey.description}</p>
                    )}
                </div>

                {/* Formulario */}
                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* Preguntas */}
                    <div className="space-y-4">
                        {survey?.questions
                            .sort((a, b) => a.order - b.order)
                            .map((question, index) => (
                                <div key={question._id} className="bg-[#0B1121] border border-gray-800 p-6 rounded-2xl">
                                    <div className="flex items-start gap-3 mb-3">
                                        <span className="flex items-center justify-center w-6 h-6 rounded bg-gray-800 text-xs font-bold text-gray-400 border border-gray-700 shrink-0 mt-0.5">
                                            {index + 1}
                                        </span>
                                        <h3 className="text-lg font-medium text-white">{question.text}</h3>
                                    </div>

                                    <div className="pl-9">
                                        <p className="text-sm text-gray-500 mb-2">Califica del 1 al 5</p>
                                        {renderStars(question._id)}
                                    </div>
                                </div>
                            ))}
                    </div>

                    {/* Comentario Adicional */}
                    <div className="bg-[#0B1121] border border-gray-800 p-6 rounded-2xl">
                        <h3 className="text-lg font-medium text-white mb-4">Comentarios adicionales (Opcional)</h3>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="¿Tienes alguna sugerencia para mejorar?"
                            rows={4}
                            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:outline-none resize-none placeholder-gray-600"
                        />
                    </div>

                    {/* Botón Submit */}
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-4 bg-white text-black font-bold text-lg rounded-xl hover:bg-gray-200 transition-all shadow-lg shadow-white/10 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="animate-spin" /> Enviando...
                            </>
                        ) : (
                            <>
                                Enviar Retroalimentación <Send size={20} />
                            </>
                        )}
                    </button>
                </form>

            </div>
        </div>
    )
}