import { ContentLink } from './content-link';
import { MovieImage } from '@/atomic/atoms/image';

interface Movie {
  id: number;
  title: string;
  year: string | null;
  poster: string | null;
}

export function MovieList({ movies }: { movies: Movie[] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {movies.map(movie => (
        <ContentLink 
          key={movie.id}
          id={movie.id}
          title={movie.title}
          year={movie.year}
          type="film"
          className="transition-transform hover:scale-105"
        >
          <div className="aspect-[2/3] relative rounded overflow-hidden">
            <MovieImage
              src={movie.poster}
              alt={movie.title}
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
            />
            <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black to-transparent">
              <h3 className="text-white text-sm font-medium">{movie.title}</h3>
              {movie.year && <p className="text-gray-300 text-xs">{movie.year}</p>}
            </div>
          </div>
        </ContentLink>
      ))}
    </div>
  );
} 