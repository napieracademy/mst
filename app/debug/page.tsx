import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { TMDBTester } from "@/components/tmdb-tester"
import { ApiToggle } from "@/components/api-toggle"

export default function DebugPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <Header />
      <div className="max-w-[1100px] mx-auto px-4 py-8 mt-16">
        <h1 className="text-3xl font-bold mb-6">Debug TMDB API</h1>

        <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-4 mb-8">
          <h2 className="text-xl font-semibold mb-2">Informazioni</h2>
          <p className="mb-2">
            Questa pagina ti permette di testare la connessione all'API TMDB e verificare che la tua chiave API funzioni
            correttamente.
          </p>
          <p>Se vedi errori 401, significa che la chiave API non è valida o non è configurata correttamente.</p>
          <p className="mt-2">
            <strong>Chiave API configurata:</strong> {process.env.TMDB_API_KEY ? "Sì" : "No"}
          </p>
        </div>

        <div className="mb-8">
          <ApiToggle />
        </div>

        <TMDBTester />
      </div>
      <Footer />
    </main>
  )
}

