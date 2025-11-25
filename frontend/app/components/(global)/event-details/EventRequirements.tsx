"use client"

import HoverCard from "@/app/components/(ui)/HoverCard"

interface EventRequirementsProps {
  requirements: string
  canEdit: boolean
  onChange: (value: string) => void
}

export default function EventRequirements({ requirements, canEdit, onChange }: EventRequirementsProps) {
  return (
    <HoverCard className="p-8 mb-6">
      <h2 className="text-2xl font-bold mb-4">Requisitos:</h2>
      {canEdit ? (
        <textarea
          value={requirements}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-gray-950 text-white rounded-xl p-4 border border-gray-800 focus:border-blue-500 focus:outline-none min-h-[100px] resize-y transition-colors duration-300"
          placeholder="Escribe los requisitos (uno por línea)..."
        />
      ) : (
        <p className="text-gray-300 leading-relaxed whitespace-pre-line">{requirements}</p>
      )}
    </HoverCard>
  )
}