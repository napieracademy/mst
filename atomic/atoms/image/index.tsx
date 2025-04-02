'use client';

import { cn } from '@/atomic/utils/cn';
import { getImageUrl } from '@/atomic/utils/cn';
import Image from 'next/image';
import { useState } from 'react';

interface ImageProps extends Omit<React.ComponentProps<typeof Image>, 'src'> {
  src: string | null;
  alt: string;
  size?: 'w92' | 'w154' | 'w185' | 'w342' | 'w500' | 'w780' | 'original';
  fallback?: string;
  className?: string;
}

export function MovieImage({
  src,
  alt,
  size = 'w500',
  fallback = '/placeholder.svg',
  className,
  ...props
}: ImageProps) {
  const [error, setError] = useState(false);

  return (
    <Image
      src={error ? fallback : getImageUrl(src, size)}
      alt={alt}
      onError={() => setError(true)}
      className={cn('object-cover', className)}
      {...props}
    />
  );
} 