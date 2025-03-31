import { createClient } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = createClient()
    
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
      data 
    })
  } catch (error) {
    console.error('Errore generale:', error)
    return NextResponse.json({ 
      status: 'error', 
      message: 'Errore nella connessione a Supabase' 
    }, { status: 500 })
  }
} 