'use client';

import React from 'react';
import { TVInfo } from '@/atomic/molecules/tv-info';
import { ActionButtons } from '@/atomic/molecules/action-buttons';
import Image from 'next/image';
import { cn } from '@/atomic/utils/cn';
import { Button } from '@/atomic/atoms/button';
import { Container } from '@/atomic/atoms/container';
import { Text } from '@/atomic/atoms/text';
import { ReactNode } from 'react';

interface HeroLayoutProps {
  title: string;
  releaseDate?: string;
  hasTrailer: boolean;
  onWatchTrailer: () => void;
  onShare: () => void;
  onFavorite: () => void;
  onNotify: () => void;
  backdropUrl: string | null;
  posterUrl: string;
}

export const TVHeroLayout: React.FC<HeroLayoutProps> = ({
  title,
  releaseDate,
  hasTrailer,
  onWatchTrailer,
  onShare,
  onFavorite,
  onNotify,
  backdropUrl,
  posterUrl,
}) => {
  return (
    <div className="relative w-full h-[100dvh] sm:h-[50vh] md:h-[70vh] mb-[30px] sm:mb-0">
      {backdropUrl && (
        <div className="absolute inset-0 hidden sm:block">
          <Image
            src={backdropUrl}
            alt={title}
            fill
            className="object-cover object-center"
            priority
            quality={90}
          />
        </div>
      )}
      <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center h-full">
        <div className="w-full sm:w-1/2 p-4">
          <TVInfo
            title={title}
            releaseDate={releaseDate}
            hasTrailer={hasTrailer}
            onWatchTrailer={onWatchTrailer}
          />
        </div>
        <div className="w-full sm:w-1/2 p-4">
          <ActionButtons
            onShare={onShare}
            onFavorite={onFavorite}
            onNotify={onNotify}
          />
        </div>
      </div>
    </div>
  );
};

interface HeroLayoutProps {
  backgroundImage?: string;
  overlayGradient?: boolean;
  title: string;
  subtitle?: string;
  children?: ReactNode;
  actions?: ReactNode;
  className?: string;
}

export function HeroLayout({
  backgroundImage,
  overlayGradient = true,
  title,
  subtitle,
  children,
  actions,
  className,
}: HeroLayoutProps) {
  return (
    <section
      className={cn(
        'relative min-h-[60vh] flex items-center',
        backgroundImage ? 'bg-cover bg-center' : 'bg-black',
        className
      )}
      style={
        backgroundImage
          ? { backgroundImage: `url(${backgroundImage})` }
          : undefined
      }
    >
      {/* Background Overlay */}
      {overlayGradient && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
      )}

      <Container className="relative z-10 py-12">
        <div className="max-w-2xl">
          <Text variant="h1" className="text-white mb-4">
            {title}
          </Text>
          
          {subtitle && (
            <Text variant="h5" color="secondary" className="mb-8">
              {subtitle}
            </Text>
          )}
          
          {actions && <div className="flex flex-wrap gap-4 mb-8">{actions}</div>}
          
          {children}
        </div>
      </Container>
    </section>
  );
} 