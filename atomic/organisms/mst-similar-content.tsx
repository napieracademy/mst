"use client"

import React, { useMemo } from 'react';
import { MSTGraph } from '@/atomic/molecules/mst-graph';
import { Movie } from '@/lib/types';
import { createGraphFromMovies, kruskalMST } from '@/lib/graph';
// import { FadeInSection } from '@/components/fade-in-section';
import { Text } from '@/atomic/atoms/text';
import { Container } from '@/atomic/atoms/container';
import { ContentLink } from '@/components/content-link';
import { generateSlug } from '@/lib/utils';

interface MSTSimilarContentProps {
  items: Movie[];
  title?: string;
  type: 'movie' | 'tv';
  className?: string;
}

export const MSTSimilarContent: React.FC<MSTSimilarContentProps> = ({
  items,
  title = 'Relazioni tra contenuti simili',
  type,
  className
}) => {
  // Calcola il grafo MST solo quando items cambia
  const mstGraph = useMemo(() => {
    if (!items || items.length === 0) return null;
    
    // Limita il numero di elementi per evitare un grafo troppo complesso
    const limitedItems = items.slice(0, 10);
    
    // Crea il grafo completo dai film/serie TV
    const graph = createGraphFromMovies(limitedItems);
    
    // Applica l'algoritmo di Kruskal per ottenere l'MST
    return kruskalMST(graph);
  }, [items]);

  if (!mstGraph || items.length === 0) {
    return null;
  }

  // Converti il tipo per utilizzare ContentLink
  const contentType = type === 'movie' ? 'film' : 'serie';

  return (
    // <FadeInSection delay={500} threshold={0.05}>
      <section className="mt-12 sm:mt-16 pt-12 border-t border-gray-800">
        <Container>
          <Text variant="h2" className="mb-6">
            {title}
          </Text>
          
          <div className="prose prose-invert max-w-none mb-6">
            <p className="text-sm text-gray-400">
              Questa visualizzazione mostra come i vari {type === 'movie' ? 'film' : 'serie TV'} siano collegati tra loro in base a caratteristiche come genere, popolarità e valutazione media. 
              Ogni collegamento rappresenta una relazione di similarità.
            </p>
          </div>
          
          <div className="w-full overflow-hidden">
            <MSTGraph 
              graph={mstGraph}
              type={type}
              className={className}
              getLinkUrl={(nodeId: number) => {
                const movie = items.find(item => item.id === nodeId);
                if (!movie) return '#';
                
                const title = movie.title || movie.name || "Contenuto";
                const year = movie.release_date ? movie.release_date.split('-')[0] : null;
                
                // Utilizziamo ContentLink per generare l'URL SEO-friendly
                return `/${contentType}/${generateSlug(title, year, nodeId)}`;
              }}
            />
          </div>
        </Container>
      </section>
    // </FadeInSection>
  );
}; 