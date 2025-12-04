"use client"

import { useState, useEffect, useMemo } from "react"
import { useAuth } from "@/hooks/useAuth"
import api from "@/lib/api"
import {
    BarChart3,
    MessageSquare,
    Star,
    Users,
    AlertCircle,
    Calendar,
    ChevronDown
} from "lucide-react"

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
    title: string
}

interface Answer {
    question: string | { _id: string, text: string } // Puede venir populado o no
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
                // Obtenemos eventos donde el usuario es el presenter
                const { data } = await api.get("/events", {
                    params: { presenter: user.id, sort: "-date" }
                })
                setMyEvents(data.value.results)

                // Opcional: Auto-seleccionar el primer evento pasado si existe
                // const pastEvents = data.value.results.filter((e: Event) => new Date(e.date) < new Date());
                // if (pastEvents.length > 0) setSelectedEventId(pastEvents[0]._id);

            } catch (err) {
                console.error(err)
                setError("Error al cargar tus ponencias.")
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
                // A) Obtener Encuesta por ID del Evento
                // Endpoint: GET /surveys/:eventId
                const surveyReq = await api.get(`/surveys/${selectedEventId}`)
                const foundSurvey = surveyReq.data.value

                if (!foundSurvey) {
                    // Si no hay encuesta, no buscamos respuestas
                    setIsLoadingData(false)
                    return
                }
                setSurvey(foundSurvey)

                // B) Obtener Respuestas usando el ID de la Encuesta
                // Endpoint: GET /surveys/:surveyId/responses (Asumiendo rutas anidadas)
                // O GET /responses?survey=ID dependiendo de tu router.
                // Basado en tu controller anterior que usa req.params.surveyId, uso rutas anidadas:
                try {
                    const responsesReq = await api.get(`/surveys/${foundSurvey._id}/responses`)
                    setResponses(responsesReq.data.value)
                } catch (respErr) {
                    console.log("No se encontraron respuestas o error al cargarlas", respErr)
                    setResponses([])
                }

            } catch (err: any) {
                console.error(err)
                if (err.response?.status === 404) {
                    // Es normal que eventos viejos no tengan encuesta
                } else {
                    setError("Error cargando los datos de la encuesta.")
                }
            } finally {
                setIsLoadingData(false)
            }
        }

        fetchData()
    }, [selectedEventId])


    // --- Estadísticas (Cálculos) ---
    const stats = useMemo(() => {
        if (!survey || responses.length === 0) return null;

        let totalRatingSum = 0;
        let totalAnswersCount = 0;

        // Estructura para agrupar por ID de pregunta
        const questionStats: Record<string, { text: string, sum: number, count: number }> = {};

        // Inicializar con las preguntas de la encuesta
        if (survey.questions) {
            survey.questions.forEach(q => {
                questionStats[q._id] = { text: q.text, sum: 0, count: 0 };
            });
        }

        // Procesar todas las respuestas
        responses.forEach(res => {
            res.answers.forEach(ans => {
                // Manejar si ans.question es un objeto (populado) o string (id)
                const qId = typeof ans.question === 'string' ? ans.question : ans.question._id;

                if (questionStats[qId]) {
                    questionStats[qId].sum += ans.rating;
                    questionStats[qId].count += 1;
                    totalRatingSum += ans.rating;
                    totalAnswersCount += 1;
                }
            });
        });

        // Calcular promedios finales
        const averageRating = totalAnswersCount > 0
            ? (totalRatingSum / totalAnswersCount).toFixed(1)
            : "0.0";

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


    // --- Opciones del Select (FILTRADAS: Solo pasados) ---
    const eventOptions = useMemo(() => {
        const now = new Date()
        // Filtramos eventos que ya pasaron
        const pastEvents = myEvents.filter(e => new Date(e.date) < now)

        return pastEvents.map(e => ({
            value: e._id,
            label: e.title
        }))
    }, [myEvents])


    // --- Render ---

    return (
        <div className="min-h-screen text-white p-4 md:p-8" style={{ background: "linear-gradient(180deg, #1B293A 0%, #040711 10%)" }}>
            <div className="max-w-7xl mx-auto pb-20">

                {/* Header */}
                <div className="mb-10">
                    <h1 className="text-3xl md:text-5xl font-bold mb-6">Resultados de Retroalimentación</h1>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="relative z-19">
                            <label className="block text-sm text-gray-400 mb-2 font-medium">Selecciona una ponencia finalizada:</label>
                            <CustomSelect
                                value={selectedEventId}
                                onChange={setSelectedEventId}
                                options={eventOptions}
                                placeholder={isLoadingEvents ? "Cargando..." : (eventOptions.length === 0 ? "No tienes ponencias finalizadas" : "Seleccionar evento...")}
                                disabled={isLoadingEvents || eventOptions.length === 0}
                            />
                        </div>

                        {/* Info del evento seleccionado (si existe) */}
                        {selectedEventId && (
                            <div className="flex items-end pb-2">
                                <div className="text-gray-400 text-sm flex items-center gap-2">
                                    <Calendar size={16} />
                                    <span>
                                        {myEvents.find(e => e._id === selectedEventId)
                                            ? new Date(myEvents.find(e => e._id === selectedEventId)!.date).toLocaleDateString("es-MX", { dateStyle: 'long' })
                                            : ""}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {error && <ErrorDisplay message={error} />}

                {/* --- ESTADO VACÍO (Sin selección) --- */}
                {!selectedEventId && !isLoadingEvents && (
                    <div className="bg-[#0B1121] border border-gray-800 rounded-2xl p-16 text-center text-gray-500 flex flex-col items-center animate-in fade-in duration-500">
                        <div className="p-4 bg-gray-800/50 rounded-full mb-4">
                            <BarChart3 size={48} className="opacity-50 text-blue-400" />
                        </div>
                        <h3 className="text-xl font-medium text-white mb-2">Selecciona un evento</h3>
                        <p className="max-w-md mx-auto">Elige una de tus ponencias pasadas en el menú superior para visualizar las estadísticas de satisfacción y comentarios.</p>
                    </div>
                )}

                {/* --- LOADING DATA --- */}
                {isLoadingData && (
                    <div className="py-20 flex justify-center">
                        <LoadingSpinner />
                    </div>
                )}

                {/* --- SIN ENCUESTA --- */}
                {!isLoadingData && selectedEventId && !survey && !error && (
                    <div className="bg-[#0B1121] border border-gray-800 rounded-2xl p-12 text-center text-gray-400 flex flex-col items-center animate-in fade-in">
                        <AlertCircle size={48} className="mb-4 text-yellow-500/50" />
                        <h3 className="text-lg font-medium text-white mb-2">Sin encuesta configurada</h3>
                        <p>No se encontró una encuesta activa asociada a este evento.</p>
                    </div>
                )}

                {/* --- SIN RESPUESTAS --- */}
                {!isLoadingData && survey && responses.length === 0 && (
                    <div className="bg-[#0B1121] border border-gray-800 rounded-2xl p-12 text-center text-gray-400 flex flex-col items-center animate-in fade-in">
                        <Users size={48} className="mb-4 text-blue-500/50" />
                        <h3 className="text-lg font-medium text-white mb-2">Aún no hay respuestas</h3>
                        <p>Los asistentes todavía no han enviado retroalimentación para este evento.</p>
                    </div>
                )}

                {/* --- DASHBOARD (Si hay datos) --- */}
                {!isLoadingData && survey && stats && responses.length > 0 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

                        {/* 1. Tarjetas KPI */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Promedio */}
                            <div className="bg-[#0B1121] border border-gray-800 p-6 rounded-2xl relative overflow-hidden group hover:border-blue-500/30 transition-all">
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <Star size={64} className="text-yellow-400" />
                                </div>
                                <p className="text-sm text-gray-400 font-medium uppercase tracking-wider">Calificación Global</p>
                                <div className="mt-2 flex items-end gap-2">
                                    <span className="text-5xl font-bold text-white">{stats.averageRating}</span>
                                    <span className="text-lg text-gray-500 mb-1.5">/ 5.0</span>
                                </div>
                                <div className="mt-4 flex gap-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Star
                                            key={star}
                                            size={18}
                                            className={`${parseFloat(stats.averageRating) >= star ? "text-yellow-400 fill-yellow-400" : "text-gray-700"}`}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Total Respuestas */}
                            <div className="bg-[#0B1121] border border-gray-800 p-6 rounded-2xl relative overflow-hidden group hover:border-blue-500/30 transition-all">
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <Users size={64} className="text-blue-400" />
                                </div>
                                <p className="text-sm text-gray-400 font-medium uppercase tracking-wider">Participación</p>
                                <div className="mt-2">
                                    <span className="text-5xl font-bold text-white">{stats.totalResponses}</span>
                                </div>
                                <p className="mt-4 text-xs text-blue-400 bg-blue-400/10 inline-block px-2 py-1 rounded">
                                    Respuestas recibidas
                                </p>
                            </div>

                            {/* Comentarios */}
                            <div className="bg-[#0B1121] border border-gray-800 p-6 rounded-2xl relative overflow-hidden group hover:border-blue-500/30 transition-all">
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <MessageSquare size={64} className="text-green-400" />
                                </div>
                                <p className="text-sm text-gray-400 font-medium uppercase tracking-wider">Comentarios</p>
                                <div className="mt-2">
                                    <span className="text-5xl font-bold text-white">{stats.comments.length}</span>
                                </div>
                                <p className="mt-4 text-xs text-green-400 bg-green-400/10 inline-block px-2 py-1 rounded">
                                    Opiniones escritas
                                </p>
                            </div>
                        </div>

                        {/* 2. Gráficas de Barras */}
                        <div className="bg-[#0B1121] border border-gray-800 rounded-2xl p-6 md:p-8">
                            <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-2">
                                Desglose por Pregunta
                            </h3>

                            <div className="space-y-8">
                                {stats.questionsArray.map((q, idx) => (
                                    <div key={idx} className="group">
                                        <div className="flex justify-between items-end mb-2">
                                            <span className="text-gray-300 font-medium text-sm md:text-base max-w-[85%] leading-relaxed">
                                                {idx + 1}. {q.text}
                                            </span>
                                            <span className="text-white font-bold text-lg bg-gray-800 px-2 py-0.5 rounded ml-2">
                                                {q.average}
                                            </span>
                                        </div>

                                        {/* Barra de progreso con fondo */}
                                        <div className="h-4 w-full bg-gray-800/50 rounded-full overflow-hidden relative">
                                            {/* Grid lines opcionales */}
                                            <div className="absolute top-0 bottom-0 left-[20%] w-px bg-gray-700/30" />
                                            <div className="absolute top-0 bottom-0 left-[40%] w-px bg-gray-700/30" />
                                            <div className="absolute top-0 bottom-0 left-[60%] w-px bg-gray-700/30" />
                                            <div className="absolute top-0 bottom-0 left-[80%] w-px bg-gray-700/30" />

                                            <div
                                                className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 rounded-full relative z-10 group-hover:from-blue-500 group-hover:to-cyan-300 transition-all duration-1000 ease-out"
                                                style={{ width: `${(parseFloat(q.average) / 5) * 100}%` }}
                                            />
                                        </div>
                                        <div className="flex justify-between text-xs text-gray-600 mt-1 px-1">
                                            <span>1</span>
                                            <span>5</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* 3. Tabla Comentarios */}
                        <div className="bg-[#0B1121] border border-gray-800 rounded-2xl overflow-hidden">
                            <div className="p-6 border-b border-gray-800 bg-gray-900/50 flex justify-between items-center">
                                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                    Comentarios de Asistentes
                                </h3>
                                <span className="text-xs bg-gray-800 text-gray-400 px-2 py-1 rounded-full">
                                    {stats.comments.length}
                                </span>
                            </div>

                            <div className="divide-y divide-gray-800 max-h-[500px] overflow-y-auto custom-scrollbar">
                                {stats.comments.length === 0 ? (
                                    <div className="p-12 text-center text-gray-500 italic flex flex-col items-center">
                                        No hay comentarios escritos para esta ponencia.
                                    </div>
                                ) : (
                                    stats.comments.map((comment, idx) => (
                                        <div key={idx} className="p-6 hover:bg-white/5 transition-colors">
                                            <div className="flex gap-4">
                                                <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center shrink-0 mt-1">
                                                    <span className="text-xs font-bold text-gray-500">#</span>
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-gray-200 text-sm md:text-base leading-relaxed italic">
                                                        "{comment.text}"
                                                    </p>
                                                    <p className="text-xs text-gray-500 mt-3 flex items-center gap-1">
                                                        <Calendar size={10} />
                                                        {new Date(comment.date).toLocaleDateString("es-MX", {
                                                            year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                                        })}
                                                    </p>
                                                </div>
                                            </div>
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