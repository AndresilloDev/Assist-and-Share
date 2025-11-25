"use client"

import { ReactNode } from "react"

interface HoverCardProps {
  children: ReactNode
  className?: string
}

export default function HoverCard({ children, className = "" }: HoverCardProps) {
  return (
    <div
      className={`group relative bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden transition-all duration-300 hover:border-gray-700 ${className}`}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top
        e.currentTarget.style.setProperty("--mouse-x", `${x}px`)
        e.currentTarget.style.setProperty("--mouse-y", `${y}px`)
      }}
    >
      <div
        className="pointer-events-none absolute opacity-0 group-hover:opacity-100 transition-opacity duration-500 -inset-px rounded-2xl"
        style={{
          background:
            "radial-gradient(600px circle at var(--mouse-x) var(--mouse-y), rgba(59, 130, 246, 0.1), transparent 40%)",
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  )
}