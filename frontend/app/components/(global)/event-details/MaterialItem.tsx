"use client"

import { Download, X } from 'lucide-react'

interface Material {
  id: string
  name: string
  type: "pptx" | "xlsx" | "pdf" | "docx"
  uploadDate: string
  url: string
}

interface MaterialItemProps {
  material: Material
  canEdit: boolean
  onRemove: () => void
}

const MATERIAL_ICONS: Record<string, { bg: string; icon: string }> = {
  pptx: { bg: "bg-orange-500", icon: "P" },
  xlsx: { bg: "bg-green-500", icon: "X" },
  pdf: { bg: "bg-red-500", icon: "PDF" },
  docx: { bg: "bg-blue-500", icon: "W" },
}

export default function MaterialItem({ material, canEdit, onRemove }: MaterialItemProps) {
  const iconData = MATERIAL_ICONS[material.type] || MATERIAL_ICONS.pdf

  return (
    <div
      className="group/item relative bg-gray-950 rounded-xl p-4 border border-gray-800 flex items-center justify-between hover:border-gray-700 transition-all duration-300 overflow-hidden"
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top
        e.currentTarget.style.setProperty("--mouse-x", `${x}px`)
        e.currentTarget.style.setProperty("--mouse-y", `${y}px`)
      }}
    >
      <div
        className="pointer-events-none absolute opacity-0 group-hover/item:opacity-100 transition-opacity duration-500 -inset-px rounded-xl"
        style={{
          background:
            "radial-gradient(400px circle at var(--mouse-x) var(--mouse-y), rgba(59, 130, 246, 0.08), transparent 40%)",
        }}
      />
      <div className="relative z-10 flex items-center gap-4">
        <div
          className={`${iconData.bg} w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}
        >
          {iconData.icon}
        </div>
        <div>
          <p className="text-white font-semibold">{material.name}</p>
          <p className="text-gray-400 text-sm">Subido el {material.uploadDate}</p>
        </div>
      </div>
      <div className="relative z-10 flex items-center gap-2">
        <button className="p-2 hover:bg-gray-800 rounded-lg transition-colors duration-300">
          <Download className="text-gray-400 hover:text-white transition-colors" size={20} />
        </button>
        {canEdit && (
          <button
            onClick={onRemove}
            className="p-2 hover:bg-red-900/20 rounded-lg transition-colors duration-300"
          >
            <X className="text-gray-400 hover:text-red-400 transition-colors" size={20} />
          </button>
        )}
      </div>
    </div>
  )
}