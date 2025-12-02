"use client"

import { useState, useRef, DragEvent } from "react"
import { CheckCircle2, Edit3, GripVertical, Trash2, X } from "lucide-react"
import { QuizQuestion } from "./types"

interface EventFeedbackProps {
    useGenericQuiz: boolean
    setUseGenericQuiz: (val: boolean) => void
    questions: QuizQuestion[]
    setQuestions: (val: QuizQuestion[]) => void
    quizError: string
    setQuizError: (val: string) => void
}

export default function EventFeedback({
    useGenericQuiz,
    setUseGenericQuiz,
    questions,
    setQuestions,
    quizError,
    setQuizError
}: EventFeedbackProps) {

    const [nextTempId, setNextTempId] = useState(1)
    const [isDragging, setIsDragging] = useState(false)

    const dragItem = useRef<number | null>(null)
    const dragOverItem = useRef<number | null>(null)

    // --- Manejadores CRUD ---
    const handleAddQuestion = () => {
        if (!useGenericQuiz && questions.length > 0 && questions[questions.length - 1].text.trim() === "") {
            setQuizError("Completa la pregunta anterior antes de agregar otra.")
            return
        }
        setQuizError("")

        setQuestions([
            ...questions,
            { text: "", order: questions.length + 1, tempId: nextTempId }
        ])
        setNextTempId(prev => prev + 1)
    }

    const handleUpdateQuestion = (tempId: number, newText: string) => {
        const updated = questions.map(q => q.tempId === tempId ? { ...q, text: newText } : q)
        setQuestions(updated)
        if (newText.trim() !== "") setQuizError("")
    }

    const handleRemoveQuestion = (tempId: number) => {
        setQuizError("")
        const filtered = questions.filter(q => q.tempId !== tempId).map((q, index) => ({
            ...q,
            order: index + 1
        }))
        setQuestions(filtered)
    }

    const validateQuiz = () => {
        if (!useGenericQuiz) {
            if (questions.length === 0) {
                setQuizError("Debes añadir al menos una pregunta.")
                return false
            }
            if (questions.some(q => q.text.trim() === "")) {
                setQuizError("Todas las preguntas deben tener texto.")
                return false
            }
        }
        setQuizError("")
        return true
    }

    // --- Lógica Drag & Drop ---
    const handleDragStart = (e: DragEvent<HTMLDivElement>, position: number) => {
        dragItem.current = position
        setIsDragging(true)
        e.dataTransfer.effectAllowed = "move"
    }

    const handleDragEnter = (e: DragEvent<HTMLDivElement>, position: number) => {
        e.preventDefault()
        dragOverItem.current = position

        if (dragItem.current !== null && dragItem.current !== dragOverItem.current) {
            const _questions = [...questions]
            const draggedItemContent = _questions[dragItem.current]
            _questions.splice(dragItem.current, 1)
            _questions.splice(dragOverItem.current, 0, draggedItemContent)

            dragItem.current = dragOverItem.current

            const reordered = _questions.map((q, index) => ({
                ...q,
                order: index + 1
            }))

            setQuestions(reordered)
        }
    }

    const handleDragEnd = () => {
        dragItem.current = null
        dragOverItem.current = null
        setIsDragging(false)
    }

    return (
        <div className="bg-[#0B1121] border border-gray-800 rounded-2xl p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-white">
                Opciones de Retroalimentación
            </h2>

            {/* Selector de Tarjetas - GRID RESPONSIVO 
                grid-cols-1: 1 columna en móvil (default)
                md:grid-cols-2: 2 columnas en tablet/desktop (min-width: 768px)
            */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div
                    onClick={() => { setUseGenericQuiz(true); setQuestions([]); setQuizError("") }}
                    className={`relative p-5 rounded-xl border-2 transition-all duration-200 cursor-pointer flex items-start gap-4 ${useGenericQuiz
                        ? "bg-blue-600/10 border-blue-500 shadow-[0_0_20px_rgba(37,99,235,0.15)]"
                        : "bg-gray-900/40 border-gray-800 hover:bg-gray-800/60 hover:border-gray-700"
                        }`}
                >
                    <div className={`p-3 rounded-full flex-shrink-0 ${useGenericQuiz ? "bg-blue-500 text-white" : "bg-gray-800 text-gray-400"}`}>
                        <CheckCircle2 size={24} />
                    </div>
                    <div>
                        <h3 className={`text-lg font-bold mb-1 ${useGenericQuiz ? "text-white" : "text-gray-300"}`}>
                            Encuesta Estándar
                        </h3>
                        <p className="text-sm text-gray-400 leading-relaxed">
                            Usar las 5 preguntas predefinidas para medir satisfacción.
                        </p>
                    </div>
                    {useGenericQuiz && <div className="absolute top-4 right-4 w-3 h-3 bg-blue-500 rounded-full shadow-[0_0_10px_#3b82f6]"></div>}
                </div>

                <div
                    onClick={() => { setUseGenericQuiz(false); setQuizError("") }}
                    className={`relative p-5 rounded-xl border-2 transition-all duration-200 cursor-pointer flex items-start gap-4 ${!useGenericQuiz
                        ? "bg-blue-600/10 border-blue-500 shadow-[0_0_20px_rgba(37,99,235,0.15)]"
                        : "bg-gray-900/40 border-gray-800 hover:bg-gray-800/60 hover:border-gray-700"
                        }`}
                >
                    <div className={`p-3 rounded-full flex-shrink-0 ${!useGenericQuiz ? "bg-blue-500 text-white" : "bg-gray-800 text-gray-400"}`}>
                        <Edit3 size={24} />
                    </div>
                    <div>
                        <h3 className={`text-lg font-bold mb-1 ${!useGenericQuiz ? "text-white" : "text-gray-300"}`}>
                            Encuesta Personalizada
                        </h3>
                        <p className="text-sm text-gray-400 leading-relaxed">
                            Crea tus propias preguntas específicas para este evento.
                        </p>
                    </div>
                    {!useGenericQuiz && <div className="absolute top-4 right-4 w-3 h-3 bg-blue-500 rounded-full shadow-[0_0_10px_#3b82f6]"></div>}
                </div>
            </div>

            {/* Área de Preguntas */}
            {!useGenericQuiz && (
                <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="bg-gray-900/30 rounded-xl p-4 md:p-6 border border-gray-800/50">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
                                Preguntas del Cuestionario
                            </h3>
                            <span className="text-xs text-gray-500 italic flex items-center gap-1">
                                Arrastra <GripVertical size={12} /> para reordenar
                            </span>
                        </div>

                        <div className="space-y-3">
                            {questions.length === 0 && (
                                <div className="text-center py-10 bg-gray-900/50 rounded-xl border border-gray-800">
                                    <p className="text-gray-400 mb-3">Comienza agregando preguntas para tu audiencia.</p>
                                </div>
                            )}

                            {questions.map((q, index) => (
                                <div
                                    key={q.tempId}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, index)}
                                    onDragEnter={(e) => handleDragEnter(e, index)}
                                    onDragEnd={handleDragEnd}
                                    onDragOver={(e) => e.preventDefault()}
                                    // Se ajustó el padding y gap para móviles (p-2 gap-2) vs escritorio (md:p-3 md:gap-3)
                                    className={`group flex items-center gap-2 md:gap-3 bg-gray-900 p-2 md:p-3 rounded-xl border transition-all duration-200 ${isDragging && dragItem.current === index
                                        ? 'opacity-50 border-blue-500 border-dashed scale-[0.98]'
                                        : 'border-gray-700 hover:border-gray-600 shadow-sm'
                                        }`}
                                >
                                    <div className="cursor-grab active:cursor-grabbing text-gray-600 hover:text-gray-300 p-1 transition-colors flex-shrink-0">
                                        <GripVertical size={20} />
                                    </div>

                                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-800 text-sm font-bold text-gray-400 border border-gray-700 shrink-0">
                                        {index + 1}
                                    </div>

                                    <input
                                        type="text"
                                        value={q.text}
                                        onChange={(e) => handleUpdateQuestion(q.tempId, e.target.value)}
                                        onBlur={() => validateQuiz()}
                                        placeholder={`Pregunta #${index + 1}...`}
                                        // Ajuste de tamaño de fuente para evitar zoom en iOS (text-base)
                                        className="flex-grow bg-transparent border-none text-white placeholder-gray-600 focus:ring-0 text-base px-2 py-1 min-w-0"
                                        autoFocus={q.text === ""}
                                    />

                                    <button
                                        type="button"
                                        onClick={() => handleRemoveQuestion(q.tempId)}
                                        className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer flex-shrink-0"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            ))}
                        </div>

                        <button
                            type="button"
                            onClick={handleAddQuestion}
                            className="mt-6 w-full py-4 bg-gray-800 hover:bg-gray-750 border border-gray-700 hover:border-gray-600 text-white rounded-xl transition-all duration-200 flex items-center justify-center gap-2 font-semibold shadow-sm hover:shadow-md cursor-pointer group"
                        >
                            <span className="text-xl font-light">+</span> Agregar nueva pregunta
                        </button>

                        {quizError && (
                            <div className="mt-4 flex items-center gap-2 text-red-400 bg-red-500/10 px-4 py-3 rounded-lg border border-red-500/20 animate-pulse">
                                <X size={16} />
                                <span className="text-sm font-medium">{quizError}</span>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}