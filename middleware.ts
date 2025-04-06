import { createServerSupabaseClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getMovieDetails } from './lib/tmdb'
import { generateSlug } from './lib/utils'

export async function middleware(request: NextRequest) {
  try {
    // Middleware semplificato per compatibilità con Netlify Edge Functions
    // Gestione dell'autenticazione
    const supabase = await createServerSupabaseClient()
    
    // Se supabase è null, continua con la richiesta
    if (!supabase) {
      console.log("Middleware: Supabase client non disponibile, continuando...")
      return NextResponse.next()
    }
    
    // Ottieni la sessione in modo sicuro
    let session = null
    try {
      const { data } = await supabase.auth.getSession()
      session = data.session
    } catch (error) {
      console.warn("Middleware: Errore nel recupero della sessione:", error)
    }

    // Se l'utente non è autenticato e sta cercando di accedere a una rotta protetta
    if (!session && request.nextUrl.pathname.startsWith("/wines")) {
      console.log("Middleware: Reindirizzamento a login (utente non autenticato)")
      return NextResponse.redirect(new URL("/login", request.url))
    }

    // Se l'utente è autenticato e sta cercando di accedere a login/register
    if (session && (request.nextUrl.pathname === "/login" || request.nextUrl.pathname === "/register")) {
      console.log("Middleware: Reindirizzamento a wines (utente già autenticato)")
      return NextResponse.redirect(new URL("/wines", request.url))
    }

    // Ottieni il percorso della richiesta
    const { pathname } = request.nextUrl;

    // Verifica se il percorso è un vecchio URL con solo ID per film, attori, registi
    // movie/123 -> film/titolo-anno-123
    // person/123 -> attore/nome-123 o regista/nome-123
    // tv/123 -> serie/titolo-anno-123
    
    const movieRegex = /^\/movie\/(\d+)$/;
    const personRegex = /^\/person\/(\d+)$/;
    const tvRegex = /^\/tv\/(\d+)$/;
    
    let match;

    // Reindirizza /movie/:id a /film/:slug
    if ((match = pathname.match(movieRegex))) {
      const id = match[1];
      try {
        // Ottieni i dettagli del film per generare lo slug
        const movie = await getMovieDetails(id, "movie");
        if (movie && movie.title) {
          const year = movie.release_date ? movie.release_date.split('-')[0] : null;
          const slug = generateSlug(movie.title, year, id);
          
          // Reindirizzamento permanente (301) alla nuova URL SEO-friendly
          return NextResponse.redirect(new URL(`/film/${slug}`, request.url), 301);
        }
      } catch (error) {
        console.error(`Errore nel reindirizzamento del film ${id}:`, error);
      }
    }
    
    // Reindirizza /tv/:id a /serie/:slug
    if ((match = pathname.match(tvRegex))) {
      const id = match[1];
      try {
        // Ottieni i dettagli della serie TV per generare lo slug
        const show = await getMovieDetails(id, "tv");
        if (show && show.name) {
          const year = show.first_air_date ? show.first_air_date.split('-')[0] : null;
          const slug = generateSlug(show.name, year, id);
          
          // Reindirizzamento permanente (301) alla nuova URL SEO-friendly
          return NextResponse.redirect(new URL(`/serie/${slug}`, request.url), 301);
        }
      } catch (error) {
        console.error(`Errore nel reindirizzamento della serie ${id}:`, error);
      }
    }
    
    // Reindirizza /person/:id a /attore/:slug o /regista/:slug
    // Per semplicità, reindirizzamo tutti a /attore/:slug
    if ((match = pathname.match(personRegex))) {
      const id = match[1];
      try {
        // Per Netlify, evitiamo chiamate API nel middleware per person
        // Reindirizzamento semplificato con solo ID, il nome verrà recuperato lato pagina
        const slug = `persona-${id}`;
        console.log(`Middleware: Reindirizzamento semplificato persona ${id} a /attore/${slug}`);
        return NextResponse.redirect(new URL(`/attore/${slug}`, request.url), 301);
      } catch (error) {
        console.error(`Errore nel reindirizzamento della persona ${id}:`, error);
      }
    }

    return NextResponse.next()
  } catch (error) {
    console.error("Middleware error:", error)
    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    "/wines/:path*", 
    "/login", 
    "/register",
    "/movie/:id*",
    "/person/:id*",
    "/tv/:id*"
  ],
} 