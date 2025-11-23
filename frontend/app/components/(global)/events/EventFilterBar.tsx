"use client"

import { useMemo } from "react"
import CustomSelect from "@/app/components/(ui)/CustomSelect"

// --- Definición de Interfaces ---

interface Presenter {
  _id: string
  first_name: string
  last_name: string
  email: string
}

interface EventFilterBarProps {
  typeFilter: string
  onTypeChange: (value: string) => void
  presenterFilter: string
  onPresenterChange: (value: string) => void
  presenters: Presenter[]
}

// --- Componente Principal ---

export default function EventFilterBar({
  typeFilter,
  onTypeChange,
  presenterFilter,
  onPresenterChange,
  presenters,
}: EventFilterBarProps) {

  const presenterOptions = useMemo(() => {
    return [
      { value: "all", label: "Todos los ponentes" },
      ...presenters.map((presenter) => ({
        value: presenter._id,
        label: `${presenter.first_name} ${presenter.last_name}`,
      })),
    ]
  }, [presenters])

  return (
    // Se usa flex-col en móvil y flex-row en sm para arriba
    <div className="flex flex-col sm:flex-row flex-wrap gap-4 mb-8">
      {/* Contenedores envolventes para forzar ancho completo en móvil si el CustomSelect no lo hace por defecto */}
      <div className="w-full sm:w-auto min-w-[200px]">
        <CustomSelect
          value={typeFilter}
          onChange={onTypeChange}
          options={[
            { value: "all", label: "Todos los tipos" },
            { value: "workshop", label: "Taller" },
            { value: "conference", label: "Conferencia" },
            { value: "seminar", label: "Seminario" },
          ]}
          placeholder="Tipo de evento"
        />
      </div>

      <div className="w-full sm:w-auto min-w-[200px]">
        <CustomSelect
          value={presenterFilter}
          onChange={onPresenterChange}
          options={presenterOptions}
          placeholder="Ponente"
        />
      </div>
    </div>
  )
}