"use client"

import CustomSelect from "@/app/components/(ui)/CustomSelect"
import { EventFormData, Presenter, EVENT_TYPE_OPTIONS } from "./types"

interface EventBasicInfoProps {
    formData: EventFormData
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
    handleSelectChange: (field: keyof EventFormData, value: string) => void
    presenters: Presenter[]
}

export default function EventBasicInfo({
    formData,
    handleChange,
    handleSelectChange,
    presenters
}: EventBasicInfoProps) {

    const presenterOptions = presenters.map(p => ({
        value: p._id,
        label: `${p.first_name} ${p.last_name}`
    }))

    return (
        <div className="bg-[#0B1121] border border-gray-800 rounded-2xl p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                Información Básica
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-2">
                    <label className="block text-sm text-gray-400 mb-1">Título del Evento</label>
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:border-blue-500 focus:outline-none"
                        required
                        placeholder="Ej. Introducción a la Inteligencia Artificial"
                    />
                </div>

                <div className="relative z-20">
                    <label className="block text-sm text-gray-400 mb-1">Tipo de Evento</label>
                    <CustomSelect
                        value={formData.type}
                        onChange={(val) => handleSelectChange("type", val)}
                        options={EVENT_TYPE_OPTIONS}
                        placeholder="Seleccionar tipo"
                    />
                </div>

                <div className="relative z-20">
                    <label className="block text-sm text-gray-400 mb-1">Presentador</label>
                    <CustomSelect
                        value={formData.presenter}
                        onChange={(val) => handleSelectChange("presenter", val)}
                        options={presenterOptions}
                        placeholder={presenters.length > 0 ? "Seleccionar presentador" : "Cargando..."}
                    />
                </div>

                <div className="col-span-2">
                    <label className="block text-sm text-gray-400 mb-1">Descripción</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows={4}
                        placeholder="Describe brevemente de qué tratará el evento..."
                        className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:outline-none resize-none"
                    />
                </div>
            </div>
        </div>
    )
}