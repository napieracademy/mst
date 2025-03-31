import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'

export default async function AuthCallbackPage() {
  const supabase = await createServerSupabaseClient()
  
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white p-6 rounded-lg shadow">
          <h1 className="text-2xl font-bold mb-6">Login Effettuato con Successo!</h1>
          
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold mb-2">Informazioni Utente</h2>
              <div className="bg-gray-50 p-4 rounded">
                <p><strong>Email:</strong> {session.user.email}</p>
                <p><strong>ID:</strong> {session.user.id}</p>
                <p><strong>Data di Creazione:</strong> {new Date(session.user.created_at).toLocaleString()}</p>
              </div>
            </div>

            <div className="mt-6">
              <a 
                href="/protected/test" 
                className="inline-block bg-[#0C7DBC] text-white px-6 py-2 rounded hover:bg-[#0C7DBC]/90 transition-colors"
              >
                Vai alla Pagina Protetta
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 