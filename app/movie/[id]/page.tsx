import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { getMovieBySlug } from '@/lib/utils';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface MoviePageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({
  params,
}: MoviePageProps): Promise<Metadata> {
  try {
    // Tenta di ottenere le informazioni del film solo per i metadati
    const movieSlug = params.id;
    return {
      title: 'Film non trovato',
      description: 'Questo film non è disponibile o è stato spostato.',
    };
  } catch (error) {
    return {
      title: 'Film non trovato',
      description: 'Questo film non è disponibile o è stato spostato.',
    };
  }
}

export default async function MoviePage({ params }: MoviePageProps) {
  // Ottieni lo slug dalla URL
  const movieSlug = params.id;
  
  try {
    // Verifica se il film esiste nella nuova posizione
    const movie = await getMovieBySlug(movieSlug);
    
    if (movie) {
      // Reindirizza alla nuova URL con /film/ invece di /movie/
      redirect(`/film/${movieSlug}`);
    }
  } catch (error) {
    console.error(`Errore durante il reindirizzamento per ${movieSlug}:`, error);
  }
  
  // Se il film non esiste o c'è un errore, mostra la pagina 404
  return notFound();
}

