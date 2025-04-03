import { generateSlug } from './utils';
import * as tmdb from './tmdb';

interface ContentItem {
  id: number;
  title: string;
  name?: string;
  release_date?: string;
  first_air_date?: string;
  poster_path: string | null;
}

/**
 * Recupera i dati essenziali per generare pagine statiche
 * @param type Tipo di contenuto (movie, person)
 * @returns Array di item con dati essenziali + slug
 */
export async function getEssentialContentData(type: 'movie' | 'person'): Promise<{
  id: number;
  title: string;
  year: string | null;
  poster: string | null;
  slug: string;
}[]> {
  // Qui integriamo con l'API TMDB esistente
  let data;
  
  try {
    // Utilizziamo le funzioni appropriate dal modulo tmdb
    if (type === 'movie') {
      data = await tmdb.getPopularMovies();
    } else {
      // Questo è un caso base, potrebbe essere necessario implementare una funzione dedicata in tmdb.ts
      const popularPeople = await fetch(`https://api.themoviedb.org/3/person/popular?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&language=it-IT`)
        .then(res => res.json());
      data = popularPeople.results || [];
    }
    
    // Mappa solo i dati essenziali che servono
    return data.map((item: ContentItem) => {
      const title = item.title || item.name || 'Senza titolo';
      const dateString = item.release_date || item.first_air_date;
      const year = dateString ? dateString.split('-')[0] : null;
      
      return {
        id: item.id,
        title,
        year,
        poster: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : null,
        slug: generateSlug(title, year, item.id)
      };
    });
  } catch (error) {
    console.error("Error fetching content data:", error);
    return [];
  }
} 