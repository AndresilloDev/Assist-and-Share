
interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg"
  className?: string
}

export default function LoadingSpinner({ size = "lg", className = "" }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4 border-[2px]",
    md: "h-8 w-8 border-[3px]",
    lg: "h-12 w-12 border-4"
  }

  // Maintain original padding for large size, but remove it for smaller sizes (buttons etc)
  const containerBase = size === "lg" ? "flex items-center justify-center py-12" : "inline-flex"

  return (
    <div className={`${containerBase} ${className}`}>
      <div className={`animate-spin rounded-full ${sizeClasses[size]} border-white/30 border-t-white`}></div>
    </div>
  )
}