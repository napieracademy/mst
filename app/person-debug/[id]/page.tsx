import { Footer } from "@/components/footer"
import { Header } from "@/components/header"
import { getPersonDetails } from "@/lib/tmdb"

export default async function PersonDebugPage({ params }: { params: { id: string } }) {
  // Recupera i dati della persona ma non li processa, li mostra solo per debug
  const personData = await getPersonDetails(params.id)

  return (
    <main className="min-h-screen bg-black text-white">
      <Header />
      <div className="max-w-[1100px] mx-auto px-4 py-12 mt-16">
        <h1 className="text-3xl font-bold mb-6">Debug Persona (ID: {params.id})</h1>

        <div className="bg-gray-900 p-6 rounded-lg mb-8">
          <h2 className="text-xl font-semibold mb-4">Dati grezzi</h2>
          {personData ? (
            <pre className="bg-gray-800 p-4 rounded overflow-auto max-h-[600px] text-sm">
              {JSON.stringify(personData, null, 2)}
            </pre>
          ) : (
            <div className="bg-red-900/20 border border-red-500 rounded-lg p-4">
              <h3 className="font-semibold text-red-400 mb-2">Errore</h3>
              <p>Nessun dato disponibile per questa persona.</p>
            </div>
          )}
        </div>

        <div className="bg-gray-900 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Struttura dati</h2>
          <div className="space-y-4">
            {personData && (
              <>
                <div className="p-4 bg-gray-800 rounded-lg">
                  <h3 className="font-medium">Proprietà principali</h3>
                  <ul className="mt-2 space-y-1">
                    {Object.keys(personData).map((key) => (
                      <li key={key} className="text-sm">
                        <span className="text-blue-400">{key}:</span>{" "}
                        <span className="text-gray-400">
                          {typeof personData[key] === "object"
                            ? Array.isArray(personData[key])
                              ? `Array (${personData[key].length} items)`
                              : personData[key]
                                ? "Object"
                                : "null"
                            : String(personData[key])}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {personData.combined_credits && (
                  <div className="p-4 bg-gray-800 rounded-lg">
                    <h3 className="font-medium">Credits</h3>
                    <ul className="mt-2 space-y-1">
                      <li className="text-sm">
                        <span className="text-blue-400">cast:</span>{" "}
                        <span className="text-gray-400">
                          {personData.combined_credits.cast
                            ? `Array (${personData.combined_credits.cast.length} items)`
                            : "null"}
                        </span>
                      </li>
                      <li className="text-sm">
                        <span className="text-blue-400">crew:</span>{" "}
                        <span className="text-gray-400">
                          {personData.combined_credits.crew
                            ? `Array (${personData.combined_credits.crew.length} items)`
                            : "null"}
                        </span>
                      </li>
                    </ul>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}

