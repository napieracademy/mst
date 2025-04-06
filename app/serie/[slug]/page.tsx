import { notFound, redirect } from 'next/navigation';
import { extractIdFromSlug, isValidShow, slugify } from '@/lib/utils';
import { getMovieDetails, getTrailers, getPopularTVShows } from "@/lib/tmdb";
import { TVPageClient } from '@/app/tv/[id]/page-client';
import fs from 'fs';
import path from 'path';
import SerieSEO from '@/app/components/seo/serie-seo';
import { hasRequiredData, generateErrorUrl } from '@/lib/error-utils';
import { trackGeneratedPage } from '@/lib/page-tracking';

export async function generateStaticParams() {
  try {
    console.log("Inizia la generazione dei parametri statici per le serie TV");
    
    // Ottieni le serie TV popolari per prerendere le pagine più richieste
    const popularShows = await getPopularTVShows();
    console.log(`Ottenute ${popularShows.length} serie TV popolari`);
    
    // Prepara i parametri per le prime 10 serie popolari
    const params = [];
    
    // Esamina le prime 20 serie popolari (per assicurarsi di trovarne almeno 10 valide)
    for (const show of popularShows.slice(0, 20)) {
      if (params.length >= 10) break; // Ferma una volta raggiunto il limite di 10 serie
      
      const id = show.id?.toString();
      if (!id) continue;
      
      try {
        // Ottieni dettagli completi necessari per la validazione
        console.log(`Recupero dettagli completi per la serie TV ID: ${id}`);
        const fullShow = await getMovieDetails(id, "tv");
        
        // Verifica che la serie sia valida per la generazione statica
        if (!fullShow || !isValidShow(fullShow)) {
          console.log(`Serie saltata (non valida): ${show.name} (ID: ${id})`);
          continue;
        }
        
        const title = fullShow.name || 'Serie TV';
        const year = fullShow.first_air_date ? fullShow.first_air_date.split('-')[0] : new Date().getFullYear().toString();
        const slug = `${slugify(title)}-${year}-${id}`;
        
        console.log(`Generazione parametri per: ${slug}`);
        params.push({ slug });
        
        // Registra la pagina come generata staticamente
        // Il try/catch è interno alla funzione, quindi non bloccherà in caso di errore
        trackGeneratedPage(slug, 'serie', true);
      } catch (error) {
        console.error(`Errore durante il recupero dettagli della serie ID ${id}:`, error);
        continue; // Salta questa serie e passa alla successiva
      }
    }
    
    console.log(`Generati ${params.length} parametri statici per serie TV popolari`);
    return params;
  } catch (error) {
    // In ambiente di build, log minimo
    if (process.env.NODE_ENV !== 'production' && process.env.NEXT_PHASE !== 'build') {
      console.warn('Errore nella generazione dei parametri statici:', error instanceof Error ? error.message : error);
    }
    return []; 
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const slug = params.slug;
  const id = extractIdFromSlug(slug);
  if (!id) {
    return {
      title: 'Serie TV non trovata',
      description: 'La serie TV richiesta non è disponibile'
    };
  }

  try {
    const show = await getMovieDetails(id, "tv");
    
    if (!show) {
      return {
        title: 'Serie TV non trovata',
        description: 'La serie TV richiesta non è disponibile o non contiene informazioni complete'
      };
    }

    return {
      title: `${show.name || "Serie TV"} | Mastroianni`,
      description: show.overview?.slice(0, 150) || 'Scheda serie TV su Mastroianni'
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: "Errore | Mastroianni",
      description: "Si è verificato un errore durante il caricamento della pagina",
    };
  }
}

export default async function SeriePage({ params }: { params: { slug: string } }) {
  // Traccia la visita alla pagina (non bloccante)
  const slug = params.slug;
  trackGeneratedPage(slug, 'serie', false).catch(() => {
    // Non blocca il rendering in caso di errore
    console.debug(`Errore tracciamento per ${slug} (non bloccante)`);
  });
  
  // Verifica se la pagina è stata già generata fisicamente
  // Nota: questo funziona solo in produzione, non in sviluppo
  const isProduction = process.env.NODE_ENV === 'production';
  let pageWasPrerendered = false;
  
  if (isProduction) {
    try {
      // Percorso dove Next.js archivia le pagine pre-renderizzate
      const pageDir = path.join(process.cwd(), '.next', 'server', 'app', 'serie');
      const fileExists = fs.existsSync(path.join(pageDir, `${slug}.html`));
      
      if (fileExists) {
        console.log(`☑️ Pagina serie ${slug} trovata come file pre-renderizzato`);
        pageWasPrerendered = true;
      } else {
        console.log(`🆕 Pagina serie ${slug} non trovata, verrà generata on-demand`);
        
        // Log anche di tutti i file presenti nella directory per debug
        try {
          const existingFiles = fs.readdirSync(pageDir);
          console.log(`File presenti nella directory delle pagine serie:`, existingFiles.filter(f => f.endsWith('.html')).join(', '));
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
    const errorUrl = generateErrorUrl({
      title: "Serie TV non trovata",
      message: "L'ID della serie TV non è stato trovato nell'URL",
      redirectPath: "/"
    });
    redirect(errorUrl);
  }

  try {
    const show = await getMovieDetails(id, "tv");
    
    // Verifica che la serie abbia i dati necessari
    if (!show) {
      const errorUrl = generateErrorUrl({
        title: "Dati serie TV insufficienti",
        message: "I dati della serie TV sono completamente mancanti",
        redirectPath: "/",
        missingFields: ['entire_object']
      });
      return redirect(errorUrl);
    }
    
    // Definiamo i campi richiesti per una serie TV (solo id e name)
    const requiredFields = ['id', 'name'] as (keyof typeof show)[];
    const { isValid, missingFields } = hasRequiredData(show, requiredFields);
    
    if (!isValid) {
      console.log("DATI SERIE MANCANTI (ID: " + id + "):", missingFields);
      console.log("Dettagli serie disponibili:", {
        id: show.id,
        name: show.name || "(mancante)", 
        first_air_date: show.first_air_date || "(mancante)",
        overview: show.overview ? (show.overview.substring(0, 50) + "...") : "(mancante)",
        poster_path: show.poster_path || "(mancante)",
        backdrop_path: show.backdrop_path || "(mancante)"
      });
      
      const errorUrl = generateErrorUrl({
        title: "Dati serie TV insufficienti",
        message: "I dati della serie TV sono incompleti o non disponibili",
        redirectPath: "/",
        missingFields
      });
      return redirect(errorUrl);
    }

    // Ottieni dati correlati
    const trailers = await getTrailers(id, "tv").catch(() => []) || [];
    
    // Nota: rimosso codice per ottenere serie simili
    
    // Prepara dati per il rendering
    const checkImagePath = (path: string | null | undefined): boolean => {
      return !!path && typeof path === 'string' && path.startsWith('/');
    };

    const backdropUrl = checkImagePath(show.backdrop_path) 
      ? `https://image.tmdb.org/t/p/original${show.backdrop_path}`
      : null;

    const posterUrl = checkImagePath(show.poster_path)
      ? `https://image.tmdb.org/t/p/w500${show.poster_path}`
      : "/placeholder.svg?height=750&width=500";

    const releaseDate = show.first_air_date
      ? new Date(show.first_air_date).toLocaleDateString("it-IT", {
          day: "numeric", month: "long", year: "numeric"
        })
      : null;

    const releaseYear = show.first_air_date ? show.first_air_date.split("-")[0] : null;
    
    // Estrai i creatori
    const creators = show.created_by || [];

    // Estrai gli sceneggiatori
    const writers = show.credits?.crew?.filter((person) => ["Writer", "Screenplay"].includes(person.job)) || [];

    // Estrai i produttori
    const producers = show.credits?.crew?.filter((person) => ["Producer", "Executive Producer"].includes(person.job)) || [];

    // Se siamo arrivati qui e la pagina non era pre-renderizzata, la stiamo generando on-demand
    if (!pageWasPrerendered && isProduction) {
      console.log(`🔄 Rendering on-demand per la pagina serie ${slug} (ID: ${id})`);
    }

    return (
      <>
        <SerieSEO 
          title={show.name || 'Serie TV'}
          overview={show.overview || ''}
          posterUrl={posterUrl}
          firstAirDate={show.first_air_date}
          creators={creators}
          genres={show.genres}
          numberOfSeasons={show.number_of_seasons}
        />
        <TVPageClient
          show={show}
          posterUrl={posterUrl}
          backdropUrl={backdropUrl}
          releaseDate={releaseDate}
          releaseYear={releaseYear}
          trailers={trailers}
          id={id}
          creators={creators}
          writers={writers}
          producers={producers}
        />
      </>
    );
  } catch (error) {
    console.error("Error rendering serie page:", error);
    const errorUrl = generateErrorUrl({
      title: "Errore di sistema",
      message: "Si è verificato un errore durante il caricamento della pagina della serie TV",
      redirectPath: "/"
    });
    redirect(errorUrl);
  }
}

// Configurazione ISR
export const dynamicParams = true;
export const revalidate = 3600; // 1 ora 