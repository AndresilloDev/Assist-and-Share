interface ErrorDisplayProps {
  message: string
}

export default function ErrorDisplay({ message }: ErrorDisplayProps) {
  return (
    <div className="bg-red-900/50 border border-red-700 rounded-lg p-4 mb-8">
      <p className="text-red-200">{message}</p>
    </div>
  )
}