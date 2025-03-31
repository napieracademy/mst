import { createClient } from '@supabase/supabase-js'
import TestLayout from '@/components/layouts/TestLayout'

export default async function SpiritsPage() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  
  const { data: spirits, error } = await supabase
    .from('spirits')
    .select('*')
    .order('name')

  if (error) {
    console.error('Errore nel recupero dei liquori:', error)
  }

  return (
    <TestLayout title="Catalogo Liquori">
      <div className="space-y-4 sm:space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {spirits?.map((spirit) => (
            <div key={spirit.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{spirit.name}</h3>
              <div className="space-y-1 text-sm text-gray-600">
                <p><span className="font-medium">Marca:</span> {spirit.brand}</p>
                <p><span className="font-medium">Categoria:</span> {spirit.category}</p>
                <p><span className="font-medium">Paese:</span> {spirit.country_of_origin}</p>
                <p><span className="font-medium">Gradazione:</span> {spirit.alcohol_content}%</p>
                <p><span className="font-medium">Volume:</span> {spirit.volume_ml}ml</p>
                <p><span className="font-medium">Prezzo:</span> €{spirit.price}</p>
                <p><span className="font-medium">Punteggio:</span> {spirit.rating}/5</p>
                {spirit.description && (
                  <p className="mt-2 text-sm text-gray-500">{spirit.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </TestLayout>
  )
} 