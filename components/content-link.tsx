import Link from 'next/link';
import { generateSlug } from '@/lib/utils';

interface ContentLinkProps {
  id: number;
  title: string;
  year?: string | number | null;
  type: 'film' | 'attore' | 'regista';
  children: React.ReactNode;
  className?: string;
}

export function ContentLink({ id, title, year, type, children, className }: ContentLinkProps) {
  // Forzare year a essere string | number | null per soddisfare il tipo atteso
  const safeYear = year === undefined ? null : year;
  
  // Genera lo slug SEO-friendly
  const slug = generateSlug(title, safeYear, id);
  
  // Genera l'URL basato sul tipo di contenuto
  let href = '';
  
  if (type === 'film') {
    href = `/film/${slug}`;
  } else if (type === 'attore') {
    href = `/attore/${slug}`;
  } else if (type === 'regista') {
    href = `/regista/${slug}`;
  }
  
  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
} 