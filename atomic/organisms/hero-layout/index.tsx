'use client';

import React from 'react';
import { cn } from '@/atomic/utils/cn';
import { Button } from '@/atomic/atoms/button';
import { Container } from '@/atomic/atoms/container';
import { Text } from '@/atomic/atoms/text';
import { ReactNode } from 'react';

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