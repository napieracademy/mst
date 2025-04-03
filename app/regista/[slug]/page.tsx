import { notFound } from 'next/navigation';
import { getPersonDetails } from '@/lib/tmdb';
import { extractIdFromSlug } from '@/lib/utils';
import DirectorDetails from '@/components/director-details';

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
  if (!id) notFound();

  try {
    const directorDetails = await getPersonDetails(id);
    if (!directorDetails) notFound();
    
    return <DirectorDetails director={directorDetails} />;
  } catch (error) {
    console.error("Error fetching director details:", error);
    notFound();
  }
}

// Configurazione ISR
export const dynamicParams = true;
export const revalidate = 86400; // 24 ore 