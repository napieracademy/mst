'use client';

import { useState } from 'react';
import { Container } from '@/atomic/atoms/container';
import { Text } from '@/atomic/atoms/text';
import { Movie } from '@/lib/types';
import { MovieCard } from '@/components/movie-card';
import { cn } from '@/atomic/utils/cn';
import { Button } from '@/atomic/atoms/button';
import { ChevronDown } from 'lucide-react';

interface MovieGridProps {
  title?: string;
  description?: string;
  movies: Movie[];
  showLoadMore?: boolean;
  initialCount?: number;
  incrementCount?: number;
  className?: string;
}

export function MovieGrid({
  title,
  description,
  movies,
  showLoadMore = false,
  initialCount = 8,
  incrementCount = 8,
  className,
}: MovieGridProps) {
  const [visibleMovies, setVisibleMovies] = useState(initialCount);

  const loadMore = () => {
    setVisibleMovies((prev) => Math.min(prev + incrementCount, movies.length));
  };

  const hasMoreToLoad = visibleMovies < movies.length;

  return (
    <section className={cn('py-8', className)}>
      <Container>
        {title && (
          <Text variant="h2" className="mb-2">
            {title}
          </Text>
        )}
        
        {description && (
          <Text variant="body" color="secondary" className="mb-6">
            {description}
          </Text>
        )}
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {movies.slice(0, visibleMovies).map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
        
        {showLoadMore && hasMoreToLoad && (
          <div className="mt-8 flex justify-center">
            <Button 
              variant="secondary" 
              onClick={loadMore} 
              className="flex items-center gap-2"
            >
              <ChevronDown className="w-4 h-4" />
              Carica altri
            </Button>
          </div>
        )}
      </Container>
    </section>
  );
} 