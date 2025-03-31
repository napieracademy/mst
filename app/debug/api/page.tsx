import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ApiTestButton } from "@/components/api-test-button"

export default function ApiDebugPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <Header />
      <div className="max-w-[1100px] mx-auto px-4 py-12 mt-16">
        <h1 className="text-3xl font-bold mb-8">Debug API</h1>
        <p className="mb-6">
          Questa pagina ti permette di testare le API routes per verificare che funzionino correttamente.
        </p>

        <ApiTestButton />
      </div>
      <Footer />
    </main>
  )
}

