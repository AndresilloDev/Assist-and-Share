"use client"

import { useState, useRef, ChangeEvent, useEffect } from "react"
import { UploadCloud, Image as ImageIcon, Loader2, Edit3, Camera } from "lucide-react"
import api from "@/lib/api"

interface EventCoverImageProps {
    imageUrl: string
    onChange: (url: string) => void
}

// Definimos la URL por defecto
const DEFAULT_IMAGE = "https://res.cloudinary.com/dgzwh9lms/image/upload/v1764785246/event/materials/UTEZ_ttu6rn.png"

export default function EventCoverImage({ imageUrl, onChange }: EventCoverImageProps) {
    const [uploading, setUploading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Efecto para asegurar que el padre tenga la URL por defecto si no hay imagen
    useEffect(() => {
        if (!imageUrl || imageUrl.trim() === "") {
            onChange(DEFAULT_IMAGE)
        }
    }, [imageUrl, onChange])

    // Usamos la imagen que viene por props. 
    // Gracias al useEffect, 'imageUrl' debería actualizarse casi instantáneamente a la default si estaba vacía.
    // Dejamos el fallback (|| DEFAULT_IMAGE) por seguridad visual durante el renderizado inicial.
    const displayImage = imageUrl || DEFAULT_IMAGE

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

            <div
                className={`
                    relative w-full h-48 sm:h-64 md:h-72 lg:h-80 
                    rounded-xl overflow-hidden border border-gray-700/50 
                    bg-gray-900/50 transition-all duration-300
                    hover:border-blue-500/50 hover:bg-gray-800 cursor-pointer
                `}
                onClick={undefined}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleUpload}
                    className="hidden"
                />

                {uploading && (
                    <div className="absolute inset-0 z-20 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center text-blue-400 transition-all">
                        <Loader2 size={48} className="animate-spin mb-3" />
                        <span className="font-medium text-white tracking-wide">Subiendo imagen...</span>
                    </div>
                )}

                {/* Siempre renderizamos la estructura con imagen porque displayImage siempre tendrá valor */}
                <div className="relative w-full h-full group">
                    <img
                        src={displayImage}
                        alt="Portada del evento"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />

                    <div className="absolute inset-0 bg-black/20" />

                    <div className="absolute inset-0 flex items-center justify-center">
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
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
            </div>
        </div>
    )
}