import { notFound, redirect } from 'next/navigation';
import { getPersonDetails } from '@/lib/tmdb';
import { extractIdFromSlug } from '@/lib/utils';
import DirectorDetails from '@/components/director-details';
import { hasRequiredData, generateErrorUrl } from '@/lib/error-utils';

export async function generateStaticParams() {
  // Non implementato - verrebbe aggiunto quando si ha un endpoint per ottenere i registi popolari
  return [];
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const slug = params.slug;
  const id = extractIdFromSlug(slug);
  if (!id) {
    return {
      title: 'Regista non trovato',
      description: 'Il regista richiesto non è disponibile'
    };
  }

  try {
    const directorDetails = await getPersonDetails(id);
    
    if (!directorDetails) {
      return {
        title: 'Regista non trovato',
        description: 'Il regista richiesto non è disponibile'
      };
    }
    
    return {
      title: `${directorDetails.name} | Mastroianni`,
      description: directorDetails.biography?.substring(0, 160) || 'Filmografia e biografia del regista'
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: 'Errore | Mastroianni',
      description: 'Si è verificato un errore durante il caricamento della pagina'
    };
  }
}

export default async function DirectorPage({ params }: { params: { slug: string } }) {
  const slug = params.slug;
  const id = extractIdFromSlug(slug);
  if (!id) {
    const errorUrl = generateErrorUrl({
      title: "Regista non trovato",
      message: "L'ID del regista non è stato trovato nell'URL",
      redirectPath: "/"
    });
    redirect(errorUrl);
  }

  try {
    const directorDetails = await getPersonDetails(id);
    if (!directorDetails) {
      const errorUrl = generateErrorUrl({
        title: "Dati regista insufficienti",
        message: "I dati del regista sono completamente mancanti",
        redirectPath: "/",
        missingFields: ['entire_object']
      });
      redirect(errorUrl);
    }
    
    // Definiamo i campi richiesti per un regista (solo id e name)
    const requiredFields = ['id', 'name'] as (keyof typeof directorDetails)[];
    const { isValid, missingFields } = hasRequiredData(directorDetails, requiredFields);
    
    if (!isValid) {
      console.log("DATI REGISTA MANCANTI (ID: " + id + "):", missingFields);
      console.log("Dettagli regista disponibili:", {
        id: directorDetails.id,
        name: directorDetails.name || "(mancante)",
        profile_path: directorDetails.profile_path || "(mancante)",
        biography: directorDetails.biography ? (directorDetails.biography.substring(0, 50) + "...") : "(mancante)"
      });
      
      const errorUrl = generateErrorUrl({
        title: "Dati regista insufficienti",
        message: "I dati del regista sono incompleti o non disponibili",
        redirectPath: "/",
        missingFields
      });
      return redirect(errorUrl);
    }
    
    return <DirectorDetails director={directorDetails} />;
  } catch (error) {
    console.error("Error fetching director details:", error);
    const errorUrl = generateErrorUrl({
      title: "Errore di sistema",
      message: "Si è verificato un errore durante il caricamento della pagina del regista",
      redirectPath: "/"
    });
    redirect(errorUrl);
  }
}

// Configurazione ISR
export const dynamicParams = true;
export const revalidate = 86400; // 24 ore 