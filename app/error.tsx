"use client"

import { useEffect } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Application error:", error)
  }, [error])

  return (
    <main className="min-h-screen bg-black text-white">
      <Header />
      <div className="max-w-[1100px] mx-auto px-4 py-12 mt-16 flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold mb-4">Qualcosa è andato storto</h1>
        <p className="text-gray-400 mb-8 text-center max-w-md">
          Si è verificato un errore durante il caricamento della pagina.
        </p>
        {error.digest && <p className="text-sm text-gray-500 mb-6">Digest errore: {error.digest}</p>}
        <button onClick={reset} className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg transition-colors">
          Riprova
        </button>
      </div>
      <Footer />
    </main>
  )
}

