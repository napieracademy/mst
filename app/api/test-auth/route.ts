import { createServerSupabaseClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient()
    
    // Test della sessione utente
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError) {
      console.error('Errore sessione:', sessionError)
      return NextResponse.json({ 
        status: 'error', 
        message: 'Errore nel recupero della sessione',
        error: sessionError.message 
      }, { status: 500 })
    }

    // Test della tabella profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1)

    if (profilesError) {
      console.error('Errore profiles:', profilesError)
      return NextResponse.json({ 
        status: 'error', 
        message: 'Errore nella connessione a profiles',
        error: profilesError.message 
      }, { status: 500 })
    }

    return NextResponse.json({ 
      status: 'success', 
      message: 'Connessione a Supabase stabilita con successo!',
      data: {
        session: session ? {
          user: {
            id: session.user.id,
            email: session.user.email,
            role: session.user.role
          }
        } : null,
        profiles
      }
    })
  } catch (error) {
    console.error('Errore generale:', error)
    return NextResponse.json({ 
      status: 'error', 
      message: 'Errore nella connessione a Supabase',
      error: error instanceof Error ? error.message : 'Errore sconosciuto'
    }, { status: 500 })
  }
} 