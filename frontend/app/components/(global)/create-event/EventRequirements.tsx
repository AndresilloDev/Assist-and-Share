"use client"

import { useState } from "react"
import { Plus, X } from "lucide-react"

interface EventRequirementsProps {
    requirements: string[]
    onAddRequirement: (req: string) => void
    onRemoveRequirement: (index: number) => void
}

export default function EventRequirements({
    requirements,
    onAddRequirement,
    onRemoveRequirement
}: EventRequirementsProps) {
    const [newReq, setNewReq] = useState("")

    const handleAdd = () => {
        if (newReq.trim() === "") return
        onAddRequirement(newReq.trim())
        setNewReq("")
    }

    return (
        <div className="bg-[#0B1121] border border-gray-800 rounded-2xl p-6">
            <h2 className="text-xl font-semibold mb-4 text-white">Requisitos del Evento</h2>
            <div className="flex gap-2 mb-4">
                <input
                    type="text"
                    value={newReq}
                    onChange={(e) => setNewReq(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAdd())}
                    placeholder="Ej. Traer laptop, Conocimientos básicos de JS..."
                    className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
                />
                <button
                    type="button"
                    onClick={handleAdd}
                    className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors cursor-pointer"
                >
                    <Plus size={20} />
                </button>
            </div>

            <div className="space-y-2">
                {requirements.length === 0 && <p className="text-gray-500 text-sm italic">No hay requisitos agregados.</p>}
                {requirements.map((req, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-gray-900 px-4 py-2.5 rounded-lg border border-gray-800">
                        <span className="text-gray-300 text-sm">• {req}</span>
                        <button
                            type="button"
                            onClick={() => onRemoveRequirement(idx)}
                            className="text-gray-500 hover:text-red-400 cursor-pointer"
                        >
                            <X size={16} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    )
}