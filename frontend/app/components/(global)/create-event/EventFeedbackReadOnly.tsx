"use client"

import { Lock, ListChecks, CheckCircle2, Edit3, AlertCircle } from "lucide-react"
import { QuizQuestion } from "./types"

interface EventFeedbackReadOnlyProps {
    useGenericQuiz: boolean
    questions: QuizQuestion[]
}

export default function EventFeedbackReadOnly({
    useGenericQuiz,
    questions
}: EventFeedbackReadOnlyProps) {

    return (
        <div className="bg-[#0B1121] border border-gray-800 rounded-2xl p-6 relative overflow-hidden group">

            {/* Fondo decorativo con candado */}
            <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity pointer-events-none">
                <Lock size={120} />
            </div>

            {/* Header */}
            <div className="flex justify-between items-start mb-6 relative z-10">
                <h2 className="text-xl font-semibold flex items-center gap-2 text-white">
                    Opciones de Retroalimentación
                </h2>
                <div className="flex items-center gap-1.5 px-3 py-1 bg-yellow-500/10 rounded-full border border-yellow-500/20 text-xs text-yellow-500 font-medium">
                    <Lock size={12} />
                    <span>Solo Lectura</span>
                </div>
            </div>

            {/* Tarjeta de Tipo de Encuesta */}
            <div className="mb-6 relative z-10">
                <div className="p-4 rounded-xl border border-gray-700 bg-gray-800/50 flex items-start gap-4 opacity-80">
                    <div className="p-3 rounded-full bg-gray-700 text-gray-300 shrink-0">
                        {useGenericQuiz ? <CheckCircle2 size={24} /> : <Edit3 size={24} />}
                    </div>
                    <div>
                        <h3 className="text-lg font-bold mb-1 text-gray-200">
                            {useGenericQuiz ? "Encuesta Estándar" : "Encuesta Personalizada"}
                        </h3>
                        <p className="text-sm text-gray-400 leading-relaxed">
                            {useGenericQuiz
                                ? "Configuración por defecto: 5 preguntas estándar de satisfacción."
                                : "Configuración personalizada: Preguntas definidas al crear el evento."}
                        </p>
                    </div>
                </div>
            </div>

            {/* Lista de Preguntas Visual */}
            <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800 relative z-10">
                <div className="flex justify-between items-center mb-4 border-b border-gray-800 pb-2">
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                        Cuestionario Activo
                    </h3>
                    <span className="text-xs text-gray-600 italic">
                        {questions.length} preguntas
                    </span>
                </div>

                <div className="space-y-3">
                    {questions.length === 0 ? (
                        <p className="text-gray-500 italic text-sm">Cargando preguntas...</p>
                    ) : (
                        questions.map((q, index) => (
                            <div
                                key={index}
                                className="flex items-center gap-3 bg-gray-950/50 p-3 rounded-xl border border-gray-800/50 cursor-not-allowed select-none opacity-75"
                            >
                                {/* Número */}
                                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-900 text-xs font-bold text-gray-600 border border-gray-800 shrink-0">
                                    {index + 1}
                                </div>

                                {/* Texto de la pregunta */}
                                <div className="flex-grow text-gray-400 text-sm md:text-base px-2">
                                    {q.text}
                                </div>

                                {/* Icono de candado pequeño */}
                                <div className="text-gray-700 p-2">
                                    <Lock size={14} />
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Aviso de integridad de datos */}
                <div className="mt-6 flex items-start gap-3 p-3 bg-blue-900/10 border border-blue-900/20 rounded-lg">
                    <AlertCircle className="text-blue-500/60 shrink-0 mt-0.5" size={16} />
                    <p className="text-xs text-blue-400/60 leading-relaxed">
                        Estas preguntas no se pueden editar para mantener la consistencia de los datos estadísticos y las respuestas ya recibidas de los asistentes.
                    </p>
                </div>
            </div>
        </div>
    )
}