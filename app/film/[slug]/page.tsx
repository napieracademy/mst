import { notFound, redirect } from 'next/navigation';
import { extractIdFromSlug, isValidFilm, slugify } from '@/lib/utils';
import { getMovieDetails, getTrailers, getSimilarMovies, getPopularMovies } from "@/lib/tmdb";
import { MoviePageClient } from '@/app/movie/[id]/page-client';
import fs from 'fs';
import path from 'path';
import FilmSEO from '@/app/components/seo/film-seo';
import { hasRequiredData, generateErrorUrl } from '@/lib/error-utils';

export async function generateStaticParams() {
  try {
    console.log("Inizia la generazione dei parametri statici per i film");
    
    // Ottieni i film popolari per prerendere le pagine più richieste
    const popularMovies = await getPopularMovies();
    console.log(`Ottenuti ${popularMovies.length} film popolari`);
    
    // Prepara i parametri per i primi 10 film popolari
    const params = [];
    
    // Esamina i primi 20 film popolari (per assicurarsi di trovarne almeno 10 validi)
    for (const movie of popularMovies.slice(0, 20)) {
      if (params.length >= 10) break; // Ferma una volta raggiunto il limite di 10 film
      
      const id = movie.id?.toString();
      if (!id) continue;
      
      try {
        // Ottieni dettagli completi necessari per la validazione
        console.log(`Recupero dettagli completi per il film ID: ${id}`);
        const fullMovie = await getMovieDetails(id, "movie");
        
        // Verifica che il film sia valido per la generazione statica
        if (!fullMovie || !isValidFilm(fullMovie)) {
          console.log(`Film saltato (non valido): ${movie.title} (ID: ${id})`);
          continue;
        }
        
        const title = fullMovie.title || 'Film';
        const year = fullMovie.release_date ? fullMovie.release_date.split('-')[0] : new Date().getFullYear().toString();
        const slug = `${slugify(title)}-${year}-${id}`;
        
        console.log(`Generazione parametri per: ${slug}`);
        params.push({ slug });
      } catch (error) {
        console.error(`Errore durante il recupero dettagli del film ID ${id}:`, error);
        continue; // Salta questo film e passa al successivo
      }
    }
    
    console.log(`Generati ${params.length} parametri statici per film popolari`);
    return params;
  } catch (error) {
    console.error('Errore nella generazione dei parametri statici:', error);
    return []; 
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const slug = params.slug;
  const id = extractIdFromSlug(slug);
  if (!id) {
    return {
      title: 'Film non trovato',
      description: 'Il film richiesto non è disponibile'
    };
  }

  try {
    const movie = await getMovieDetails(id, "movie");
    
    if (!movie || !isValidFilm(movie)) {
      return {
        title: 'Film non trovato',
        description: 'Il film richiesto non è disponibile o non contiene informazioni complete'
      };
    }

    return {
      title: `${movie.title || "Film"} | Mastroianni`,
      description: movie.overview?.slice(0, 150) || 'Scheda film su Mastroianni'
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: "Errore | Mastroianni",
      description: "Si è verificato un errore durante il caricamento della pagina",
    };
  }
}

export default async function FilmPage({ params }: { params: { slug: string } }) {
  // Verifica se la pagina è stata già generata fisicamente
  // Nota: questo funziona solo in produzione, non in sviluppo
  const isProduction = process.env.NODE_ENV === 'production';
  const slug = params.slug;
  let pageWasPrerendered = false;
  
  if (isProduction) {
    try {
      // Percorso dove Next.js archivia le pagine pre-renderizzate
      const pageDir = path.join(process.cwd(), '.next', 'server', 'app', 'film');
      const fileExists = fs.existsSync(path.join(pageDir, `${slug}.html`));
      
      if (fileExists) {
        console.log(`☑️ Pagina film ${slug} trovata come file pre-renderizzato`);
        pageWasPrerendered = true;
      } else {
        console.log(`🆕 Pagina film ${slug} non trovata, verrà generata on-demand`);
        
        // Log anche di tutti i file presenti nella directory per debug
        try {
          const existingFiles = fs.readdirSync(pageDir);
          console.log(`File presenti nella directory delle pagine film:`, existingFiles.filter(f => f.endsWith('.html')).join(', '));
        } catch (e) {
          console.error(`Impossibile leggere la directory delle pagine:`, e);
        }
      }
    } catch (err) {
      console.error(`Errore nel controllo se la pagina ${slug} è già generata:`, err);
    }
  }

  const id = extractIdFromSlug(slug);
  if (!id) {
    console.log("ID film non trovato, reindirizzamento...");
    return redirect("/data-error?title=Film%20non%20trovato&message=ID%20non%20trovato&redirectPath=/");
  }

  try {
    const movie = await getMovieDetails(id, "movie");
    
    // Verifica che il film abbia tutti i dati necessari
    if (!movie) {
      console.log("Oggetto film mancante, reindirizzamento...");
      return redirect("/data-error?title=Film%20non%20trovato&message=Dati%20film%20mancanti&redirectPath=/");
    }
    
    // Definiamo i campi richiesti per un film (solo id e title)
    const requiredFields = ['id', 'title'] as (keyof typeof movie)[];
    const { isValid, missingFields } = hasRequiredData(movie, requiredFields);
    
    if (!isValid) {
      console.log("DATI FILM MANCANTI (ID: " + id + "):", missingFields);
      console.log("Dettagli film disponibili:", {
        id: movie.id,
        title: movie.title || "(mancante)",
        release_date: movie.release_date || "(mancante)",
        overview: movie.overview ? (movie.overview.substring(0, 50) + "...") : "(mancante)",
        poster_path: movie.poster_path || "(mancante)", 
        backdrop_path: movie.backdrop_path || "(mancante)"
      });
      
      // URL hardcoded per semplicità
      const errorUrl = "/data-error?title=Dati%20film%20insufficienti&message=Dati%20film%20incompleti&redirectPath=/";
      return redirect(errorUrl);
    }
    
    // Ottieni dati correlati
    const trailers = await getTrailers(id, "movie").catch(() => []) || [];
    const similarMovies = await getSimilarMovies(id, "movie").catch(() => []) || [];
    
    // Prepara dati per il rendering
    const checkImagePath = (path: string | null | undefined): boolean => {
      return !!path && typeof path === 'string' && path.startsWith('/');
    };

    const backdropUrl = checkImagePath(movie.backdrop_path) 
      ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
      : null;

    const posterUrl = checkImagePath(movie.poster_path)
      ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
      : "/placeholder.svg?height=750&width=500";

    const releaseDate = movie.release_date
      ? new Date(movie.release_date).toLocaleDateString("it-IT", {
          day: "numeric", month: "long", year: "numeric"
        })
      : null;

    const releaseYear = movie.release_date ? movie.release_date.split("-")[0] : null;
    const director = movie.credits?.crew?.find((person) => person.job === "Director") || null;
    const writers = movie.credits?.crew?.filter((person) => ["Writer", "Screenplay"].includes(person.job)) || [];
    const producers = movie.credits?.crew?.filter((person) => ["Producer", "Executive Producer"].includes(person.job)) || [];

    // Se siamo arrivati qui e la pagina non era pre-renderizzata, la stiamo generando on-demand
    if (!pageWasPrerendered && isProduction) {
      console.log(`🔄 Rendering on-demand per la pagina film ${slug} (ID: ${id})`);
    }

    return (
      <>
        <FilmSEO 
          title={movie.title || 'Film'}
          overview={movie.overview || ''}
          posterUrl={posterUrl}
          releaseDate={movie.release_date}
          director={director}
          genres={movie.genres}
        />
        <MoviePageClient
          movie={movie}
          posterUrl={posterUrl}
          backdropUrl={backdropUrl}
          releaseDate={releaseDate}
          releaseYear={releaseYear}
          trailers={trailers}
          similarMovies={similarMovies}
          id={id}
          director={director}
          writers={writers}
          producers={producers}
        />
      </>
    );
  } catch (error) {
    console.error("Error rendering film page:", error);
    return redirect("/data-error?title=Errore&message=Errore%20durante%20il%20caricamento&redirectPath=/");
  }
}

// Configurazione ISR
export const dynamicParams = true;
export const revalidate = 3600; // 1 ora 