import { createServerSupabaseClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { generateSlug } from './lib/utils'

/**
 * Middleware semplificato per Netlify Edge Functions
 * 
 * IMPORTANTE: Questo middleware è stato ottimizzato per funzionare con Netlify Edge Functions.
 * Evita chiamate API pesanti e operazioni complesse che potrebbero causare timeout.
 */
export async function middleware(request: NextRequest) {
  try {
    // Ottieni il percorso della richiesta
    const { pathname } = request.nextUrl;

    // Parte 1: Autenticazione per pagine protette
    if (pathname === "/login" || pathname === "/register") {
      const supabase = await createServerSupabaseClient()
      
      // Se supabase non è disponibile, continua normalmente
      if (!supabase) {
        console.log("Middleware: Supabase client non disponibile")
        return NextResponse.next()
      }
      
      // Ottieni la sessione in modo sicuro
      let session = null
      try {
        const { data } = await supabase.auth.getSession()
        session = data.session
      } catch (error) {
        console.warn("Middleware: Errore nel recupero della sessione")
      }

      // Reindirizza utenti già autenticati alla home
      if (session && (pathname === "/login" || pathname === "/register")) {
        console.log("Middleware: Reindirizzamento a home (utente già autenticato)")
        return NextResponse.redirect(new URL("/", request.url))
      }
    }

    // Parte 2: Reindirizzamenti per URL legacy
    // Utilizziamo reindirizzamenti semplificati che non richiedono API esterne
    
    // Vecchi URL pattern da reindirizzare
    const movieRegex = /^\/movie\/(\d+)$/;
    const personRegex = /^\/person\/(\d+)$/;
    const tvRegex = /^\/tv\/(\d+)$/;
    
    let match;

    // Reindirizza /movie/:id a /film/movie-:id (semplificato)
    if ((match = pathname.match(movieRegex))) {
      const id = match[1];
      const slug = `movie-${id}`;
      console.log(`Middleware: Reindirizzamento semplificato film ${id} a /film/${slug}`);
      return NextResponse.redirect(new URL(`/film/${slug}`, request.url), 301);
    }
    
    // Reindirizza /tv/:id a /serie/tv-:id (semplificato)
    if ((match = pathname.match(tvRegex))) {
      const id = match[1];
      const slug = `tv-${id}`;
      console.log(`Middleware: Reindirizzamento semplificato serie ${id} a /serie/${slug}`);
      return NextResponse.redirect(new URL(`/serie/${slug}`, request.url), 301);
    }
    
    // Reindirizza /person/:id a /attore/persona-:id (semplificato)
    if ((match = pathname.match(personRegex))) {
      const id = match[1];
      const slug = `persona-${id}`;
      console.log(`Middleware: Reindirizzamento semplificato persona ${id} a /attore/${slug}`);
      return NextResponse.redirect(new URL(`/attore/${slug}`, request.url), 301);
    }

    return NextResponse.next()
  } catch (error) {
    console.error("Middleware error:", error)
    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    "/login", 
    "/register",
    "/movie/:path*",
    "/person/:id*",
    "/tv/:id*"
  ],
} 