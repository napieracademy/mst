import Link from 'next/link';
import { generateSlug } from '@/lib/utils';
import { cn } from '@/atomic/utils/cn';

interface ContentLinkProps {
  id: number;
  title: string;
  year?: string | null;
  type: 'film' | 'serie' | 'attore' | 'regista';
  className?: string;
  children?: React.ReactNode;
}

export function ContentLink({ id, title, year, type, className, children }: ContentLinkProps) {
  // Forzare year a essere string | number | null per soddisfare il tipo atteso
  const safeYear = year === undefined ? null : year;
  
  // Genera lo slug SEO-friendly
  const slug = generateSlug(title, safeYear, id);
  
  // Determina l'URL base in base al tipo
  const baseUrl = {
    film: '/film',
    serie: '/serie',
    attore: '/attore',
    regista: '/regista'
  }[type];
  
  // Costruisci l'URL completo
  const href = `${baseUrl}/${slug}`;

  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
} 