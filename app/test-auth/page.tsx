import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import TestLayout from '@/components/layouts/TestLayout'

export default async function TestAuthPage() {
  const supabase = await createServerSupabaseClient()
  
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    redirect('/login')
  }

  // Recupera i dati del profilo
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single()

  if (profileError) {
    console.error('Errore nel recupero del profilo:', profileError)
  }

  return (
    <TestLayout title="Test Autenticazione">
      <div className="space-y-4 sm:space-y-6">
        <div>
          <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-gray-700">Dati Sessione</h2>
          <div className="bg-gray-50 p-4 sm:p-6 rounded-lg border border-gray-200 overflow-x-auto">
            <pre className="whitespace-pre-wrap text-gray-800 font-mono text-xs sm:text-sm break-words">
              {JSON.stringify(session, null, 2)}
            </pre>
          </div>
        </div>

        {profile && (
          <div>
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-gray-700">Dati Profilo</h2>
            <div className="bg-gray-50 p-4 sm:p-6 rounded-lg border border-gray-200 overflow-x-auto">
              <pre className="whitespace-pre-wrap text-gray-800 font-mono text-xs sm:text-sm break-words">
                {JSON.stringify(profile, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 sm:mt-8 text-center">
        <a 
          href="/protected/test" 
          className="inline-block bg-gray-900 hover:bg-gray-800 text-white font-semibold py-2 sm:py-3 px-4 sm:px-6 rounded-lg transition-colors duration-200"
        >
          Vai alla Pagina Protetta
        </a>
      </div>
    </TestLayout>
  )
} 