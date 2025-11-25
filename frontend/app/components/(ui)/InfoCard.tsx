"use client"

import { ReactNode } from "react"

interface InfoCardProps {
  icon: ReactNode
  text: string
  label?: string
}

export default function InfoCard({ icon, text, label }: InfoCardProps) {
  return (
    <div
      className="group relative bg-gray-900 border border-gray-800 rounded-xl p-4 overflow-hidden transition-all duration-300 hover:border-gray-700"
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top
        e.currentTarget.style.setProperty("--mouse-x", `${x}px`)
        e.currentTarget.style.setProperty("--mouse-y", `${y}px`)
      }}
    >
      <div
        className="pointer-events-none absolute opacity-0 group-hover:opacity-100 transition-opacity duration-500 -inset-px rounded-xl"
        style={{
          background:
            "radial-gradient(400px circle at var(--mouse-x) var(--mouse-y), rgba(59, 130, 246, 0.12), transparent 40%)",
        }}
      />
      <div className="relative z-10 flex items-center gap-3">
        {icon}
        <div>
          {label && <p className="text-sm font-medium text-gray-400">{label}</p>}
          <p className="text-sm text-white capitalize">{text}</p>
        </div>
      </div>
    </div>
  )
}