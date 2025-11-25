"use client"

import { Upload } from 'lucide-react'
import HoverCard from "@/app/components/(ui)/HoverCard"
import MaterialItem from "@/app/components/(global)/event-details/MaterialItem"

interface Material {
  id: string
  name: string
  type: "pptx" | "xlsx" | "pdf" | "docx"
  uploadDate: string
  url: string
}

interface EventMaterialsProps {
  materials: Material[]
  canEdit: boolean
  onRemove: (id: string) => void
}

export default function EventMaterials({ materials, canEdit, onRemove }: EventMaterialsProps) {
  return (
    <HoverCard className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Material:</h2>
        {canEdit && (
          <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/30">
            <Upload size={16} />
            Subir archivo
          </button>
        )}
      </div>
      <div className="space-y-4">
        {materials.map((material) => (
          <MaterialItem
            key={material.id}
            material={material}
            canEdit={canEdit}
            onRemove={() => onRemove(material.id)}
          />
        ))}
      </div>
    </HoverCard>
  )
}