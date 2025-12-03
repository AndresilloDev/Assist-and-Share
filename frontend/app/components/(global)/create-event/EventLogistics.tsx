"use client"

import { MapPin, Link as LinkIcon } from "lucide-react"
import CustomSelect from "@/app/components/(ui)/CustomSelect"
import { EventFormData, MODALITY_OPTIONS } from "./types"

interface EventLogisticsProps {
    formData: EventFormData
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    handleSelectChange: (field: keyof EventFormData, value: string) => void
    minDateTime: string
    dateError: string
}

export default function EventLogistics({
    formData,
    handleChange,
    handleSelectChange,
    minDateTime,
    dateError
}: EventLogisticsProps) {
    return (
        <div className="bg-[#0B1121] border border-gray-800 rounded-2xl p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                Logística y Ubicación
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm text-gray-400 mb-1">Fecha y Hora</label>
                    <input
                        type="datetime-local"
                        name="date"
                        value={formData.date}
                        onChange={handleChange}
                        min={minDateTime}
                        className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:border-blue-500 focus:outline-none [color-scheme:dark]"
                        required
                    />
                    {dateError && (
                        <div className="mt-2 flex items-start gap-2 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
                            <div className="text-red-400 text-xs leading-relaxed">{dateError}</div>
                        </div>
                    )}
                </div>
                <div>
                    <label className="block text-sm text-gray-400 mb-1">Duración (minutos)</label>
                    <input
                        type="number"
                        name="duration"
                        value={formData.duration}
                        onChange={handleChange}
                        min={1}
                        className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:border-blue-500 focus:outline-none"
                        required
                    />
                </div>

                <div className="relative z-10">
                    <label className="block text-sm text-gray-400 mb-1">Modalidad</label>
                    <CustomSelect
                        value={formData.modality}
                        onChange={(val) => handleSelectChange("modality", val)}
                        options={MODALITY_OPTIONS}
                    />
                </div>

                <div>
                    <label className="block text-sm text-gray-400 mb-1">Capacidad Máxima</label>
                    <input
                        type="number"
                        name="capacity"
                        value={formData.capacity}
                        onChange={handleChange}
                        min={1}
                        className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:border-blue-500 focus:outline-none"
                        required
                    />
                </div>

                {(formData.modality === 'in-person' || formData.modality === 'hybrid') && (
                    // CAMBIO AQUÍ: Se adapta a 1 columna en móvil y 2 en escritorio
                    <div className="col-span-1 md:col-span-2">
                        <label className="block text-sm text-gray-400 mb-1 flex items-center gap-1"><MapPin size={14} /> Ubicación Física</label>
                        <input
                            type="text"
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            required
                            placeholder="Ej. Auditorio A, Edificio Central"
                            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:border-blue-500 focus:outline-none"
                        />
                    </div>
                )}

                {(formData.modality === 'online' || formData.modality === 'hybrid') && (
                    // CAMBIO AQUÍ: Se adapta a 1 columna en móvil y 2 en escritorio
                    <div className="col-span-1 md:col-span-2">
                        <label className="block text-sm text-gray-400 mb-1 flex items-center gap-1"><LinkIcon size={14} /> Enlace de Reunión</label>
                        <input
                            type="url"
                            name="link"
                            value={formData.link}
                            onChange={handleChange}
                            placeholder="Ej. https://zoom.us/j/..."
                            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:border-blue-500 focus:outline-none"
                        />
                    </div>
                )}
            </div>
        </div>
    )
}