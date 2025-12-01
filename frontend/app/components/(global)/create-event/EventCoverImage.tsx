"use client"

import { useState, useRef, ChangeEvent } from "react"
import { UploadCloud, Image as ImageIcon, X, Loader2 } from "lucide-react"
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
            const sigRes = await api.get("/cloudinary-signature")
            const { timestamp, signature, apiKey, cloudName, folder } = sigRes.data.value

            const formData = new FormData()
            formData.append("file", file)
            formData.append("api_key", apiKey)
            formData.append("timestamp", timestamp)
            formData.append("signature", signature)
            formData.append("folder", folder)

            formData.append("use_filename", "true")
            formData.append("unique_filename", "true")

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
            if (fileInputRef.current) fileInputRef.current.value = ""
        }
    }

    const handleRemove = () => {
        onChange("") // Limpiamos la URL
    }

    return (
        <div className="bg-[#0B1121] border border-gray-800 rounded-2xl p-6">
            <h2 className="text-xl font-semibold text-white mb-2">Portada del Evento</h2>
            <p className="text-gray-400 text-sm mb-4">
                Sube una imagen atractiva para mostrar en la tarjeta del evento. (Recomendado: 1280x720px)
            </p>

            <div className="relative w-full">
                {imageUrl ? (
                    // --- Estado: Imagen Cargada ---
                    <div className="relative w-full h-[300px] aspect-video rounded-xl overflow-hidden group border border-gray-700">
                        <img
                            src={imageUrl}
                            alt="Portada del evento"
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg backdrop-blur-sm transition-colors flex items-center gap-2"
                            >
                                <UploadCloud size={18} /> Cambiar
                            </button>
                            <button
                                type="button"
                                onClick={handleRemove}
                                className="bg-red-500/20 hover:bg-red-500/40 text-red-400 px-4 py-2 rounded-lg backdrop-blur-sm transition-colors flex items-center gap-2"
                            >
                                <X size={18} /> Quitar
                            </button>
                        </div>
                    </div>
                ) : (
                    // --- Estado: Sin Imagen (Upload Area) ---
                    <div
                        onClick={() => !uploading && fileInputRef.current?.click()}
                        className={`border-2 border-dashed border-gray-700 rounded-xl aspect-video flex flex-col items-center justify-center cursor-pointer transition-all hover:border-blue-500 hover:bg-gray-900/50 ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
                    >
                        {uploading ? (
                            <div className="flex flex-col items-center gap-3 text-blue-400">
                                <Loader2 size={40} className="animate-spin" />
                                <span className="font-medium">Subiendo imagen...</span>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-3 text-gray-500 hover:text-gray-300">
                                <div className="p-4 bg-gray-800 rounded-full">
                                    <ImageIcon size={32} />
                                </div>
                                <div className="text-center">
                                    <span className="font-medium text-blue-400">Haz clic para subir</span>
                                    <p className="text-xs mt-1">PNG, JPG o WEBP (Máx. 5MB)</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Input oculto */}
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleUpload}
                    className="hidden"
                />
            </div>
        </div>
    )
}