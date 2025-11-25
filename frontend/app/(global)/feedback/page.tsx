"use client"

import { useState, useEffect, useMemo } from "react"
import { useAuth } from "@/hooks/useAuth"
import api from "@/lib/api"
import { BarChart3, MessageSquare, Star, Users, AlertCircle } from "lucide-react"

import CustomSelect from "@/app/components/(ui)/CustomSelect"
import LoadingSpinner from "@/app/components/(ui)/LoadingSpinner"
import ErrorDisplay from "@/app/components/(ui)/ErrorDisplay"

// --- Interfaces ---

interface Event {
    _id: string
    title: string
    date: string
}

interface Question {
    _id: string
    text: string
    order: number
}

interface Survey {
    _id: string
    event: string
    questions: Question[]
}

interface Answer {
    question: string
    rating: number
}

interface Response {
    _id: string
    answers: Answer[]
    comment?: string
    createdAt: string
}

// --- Componente Principal ---

export default function FeedbackPage() {
    const { user } = useAuth()

    // --- Estados ---
    const [myEvents, setMyEvents] = useState<Event[]>([])
    const [selectedEventId, setSelectedEventId] = useState<string>("")

    const [survey, setSurvey] = useState<Survey | null>(null)
    const [responses, setResponses] = useState<Response[]>([])

    const [isLoadingEvents, setIsLoadingEvents] = useState(true)
    const [isLoadingData, setIsLoadingData] = useState(false)
    const [error, setError] = useState("")

    // --- 1. Cargar Eventos del Ponente ---
    useEffect(() => {
        const fetchMyEvents = async () => {
            if (!user) return
            setIsLoadingEvents(true)
            try {
                const { data } = await api.get("/events", {
                    params: { presenter: user.id, sort: "-date" }
                })
                setMyEvents(data.value.results)
            } catch (err) {
                console.error(err)
                setError("Error al cargar ponencias.")
            } finally {
                setIsLoadingEvents(false)
            }
        }
        fetchMyEvents()
    }, [user])

    // --- 2. Cargar Datos al seleccionar Evento ---
    useEffect(() => {
        const fetchData = async () => {
            if (!selectedEventId) return

            setIsLoadingData(true)
            setSurvey(null)
            setResponses([])
            setError("")

            try {
                // A) Obtener Encuesta
                const surveyReq = await api.get("/surveys", { params: { event: selectedEventId } })
                const foundSurvey = surveyReq.data.value.results ? surveyReq.data.value.results[0] : surveyReq.data.value[0];

                if (!foundSurvey) {
                    setIsLoadingData(false)
                    return
                }
                setSurvey(foundSurvey)

                // B) Obtener Respuestas
                const responsesReq = await api.get("/responses", { params: { survey: foundSurvey._id } })
                setResponses(responsesReq.data.value)

            } catch (err: any) {
                console.error(err)
                if (err.response?.status === 404) {
                    setError("Aún no hay datos de retroalimentación para este evento.")
                } else {
                    setError("Error cargando los datos de la encuesta.")
                }
            } finally {
                setIsLoadingData(false)
            }
        }

        fetchData()
    }, [selectedEventId])


    // --- Estadísticas ---
    const stats = useMemo(() => {
        if (!survey || responses.length === 0) return null;

        let totalRatingSum = 0;
        let totalAnswersCount = 0;

        const questionStats: Record<string, { text: string, sum: number, count: number }> = {};

        if (survey.questions) {
            survey.questions.forEach(q => {
                questionStats[q._id] = { text: q.text, sum: 0, count: 0 };
            });
        }

        responses.forEach(res => {
            res.answers.forEach(ans => {
                if (questionStats[ans.question]) {
                    questionStats[ans.question].sum += ans.rating;
                    questionStats[ans.question].count += 1;
                    totalRatingSum += ans.rating;
                    totalAnswersCount += 1;
                }
            });
        });

        const averageRating = totalAnswersCount > 0 ? (totalRatingSum / totalAnswersCount).toFixed(1) : "0.0";

        const questionsArray = Object.values(questionStats).map(q => ({
            text: q.text,
            average: q.count > 0 ? (q.sum / q.count).toFixed(1) : "0.0",
            count: q.count
        }));

        const comments = responses
            .filter(r => r.comment && r.comment.trim() !== "")
            .map(r => ({ text: r.comment, date: r.createdAt }));

        return {
            averageRating,
            totalResponses: responses.length,
            questionsArray,
            comments
        };

    }, [survey, responses])


    // --- Opciones del Select (FILTRADAS) ---
    const eventOptions = useMemo(() => {
        const now = new Date()

        // FILTRO: Solo eventos cuya fecha sea menor a "ahora" (ya terminaron)
        const pastEvents = myEvents.filter(e => new Date(e.date) < now)

        return pastEvents.map(e => ({
            value: e._id,
            label: `${e.title} (${new Date(e.date).toLocaleDateString()})`,
            className: "text-white" // Ya no necesitamos diferenciarlos en gris porque todos son pasados
        }))
    }, [myEvents])


    // --- JSX ---

    return (
        <div className="min-h-screen text-white p-4 md:p-8" style={{ background: "linear-gradient(180deg, #1B293A 0%, #040711 10%)" }}>
            <div className="max-w-7xl mx-auto pb-20">

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl md:text-5xl font-bold mb-6">Retroalimentación</h1>

                    <div className="max-w-md relative z-20">
                        <label className="block text-sm text-gray-400 mb-2">Selecciona una ponencia finalizada:</label>
                        <CustomSelect
                            value={selectedEventId}
                            onChange={setSelectedEventId}
                            options={eventOptions}
                            placeholder={isLoadingEvents ? "Cargando..." : (eventOptions.length === 0 ? "No hay ponencias finalizadas" : "Selecciona un evento")}
                            disabled={isLoadingEvents || eventOptions.length === 0}
                        />
                    </div>
                </div>

                {error && <ErrorDisplay message={error} />}

                {/* Estado Inicial */}
                {!selectedEventId && !isLoadingEvents && (
                    <div className="bg-[#0B1121] border border-gray-800 rounded-2xl p-12 text-center text-gray-500 flex flex-col items-center">
                        <BarChart3 size={48} className="mb-4 opacity-50" />
                        <p>Selecciona una ponencia arriba para ver sus estadísticas.</p>
                    </div>
                )}

                {/* Loading */}
                {isLoadingData && (
                    <div className="py-20">
                        <LoadingSpinner />
                    </div>
                )}

                {/* Sin Encuesta */}
                {!isLoadingData && selectedEventId && !survey && !error && (
                    <div className="bg-[#0B1121] border border-gray-800 rounded-2xl p-8 text-center text-gray-400 flex flex-col items-center">
                        <AlertCircle size={40} className="mb-4 text-yellow-500" />
                        <p>No se encontró una encuesta activa para este evento.</p>
                    </div>
                )}

                {/* DASHBOARD */}
                {!isLoadingData && survey && stats && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

                        {/* 1. Tarjetas KPI */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Promedio */}
                            <div className="bg-[#0B1121] border border-gray-800 p-6 rounded-2xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-10">
                                    <Star size={64} className="text-yellow-400" />
                                </div>
                                <p className="text-sm text-gray-400 font-medium uppercase tracking-wider">Calificación Promedio</p>
                                <div className="mt-2 flex items-end gap-2">
                                    <span className="text-4xl font-bold text-white">{stats.averageRating}</span>
                                    <span className="text-lg text-gray-500 mb-1">/ 5.0</span>
                                </div>
                                <div className="mt-4 flex gap-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Star
                                            key={star}
                                            size={16}
                                            className={`${parseFloat(stats.averageRating) >= star ? "text-yellow-400 fill-yellow-400" : "text-gray-700"}`}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Total */}
                            <div className="bg-[#0B1121] border border-gray-800 p-6 rounded-2xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-10">
                                    <Users size={64} className="text-blue-400" />
                                </div>
                                <p className="text-sm text-gray-400 font-medium uppercase tracking-wider">Total Respuestas</p>
                                <div className="mt-2">
                                    <span className="text-4xl font-bold text-white">{stats.totalResponses}</span>
                                </div>
                                <p className="mt-4 text-xs text-gray-500">Asistentes que respondieron</p>
                            </div>

                            {/* Comentarios Count */}
                            <div className="bg-[#0B1121] border border-gray-800 p-6 rounded-2xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-10">
                                    <MessageSquare size={64} className="text-green-400" />
                                </div>
                                <p className="text-sm text-gray-400 font-medium uppercase tracking-wider">Comentarios</p>
                                <div className="mt-2">
                                    <span className="text-4xl font-bold text-white">{stats.comments.length}</span>
                                </div>
                                <p className="mt-4 text-xs text-gray-500">Opiniones escritas</p>
                            </div>
                        </div>

                        {/* 2. Gráficas */}
                        <div className="bg-[#0B1121] border border-gray-800 rounded-2xl p-6">
                            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                                <BarChart3 className="text-blue-400" size={20} />
                                Desglose por Pregunta
                            </h3>

                            <div className="space-y-6">
                                {stats.questionsArray.length === 0 ? (
                                    <p className="text-gray-500 italic">No hay preguntas configuradas.</p>
                                ) : (
                                    stats.questionsArray.map((q, idx) => (
                                        <div key={idx} className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-300 font-medium max-w-[80%]">{q.text}</span>
                                                <span className="text-white font-bold">{q.average}</span>
                                            </div>
                                            <div className="h-3 w-full bg-gray-800 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 rounded-full transition-all duration-1000 ease-out"
                                                    style={{ width: `${(parseFloat(q.average) / 5) * 100}%` }}
                                                />
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* 3. Tabla Comentarios */}
                        <div className="bg-[#0B1121] border border-gray-800 rounded-2xl overflow-hidden">
                            <div className="p-6 border-b border-gray-800 bg-gray-900/50">
                                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                    <MessageSquare className="text-green-400" size={20} />
                                    Comentarios de Asistentes
                                </h3>
                            </div>

                            <div className="divide-y divide-gray-800">
                                {stats.comments.length === 0 ? (
                                    <div className="p-8 text-center text-gray-500 italic">
                                        No hay comentarios escritos para esta ponencia.
                                    </div>
                                ) : (
                                    stats.comments.map((comment, idx) => (
                                        <div key={idx} className="p-6 hover:bg-white/5 transition-colors">
                                            <p className="text-gray-300 text-sm leading-relaxed">
                                                "{comment.text}"
                                            </p>
                                            <p className="text-xs text-gray-600 mt-3 text-right">
                                                {new Date(comment.date).toLocaleDateString("es-MX", {
                                                    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                                })}
                                            </p>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}