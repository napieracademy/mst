import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Middleware per la gestione delle richieste
 * Gestisce:
 * - Reindirizzamenti
 * - Protezione delle route
 */
export function middleware(request: NextRequest) {
  // Implementa qui la logica del middleware
  return NextResponse.next()
}

export const config = {
  matcher: [
    // Aggiungi qui i pattern delle route da gestire
  ]
} 