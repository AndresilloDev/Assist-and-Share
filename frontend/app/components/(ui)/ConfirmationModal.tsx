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
                    confirmBtn: "bg-red-600 hover:bg-red-500 shadow-red-900/20 hover:cursor-pointer"
                }
            case "warning":
                return {
                    iconBg: "bg-yellow-500/10",
                    iconColor: "text-yellow-500",
                    confirmBtn: "bg-yellow-600 hover:bg-yellow-500 shadow-yellow-900/20 hover:cursor-pointer"
                }
            default:
                return {
                    iconBg: "bg-blue-500/10",
                    iconColor: "text-blue-500",
                    confirmBtn: "bg-blue-600 hover:bg-blue-500 shadow-blue-900/20 hover:cursor-pointer"
                }
        }
    }

    const styles = getVariantStyles()

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-[#0B1121] border border-gray-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="p-6 flex items-start gap-4">
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
                <div className="p-6 pt-0 flex gap-3 justify-end">
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="px-4 py-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 font-medium transition-all disabled:opacity-50 hover:cursor-pointer"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className={`px-6 py-2.5 rounded-xl text-white font-bold shadow-lg transition-all flex items-center gap-2 disabled:opacity-50 ${styles.confirmBtn}`}
                    >
                        {isLoading && <LoadingSpinner size="sm" />}
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    )
}