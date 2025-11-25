"use client"

import { useState, useRef, useEffect } from "react"

interface Option {
  value: string
  label: string
  className?: string
}

interface CustomSelectProps {
  value: string
  onChange: (value: string) => void
  options: Option[]
  placeholder?: string
  disabled?: boolean
}

export default function CustomSelect({
  value,
  onChange,
  options,
  placeholder = "Seleccionar",
  disabled = false,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const selectedOption = options.find((opt) => opt.value === value)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`group w-full relative bg-gray-900 border border-gray-800 rounded-xl px-5 py-3 text-left hover:border-gray-700 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10 ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
          }`}
      >
        <div className="flex items-center justify-between gap-3">
          <span className={`text-sm font-medium truncate ${selectedOption ? "text-white" : "text-gray-500"}`}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <svg
            className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
        {!disabled && (
          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        )}
      </button>

      {isOpen && (
        <>
          {/* AQUÍ ESTÁ LA MAGIA DEL SCROLLBAR:
              Usamos [&::-webkit-scrollbar] para personalizarlo directamente con Tailwind
          */}
          <div className="absolute top-full mt-2 left-0 right-0 bg-[#0B1121] border border-gray-800 rounded-xl overflow-hidden z-50 shadow-2xl shadow-black/50 animate-in fade-in slide-in-from-top-2 duration-200 max-h-60 overflow-y-auto
            [&::-webkit-scrollbar]:w-2
            [&::-webkit-scrollbar-track]:bg-gray-900/50
            [&::-webkit-scrollbar-thumb]:bg-gray-700
            [&::-webkit-scrollbar-thumb]:rounded-full
            [&::-webkit-scrollbar-thumb]:border-2
            [&::-webkit-scrollbar-thumb]:border-transparent
            [&::-webkit-scrollbar-thumb]:bg-clip-content
            hover:[&::-webkit-scrollbar-thumb]:bg-gray-600
          ">
            {options.length > 0 ? options.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onChange(option.value)
                  setIsOpen(false)
                }}
                className={`w-full px-5 py-3 text-left text-sm transition-all duration-200 border-b border-gray-800/50 last:border-0
                  ${value === option.value
                    ? "bg-blue-600/10 text-blue-400 font-medium"
                    : "text-gray-400 hover:text-white hover:bg-gray-800"
                  }
                  ${option.className || ""} 
                `}
              >
                {option.label}
              </button>
            )) : (
              <div className="px-5 py-3 text-sm text-gray-500 text-center">No hay opciones disponibles</div>
            )}
          </div>
        </>
      )}
    </div>
  )
}