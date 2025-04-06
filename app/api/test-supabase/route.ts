import { createClient } from '@/lib/supabase'
import { createApiSupabaseClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Utilizziamo il client API ottimizzato invece del client browser
    // Il client API è più adatto per endpoint di backend
    const supabase = createApiSupabaseClient()
    
    if (!supabase) {
      return NextResponse.json({ 
        status: 'error', 
        message: 'Impossibile creare il client Supabase. Verifica le variabili d\'ambiente.'
      }, { status: 500 })
    }
    
    // Prova a fare una query semplice
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .limit(1)
    
    if (error) {
      console.error('Errore Supabase:', error)
      return NextResponse.json({ 
        status: 'error', 
        message: error.message 
      }, { status: 500 })
    }

    return NextResponse.json({ 
      status: 'success', 
      message: 'Connessione a Supabase stabilita con successo!',
      data,
      client_type: 'api_client' 
    })
  } catch (error) {
    console.error('Errore generale:', error)
    return NextResponse.json({ 
      status: 'error', 
      message: 'Errore nella connessione a Supabase' 
    }, { status: 500 })
  }
} 