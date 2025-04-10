import { Loader2 } from "lucide-react"

type StatusDisplayProps = {
  loading?: boolean
  error?: string | null
  isEmpty?: boolean
  emptyMessage?: string
  onRetry?: () => void
}

export function StatusDisplay({ 
  loading, 
  error, 
  isEmpty, 
  emptyMessage = "Nessun contenuto disponibile", 
  onRetry 
}: StatusDisplayProps) {
  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <p className="text-red-500 text-center font-medium">{error}</p>
        {onRetry && (
          <button 
            onClick={onRetry}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Riprova
          </button>
        )}
      </div>
    )
  }

  if (isEmpty) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <p className="text-gray-500 text-center">{emptyMessage}</p>
      </div>
    )
  }

  return null
}