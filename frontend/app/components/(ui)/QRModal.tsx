"use client"

import { X } from "lucide-react"
import { useState } from "react"

interface QRModalProps {
    isOpen: boolean
    onClose: () => void
    qrUrl?: string
    title?: string
}

export default function QRModal({
    isOpen,
    onClose,
    qrUrl = "https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=QR-Ejemplo",
    title = "Tu código QR"
}: QRModalProps) {

    const [fullScreen, setFullScreen] = useState(false)

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">

            {/* --- FULLSCREEN MODE (when QR is tapped) --- */}
            {fullScreen && (
                <div
                    className="fixed inset-0 bg-black flex items-center justify-center z-50 animate-in fade-in duration-200"
                    onClick={() => setFullScreen(false)}
                >
                    <img
                        src={qrUrl}
                        alt="QR Fullscreen"
                        className="w-full h-full object-contain p-6"
                    />
                </div>
            )}

            {/* Base modal */}
            <div className="bg-[#0B1121] border border-gray-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="p-6 flex items-start justify-between">
                    <h3 className="text-xl font-bold text-white">{title}</h3>

                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-white transition-colors p-2 hover:cursor-pointer"
                    >
                        <X size={22} />
                    </button>
                </div>

                {/* QR IMAGE */}
                <div className="p-6 pt-0 flex justify-center">
                    <img
                        src={qrUrl}
                        alt="QR"
                        className="w-56 h-56 rounded-xl shadow-lg object-cover hover:cursor-pointer active:scale-95 transition"
                        onClick={() => setFullScreen(true)}   // ← FULLSCREEN
                    />
                </div>

                {/* Footer */}
                <div className="p-6 pt-0 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 rounded-xl text-white font-semibold bg-white/10 hover:bg-white/20 transition-all hover:cursor-pointer"
                    >
                        Cerrar
                    </button>
                </div>

            </div>
        </div>
    )
}