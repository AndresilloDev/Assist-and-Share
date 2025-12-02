"use client"

import { useState, useRef, ChangeEvent } from "react"
import { UploadCloud, Image as ImageIcon, Loader2, Edit3, Camera } from "lucide-react"
import api from "@/lib/api"

interface EventCoverImageProps {
    imageUrl: string
    onChange: (url: string) => void
}

export default function EventCoverImage({ imageUrl, onChange }: EventCoverImageProps) {
    const [uploading, setUploading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleUpload = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (!file.type.startsWith("image/")) {
            alert("Por favor sube un archivo de imagen válido")
            return
        }

        setUploading(true)

        try {
            // 1. Obtener firma del backend (asegúrate que tu endpoint devuelva esto)
            const sigRes = await api.get("/cloudinary-signature")
            const { timestamp, signature, apiKey, cloudName, folder } = sigRes.data.value

            const formData = new FormData()
            formData.append("file", file)
            formData.append("api_key", apiKey)
            formData.append("timestamp", timestamp)
            formData.append("signature", signature)
            formData.append("folder", folder)

            // Opcionales según tu config de Cloudinary
            formData.append("use_filename", "true")
            formData.append("unique_filename", "true")

            // 2. Subir a Cloudinary
            const cloudRes = await fetch(
                `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
                { method: "POST", body: formData }
            )

            if (!cloudRes.ok) {
                const errText = await cloudRes.text();
                console.error("Cloudinary Error:", errText);
                throw new Error("Error al subir imagen");
            }

            const data = await cloudRes.json()
            onChange(data.secure_url)

        } catch (error) {
            console.error("Error subiendo portada:", error)
            alert("Hubo un error al subir la imagen.")
        } finally {
            setUploading(false)
            // Reset del input para permitir subir la misma imagen si falló o se quiere reintentar
            if (fileInputRef.current) fileInputRef.current.value = ""
        }
    }

    const triggerInput = () => {
        if (!uploading) fileInputRef.current?.click()
    }

    return (
        <div className="bg-[#0B1121] border border-gray-800 rounded-2xl p-6 w-full">
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h2 className="text-xl font-semibold text-white">Portada del Evento</h2>
                    <p className="text-gray-400 text-sm mt-1">
                        Formato recomendado: 1200x600px (Rectangular)
                    </p>
                </div>
            </div>

            {/* Contenedor Principal de la Imagen */}
            <div
                className={`
                    relative w-full h-48 sm:h-64 md:h-72 lg:h-80 
                    rounded-xl overflow-hidden border border-gray-700/50 
                    bg-gray-900/50 transition-all duration-300
                    ${!imageUrl ? 'hover:border-blue-500/50 hover:bg-gray-800 cursor-pointer' : ''}
                `}
                onClick={!imageUrl ? triggerInput : undefined}
            >
                {/* Input Oculto */}
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleUpload}
                    className="hidden"
                />

                {/* --- ESTADO: CARGANDO (Overlay Global) --- */}
                {uploading && (
                    <div className="absolute inset-0 z-20 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center text-blue-400 transition-all">
                        <Loader2 size={48} className="animate-spin mb-3" />
                        <span className="font-medium text-white tracking-wide">Subiendo imagen...</span>
                    </div>
                )}

                {imageUrl ? (
                    // --- ESTADO: CON IMAGEN ---
                    <div className="relative w-full h-full group">
                        <img
                            src={imageUrl}
                            alt="Portada del evento"
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />

                        {/* Overlay Oscuro Permanente (para legibilidad del botón) */}
                        <div className="absolute inset-0 bg-black/20" />

                        {/* Botón Central de Edición (Siempre visible, estilo cristal) */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation(); // Evita clicks fantasma
                                    triggerInput();
                                }}
                                disabled={uploading}
                                className="
                                    flex items-center gap-3 px-6 py-3 
                                    bg-black/40 backdrop-blur-md border border-white/20 
                                    text-white rounded-full font-medium shadow-xl 
                                    hover:bg-white/20 hover:scale-105 active:scale-95 
                                    transition-all duration-200 group-hover:border-white/40
                                    hover:cursor-pointer
                                "
                            >
                                <Edit3 size={20} />
                                <span>Cambiar portada</span>
                            </button>
                        </div>
                    </div>
                ) : (
                    // --- ESTADO: SIN IMAGEN (Placeholder) ---
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 gap-4 border-2 border-dashed border-transparent hover:border-blue-500/30 transition-all rounded-xl">
                        <div className="p-5 bg-gray-800/80 rounded-full shadow-lg ring-1 ring-white/5">
                            <UploadCloud size={40} className="text-blue-400" />
                        </div>
                        <div className="text-center">
                            <p className="text-lg font-medium text-gray-300">Sube tu imagen aquí</p>
                            <p className="text-sm text-gray-500 mt-1">PNG, JPG o WEBP</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}