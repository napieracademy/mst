import { notFound, redirect } from 'next/navigation';
import { getPersonDetails, getActorRelatedMovies } from '@/lib/tmdb';
import { extractIdFromSlug } from '@/lib/utils';
import ActorDetails from '@/components/actor-details';
import { hasRequiredData, generateErrorUrl } from '@/lib/error-utils';

export async function generateStaticParams() {
  // Non implementato - verrebbe aggiunto quando si ha un endpoint per ottenere gli attori popolari
  return [];
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const slug = params.slug;
  const id = extractIdFromSlug(slug);
  if (!id) {
    return {
      title: 'Attore non trovato',
      description: 'L\'attore richiesto non è disponibile'
    };
  }

  try {
    const actorDetails = await getPersonDetails(id);
    
    if (!actorDetails) {
      return {
        title: 'Attore non trovato',
        description: 'L\'attore richiesto non è disponibile'
      };
    }
    
    return {
      title: `${actorDetails.name} | Mastroianni`,
      description: actorDetails.biography?.substring(0, 160) || 'Filmografia e biografia dell\'attore'
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: 'Errore | Mastroianni',
      description: 'Si è verificato un errore durante il caricamento della pagina'
    };
  }
}

export default async function ActorPage({ params }: { params: { slug: string } }) {
  const slug = params.slug;
  const id = extractIdFromSlug(slug);
  if (!id) {
    const errorUrl = generateErrorUrl({
      title: "Attore non trovato",
      message: "L'ID dell'attore non è stato trovato nell'URL",
      redirectPath: "/"
    });
    redirect(errorUrl);
  }

  try {
    const actorDetails = await getPersonDetails(id);
    if (!actorDetails) {
      const errorUrl = generateErrorUrl({
        title: "Dati attore insufficienti",
        message: "I dati dell'attore sono completamente mancanti",
        redirectPath: "/",
        missingFields: ['entire_object']
      });
      redirect(errorUrl);
    }
    
    // Otteniamo i film correlati all'attore
    const relatedMovies = await getActorRelatedMovies(id);
    
    // Aggiungiamo i film correlati ai dati dell'attore
    const actorWithRelatedMovies = {
      ...actorDetails,
      related_movies: relatedMovies
    };
    
    // Definiamo i campi richiesti per un attore (solo id e name)
    const requiredFields = ['id', 'name'] as (keyof typeof actorDetails)[];
    const { isValid, missingFields } = hasRequiredData(actorDetails, requiredFields);
    
    if (!isValid) {
      console.log("DATI ATTORE MANCANTI (ID: " + id + "):", missingFields);
      console.log("Dettagli attore disponibili:", {
        id: actorDetails.id,
        name: actorDetails.name || "(mancante)",
        profile_path: actorDetails.profile_path || "(mancante)",
        biography: actorDetails.biography ? (actorDetails.biography.substring(0, 50) + "...") : "(mancante)"
      });
      
      const errorUrl = generateErrorUrl({
        title: "Dati attore insufficienti",
        message: "I dati dell'attore sono incompleti o non disponibili",
        redirectPath: "/",
        missingFields
      });
      return redirect(errorUrl);
    }
    
    return <ActorDetails actor={actorWithRelatedMovies} />;
  } catch (error) {
    console.error("Error fetching actor details:", error);
    const errorUrl = generateErrorUrl({
      title: "Errore di sistema",
      message: "Si è verificato un errore durante il caricamento della pagina dell'attore",
      redirectPath: "/"
    });
    redirect(errorUrl);
  }
}

// Configurazione ISR
export const dynamicParams = true;
export const revalidate = 86400; // 24 ore 