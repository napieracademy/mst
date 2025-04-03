import { notFound } from 'next/navigation';
import { getPersonDetails } from '@/lib/tmdb';
import { extractIdFromSlug } from '@/lib/utils';
import ActorDetails from '@/components/actor-details';

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
  if (!id) notFound();

  try {
    const actorDetails = await getPersonDetails(id);
    if (!actorDetails) notFound();
    
    return <ActorDetails actor={actorDetails} />;
  } catch (error) {
    console.error("Error fetching actor details:", error);
    notFound();
  }
}

// Configurazione ISR
export const dynamicParams = true;
export const revalidate = 86400; // 24 ore 