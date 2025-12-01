"use client"

import { X, AlertTriangle, CheckCircle2, Info } from "lucide-react"
import LoadingSpinner from "./LoadingSpinner"

interface ConfirmationModalProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
    title: string
    message: string
    confirmText?: string
    cancelText?: string
    variant?: "danger" | "warning" | "info"
    isLoading?: boolean
}

export default function ConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = "Confirmar",
    cancelText = "Cancelar",
    variant = "danger",
    isLoading = false
}: ConfirmationModalProps) {
    if (!isOpen) return null

    const getVariantConfig = () => {
        switch (variant) {
            case "danger":
                return {
                    icon: <AlertTriangle size={24} />,
                    iconBg: "bg-red-500/10",
                    iconColor: "text-red-500",
                    glowColor: "rgba(239, 68, 68, 0.15)", // Rojo
                    confirmBtn: "px-6 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-xl font-base transition-all flex items-center justify-center gap-2 cursor-pointer hover:rounded-3xl duration-300",
                    cancelBtn: "border-gray-700 text-gray-300 hover:bg-gray-800/40"
                }
            case "warning":
                return {
                    icon: <AlertTriangle size={24} />,
                    iconBg: "bg-yellow-500/10",
                    iconColor: "text-yellow-500",
                    glowColor: "rgba(234, 179, 8, 0.15)", // Amarillo
                    confirmBtn: "px-6 py-2.5 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500 border border-yellow-500/20 rounded-xl font-base transition-all flex items-center justify-center gap-2 cursor-pointer hover:rounded-3xl duration-300",
                    cancelBtn: "border-gray-700 text-gray-300 hover:bg-gray-800"
                }
            default: // info
                return {
                    icon: <Info size={24} />,
                    iconBg: "bg-blue-500/10",
                    iconColor: "text-blue-500",
                    glowColor: "rgba(59, 130, 246, 0.15)", // Azul
                    confirmBtn: "px-6 py-2.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 border border-blue-500/20 rounded-xl font-base transition-all flex items-center justify-center gap-2 cursor-pointer hover:rounded-3xl duration-300",
                    cancelBtn: "border-gray-700 text-gray-300 hover:bg-gray-800"
                }
        }
    }

    const config = getVariantConfig()

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div
                className="group bg-[#0B1121] border border-gray-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 relative"
                onMouseMove={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect()
                    const x = e.clientX - rect.left
                    const y = e.clientY - rect.top
                    e.currentTarget.style.setProperty("--mouse-x", `${x}px`)
                    e.currentTarget.style.setProperty("--mouse-y", `${y}px`)
                }}
            >
                {/* Glow Effect Dinámico */}
                <div
                    className="pointer-events-none absolute opacity-0 group-hover:opacity-100 transition-opacity duration-500 -inset-px rounded-2xl"
                    style={{
                        background: `radial-gradient(600px circle at var(--mouse-x) var(--mouse-y), ${config.glowColor}, transparent 40%)`,
                    }}
                />

                {/* Header */}
                <div className="relative p-6 flex items-start gap-4">
                    <div className={`p-3 rounded-full ${config.iconBg} ${config.iconColor} shrink-0`}>
                        {config.icon}
                    </div>
                    <div className="flex-1">
                        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            {message}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-white transition-colors -mt-2 -mr-2 p-2 cursor-pointer rounded-full hover:bg-white/5"
                        disabled={isLoading}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Footer Actions (Botones Bonitos) */}
                <div className="relative p-6 pt-2 flex gap-3 justify-end">

                    {/* Botón Cancelar */}
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className={`px-6 py-2.5 bg-transparent border rounded-xl font-medium transition-all duration-300 disabled:opacity-50 cursor-pointer hover:rounded-3xl ${config.cancelBtn}`}
                    >
                        {cancelText}
                    </button>

                    {/* Botón Confirmar */}
                    <button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className={`px-6 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-xl font-base transition-all flex items-center justify-center gap-2 cursor-pointer hover:rounded-3xl duration-300 ${config.confirmBtn}`}
                    >
                        {isLoading ? (
                            <>
                                <span>Procesando...</span>
                            </>
                        ) : (
                            confirmText
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}