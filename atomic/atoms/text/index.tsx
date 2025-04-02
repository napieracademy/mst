'use client';

import React from 'react';
import { cn } from '@/atomic/utils/cn';
import { theme } from '@/atomic/config/theme';
import { ElementType } from 'react';

type TextVariant = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'body' | 'caption';
type TextWeight = keyof typeof theme.typography.fontWeight;
type TextSize = keyof typeof theme.typography.fontSize;

interface TextProps extends React.HTMLAttributes<HTMLElement> {
  variant?: TextVariant;
  weight?: TextWeight;
  size?: TextSize;
  color?: keyof typeof theme.colors.text;
  children: React.ReactNode;
  as?: React.ElementType;
  className?: string;
}

const variantStyles: Record<TextVariant, { tag: ElementType; defaultSize: TextSize; defaultWeight: TextWeight }> = {
  h1: { tag: 'h1', defaultSize: '5xl', defaultWeight: 'bold' },
  h2: { tag: 'h2', defaultSize: '4xl', defaultWeight: 'bold' },
  h3: { tag: 'h3', defaultSize: '3xl', defaultWeight: 'semibold' },
  h4: { tag: 'h4', defaultSize: '2xl', defaultWeight: 'semibold' },
  h5: { tag: 'h5', defaultSize: 'xl', defaultWeight: 'medium' },
  h6: { tag: 'h6', defaultSize: 'lg', defaultWeight: 'medium' },
  body: { tag: 'p', defaultSize: 'base', defaultWeight: 'normal' },
  caption: { tag: 'span', defaultSize: 'sm', defaultWeight: 'normal' },
};

export const Text: React.FC<TextProps> = ({
  variant = 'body',
  weight,
  size,
  color = 'primary',
  as: Component = 'span',
  className,
  children,
  ...props
}) => {
  const { tag: ComponentTag, defaultSize, defaultWeight } = variantStyles[variant];
  const fontSize = size || defaultSize;
  const fontWeight = weight || defaultWeight;

  return (
    <Component
      className={cn(
        'font-sans',
        `text-${fontSize}`,
        `font-${fontWeight}`,
        `text-${theme.colors.text[color]}`,
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
}; 