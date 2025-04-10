'use client';

import { cn } from '@/atomic/utils/cn';
import { MovieImage } from '@/atomic/atoms/image';
import { Text } from '@/atomic/atoms/text';
import Link from 'next/link';
import { formatDate } from '@/atomic/utils/cn';

interface MovieCardProps {
  movie: {
    id: number;
    title: string;
    poster_path: string | null;
    release_date: string;
    vote_average: number;
  };
  href: string;
  className?: string;
}

export function MovieCard({ movie, href, className }: MovieCardProps) {
  return (
    <Link
      href={href}
      className={cn(
        'group relative block overflow-hidden rounded-lg bg-black/30 backdrop-blur-sm transition-all hover:bg-black/50',
        className
      )}
    >
      <div className="aspect-[2/3] relative">
        <MovieImage
          src={movie.poster_path}
          alt={movie.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <Text
          variant="h5"
          className="text-white mb-1 line-clamp-2"
        >
          {movie.title}
        </Text>
        
        <div className="flex items-center justify-between text-sm text-gray-300">
          <span>{formatDate(movie.release_date)}</span>
          <span className="flex items-center gap-1">
            <span className="text-yellow-400">★</span>
            {movie.vote_average.toFixed(1)}
          </span>
        </div>
      </div>
    </Link>
  );
} 