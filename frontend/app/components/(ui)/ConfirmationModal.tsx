"use client"

import { X, AlertTriangle } from "lucide-react"
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

    const getVariantStyles = () => {
        switch (variant) {
            case "danger":
                return {
                    iconBg: "bg-red-500/10",
                    iconColor: "text-red-500",
                    confirmBtn: "bg-red-600/10 hover:bg-red-600 text-red-400 hover:text-white border border-red-600/30 hover:border-red-600",
                    cancelBtn: "bg-gray-600/10 hover:bg-gray-600 text-gray-400 hover:text-white border border-gray-600/30 hover:border-gray-600"
                }
            case "warning":
                return {
                    iconBg: "bg-yellow-500/10",
                    iconColor: "text-yellow-500",
                    confirmBtn: "bg-yellow-600/10 hover:bg-yellow-600 text-yellow-400 hover:text-white border border-yellow-600/30 hover:border-yellow-600",
                    cancelBtn: "bg-gray-600/10 hover:bg-gray-600 text-gray-400 hover:text-white border border-gray-600/30 hover:border-gray-600"
                }
            default:
                return {
                    iconBg: "bg-blue-500/10",
                    iconColor: "text-blue-500",
                    confirmBtn: "bg-blue-600/10 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-600/30 hover:border-blue-600",
                    cancelBtn: "bg-gray-600/10 hover:bg-gray-600 text-gray-400 hover:text-white border border-gray-600/30 hover:border-gray-600"
                }
        }
    }

    const styles = getVariantStyles()

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
                <div
                    className="pointer-events-none absolute opacity-0 group-hover:opacity-100 transition-opacity duration-500 -inset-px rounded-2xl"
                    style={{
                        background: "radial-gradient(600px circle at var(--mouse-x) var(--mouse-y), rgba(239, 68, 68, 0.15), transparent 40%)",
                    }}
                />

                {/* Header */}
                <div className="relative p-6 flex items-start gap-4">
                    <div className={`p-3 rounded-full ${styles.iconBg} ${styles.iconColor} shrink-0`}>
                        <AlertTriangle size={24} />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            {message}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-white transition-colors -mt-2 -mr-2 p-2 hover:cursor-pointer"
                        disabled={isLoading}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Footer Actions */}
                <div className="relative p-6 pt-0 flex gap-3 justify-end">
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className={`px-6 py-2.5 rounded-xl font-medium transition-all duration-300 disabled:opacity-50 hover:cursor-pointer ${styles.cancelBtn}`}
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className={`px-6 py-2.5 rounded-xl font-bold transition-all duration-300 flex items-center gap-2 disabled:opacity-50 hover:cursor-pointer ${styles.confirmBtn}`}
                    >
                        {isLoading && <LoadingSpinner size="sm" />}
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    )
}