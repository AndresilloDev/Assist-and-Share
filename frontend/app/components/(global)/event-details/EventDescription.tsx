"use client"

import HoverCard from "@/app/components/(ui)/HoverCard"

interface EventDescriptionProps {
  description: string
  canEdit: boolean
  onChange: (value: string) => void
}

export default function EventDescription({ description, canEdit, onChange }: EventDescriptionProps) {
  return (
    <HoverCard className="p-8 mb-6">
      <h2 className="text-2xl font-bold mb-4">Descripción:</h2>
      {canEdit ? (
        <textarea
          value={description}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-gray-950 text-white rounded-xl p-4 border border-gray-800 focus:border-blue-500 focus:outline-none min-h-[150px] resize-y transition-colors duration-300"
          placeholder="Escribe la descripción del evento..."
        />
      ) : (
        <p className="text-gray-300 leading-relaxed">{description}</p>
      )}
    </HoverCard>
  )
}