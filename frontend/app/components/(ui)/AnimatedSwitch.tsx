"use client"

interface AnimatedSwitchProps {
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
}

export default function AnimatedSwitch({ value, onChange, options }: AnimatedSwitchProps) {
  const activeIndex = options.findIndex((opt) => opt.value === value)

  const buttonWidthPercent = 100 / options.length
  const paddingPx = 3
  const leftPosition = `calc(${activeIndex * buttonWidthPercent}% + ${paddingPx}px)`
  const width = `calc(${buttonWidthPercent}% - ${paddingPx * 2}px)`

  return (
    <div className="relative inline-flex bg-gray-900 border border-gray-800 rounded-full p-1">

      <div
        className="absolute top-1 bottom-1 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-200"
        style={{ left: leftPosition, width }}
      />

      {/* Botones */}
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={`relative z-10 px-6 py-1.5 text-sm font-medium rounded-full transition-colors hover:cursor-pointer ${value === option.value
            ? "text-white"
            : "text-gray-400 hover:text-gray-300"
            }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
