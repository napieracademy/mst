import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default function NotFound() {
  return (
    <main className="min-h-screen bg-black text-white">
      <Header />
      <div className="max-w-[1100px] mx-auto px-4 py-16 flex flex-col items-center justify-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-4">404</h1>
        <p className="text-xl md:text-2xl mb-8">Pagina non trovata</p>
        <p className="text-gray-400 mb-8 text-center max-w-md">
          La pagina che stai cercando non esiste o è stata spostata.
        </p>
        <Link href="/" className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg transition-colors">
          Torna alla home
        </Link>
      </div>
      <Footer />
    </main>
  )
}

