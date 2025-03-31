import { createClient } from '@supabase/supabase-js'
import TestLayout from '@/components/layouts/TestLayout'

export default async function BeersPage() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  
  const { data: beers, error } = await supabase
    .from('beers')
    .select('*')
    .order('name')

  if (error) {
    console.error('Errore nel recupero delle birre:', error)
  }

  return (
    <TestLayout title="Catalogo Birre">
      <div className="space-y-4 sm:space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {beers?.map((beer) => (
            <div key={beer.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{beer.name}</h3>
              <div className="space-y-1 text-sm text-gray-600">
                <p><span className="font-medium">Birrificio:</span> {beer.brewery}</p>
                <p><span className="font-medium">Stile:</span> {beer.style}</p>
                <p><span className="font-medium">Gradazione:</span> {beer.abv}%</p>
                <p><span className="font-medium">IBU:</span> {beer.ibu}</p>
                <p><span className="font-medium">Prezzo:</span> €{beer.price}</p>
                <p><span className="font-medium">Punteggio:</span> {beer.rating}/5</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </TestLayout>
  )
} 