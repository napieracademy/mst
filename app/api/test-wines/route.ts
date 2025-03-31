import { createApiSupabaseClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = createApiSupabaseClient()
    
    const { data, error } = await supabase
      .from('wines')
      .select('*')
      .limit(5)

    if (error) {
      console.error('Errore Supabase:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Tabella wines accessibile',
      count: data?.length,
      wines: data 
    })
  } catch (error) {
    console.error('Errore server:', error)
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 })
  }
} 