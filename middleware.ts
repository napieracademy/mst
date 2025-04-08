import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getMovieDetails, getPersonDetails } from '@/lib/tmdb'
import { extractIdFromSlug, generateSlug } from '@/lib/utils'

/**
 * Middleware per la gestione dei reindirizzamenti 301 dai vecchi URL ai nuovi
 */
export async function middleware(request: NextRequest) {
  const url = request.nextUrl
  const origin = url.origin || request.headers.get('x-forwarded-host') || request.headers.get('host') || ''
  
  // Mappa dei vecchi percorsi ai nuovi
  const pathMappings: { [key: string]: string } = {
    '/movie': '/film',
    '/person': '/attore',  // Verrà gestito caso per caso se è attore o regista
    '/tv': '/serie'
  }

  // Trova il vecchio percorso che corrisponde all'URL corrente
  const oldPath = Object.keys(pathMappings).find(path => url.pathname.startsWith(path))
  
  if (oldPath) {
    const segments = url.pathname.split('/')
    const idOrSlug = segments[2]
    
    if (!idOrSlug) return NextResponse.next()

    try {
      // Se è un vecchio URL /movie/
      if (oldPath === '/movie') {
        const id = extractIdFromSlug(idOrSlug) || idOrSlug
        const movie = await getMovieDetails(id.toString(), "movie")
        
        if (movie?.title && movie?.release_date) {
          const year = movie.release_date.split('-')[0]
          const newSlug = generateSlug(movie.title, year, id)
          const response = NextResponse.redirect(new URL(`/film/${newSlug}`, request.url), 301)
          response.headers.set('Link', `<${origin}/film/${newSlug}>; rel="canonical"`)
          return response
        }
      }
      
      // Se è un vecchio URL /person/
      if (oldPath === '/person') {
        const id = extractIdFromSlug(idOrSlug) || idOrSlug
        // Convertiamo l'ID in numero per getPersonDetails
        const numericId = typeof id === 'string' ? parseInt(id, 10) : id
        const person = await getPersonDetails(numericId)
        
        if (person) {
          // Determina se la persona è principalmente un regista o un attore
          const isDirector = person.known_for_department === 'Directing'
          const newPath = isDirector ? '/regista' : '/attore'
          
          const newSlug = generateSlug(person.name, null, id)
          const response = NextResponse.redirect(new URL(`${newPath}/${newSlug}`, request.url), 301)
          response.headers.set('Link', `<${origin}${newPath}/${newSlug}>; rel="canonical"`)
          return response
        }
      }
      
      // Se è un vecchio URL /tv/
      if (oldPath === '/tv') {
        const id = extractIdFromSlug(idOrSlug) || idOrSlug
        const show = await getMovieDetails(id.toString(), "tv")
        
        if (show?.name && show?.first_air_date) {
          const year = show.first_air_date.split('-')[0]
          const newSlug = generateSlug(show.name, year, id)
          const response = NextResponse.redirect(new URL(`/serie/${newSlug}`, request.url), 301)
          response.headers.set('Link', `<${origin}/serie/${newSlug}>; rel="canonical"`)
          return response
        }
      }

      // Se non riusciamo a ottenere i dettagli, reindirizza al nuovo percorso mantenendo lo slug/id
      const newPath = pathMappings[oldPath]
      return NextResponse.redirect(new URL(`${newPath}/${idOrSlug}`, request.url), 301)
    } catch (error) {
      console.error(`Errore nel reindirizzamento ${oldPath}:`, error)
      // In caso di errore, reindirizza al nuovo percorso mantenendo lo slug/id
      const newPath = pathMappings[oldPath]
      return NextResponse.redirect(new URL(`${newPath}/${idOrSlug}`, request.url), 301)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/movie/:path*',
    '/person/:path*',
    '/tv/:path*'
  ]
} 