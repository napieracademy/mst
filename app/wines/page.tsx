import { createClient } from '@supabase/supabase-js'
import TestLayout from '@/components/layouts/TestLayout'

export default async function WinesPage() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  
  const { data: wines, error } = await supabase
    .from('wines')
    .select('*')
    .order('name')

  if (error) {
    console.error('Errore nel recupero dei vini:', error)
  }

  return (
    <TestLayout title="Catalogo Vini">
      <div className="space-y-4 sm:space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {wines?.map((wine) => (
            <div key={wine.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{wine.name}</h3>
              <div className="space-y-1 text-sm text-gray-600">
                <p><span className="font-medium">Regione:</span> {wine.region}</p>
                <p><span className="font-medium">Annata:</span> {wine.vintage}</p>
                <p><span className="font-medium">Tipo:</span> {wine.type}</p>
                <p><span className="font-medium">Prezzo:</span> €{wine.price}</p>
                <p><span className="font-medium">Punteggio:</span> {wine.rating}/100</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </TestLayout>
  )
} 