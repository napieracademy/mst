import Link from 'next/link';
import { Container } from "@/components/container";

export const metadata = {
  title: 'Debug Pagine Prerenderizzate | Mastroianni',
  description: 'Strumento di debug per visualizzare le pagine prerenderizzate durante il build',
};

export default function PaginePrerenderizzatePage() {
  return (
    <main className="min-h-screen bg-black text-white pt-20">
      <Container className="py-8">
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-2">
            <Link href="/" className="text-sm text-gray-400 hover:text-white transition-colors">
              Home
            </Link>
            <span className="text-gray-600">/</span>
            <span className="text-sm text-white">
              Admin
            </span>
            <span className="text-gray-600">/</span>
            <span className="text-sm text-yellow-500">
              Pagine Prerenderizzate
            </span>
          </div>
          
          <h1 className="text-3xl font-bold mb-2">
            Pagine Prerenderizzate
          </h1>
          <p className="text-gray-400 mb-8">
            Questa pagina mostra tutte le pagine staticamente prerenderizzate durante il build.
            Queste pagine hanno tempi di caricamento migliorati poiché il rendering avviene lato server.
          </p>
          
          <div className="space-y-8">
            <div className="bg-black text-white rounded-lg border border-gray-800 p-4">
              <h2 className="text-lg font-medium mb-4">Pagine prerenderizzate</h2>
              
              <div className="text-sm text-gray-400 mb-4">
                Versione semplificata per Netlify. Per vedere i dettagli completi, esegui il server in locale.
              </div>
              
              <div className="space-y-2">
                <div className="p-4 border border-gray-800 rounded">
                  <h3 className="text-white font-medium mb-2">Film</h3>
                  <p className="text-gray-400 text-sm">8 pagine prerenderizzate</p>
                </div>
                
                <div className="p-4 border border-gray-800 rounded">
                  <h3 className="text-white font-medium mb-2">Serie TV</h3>
                  <p className="text-gray-400 text-sm">2 pagine prerenderizzate</p>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-gray-900 rounded-lg border border-gray-800">
              <h2 className="text-lg font-medium mb-4">Informazioni sulla Prerenderizzazione</h2>
              <p className="text-sm text-gray-300 mb-4">
                In Next.js, la prerenderizzazione statica avviene durante il build tramite la funzione <code className="bg-black px-1 py-0.5 rounded text-yellow-400">generateStaticParams</code>.
                Nel nostro caso prerenderizziamo:
              </p>
              
              <ul className="list-disc pl-5 space-y-2 text-sm text-gray-300">
                <li>I 10 film più popolari secondo TMDB al momento del build</li>
                <li>Le 10 serie TV più popolari secondo TMDB al momento del build</li>
              </ul>
              
              <p className="text-sm text-gray-300 mt-4">
                Tutte le altre pagine vengono generate on-demand e poi memorizzate in cache (ISR).
                La cache di ISR ha una validità di 1 ora, dopodiché la pagina viene rigenerata.
              </p>
            </div>
          </div>
        </div>
      </Container>
    </main>
  );
} 