import React, { ReactNode } from 'react';
import { cn } from '@/atomic/utils/cn';

type TextVariant = 
  | 'h1' 
  | 'h2' 
  | 'h3' 
  | 'h4' 
  | 'h5' 
  | 'h6' 
  | 'p' 
  | 'span' 
  | 'lead' 
  | 'small' 
  | 'caption';

interface TextProps {
  children: ReactNode;
  variant?: TextVariant;
  className?: string;
  as?: React.ElementType;
  color?: 'default' | 'muted' | 'accent' | 'white';
}

export const Text: React.FC<TextProps> = ({
  children,
  variant = 'p',
  className,
  as,
  color = 'default'
}) => {
  const Element = as || (
    {
      h1: 'h1',
      h2: 'h2',
      h3: 'h3',
      h4: 'h4',
      h5: 'h5',
      h6: 'h6',
      p: 'p',
      span: 'span',
      lead: 'p',
      small: 'small',
      caption: 'span'
    }[variant]
  );
  
  const variantClasses = {
    h1: 'text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight',
    h2: 'text-2xl sm:text-3xl font-semibold tracking-tight',
    h3: 'text-xl sm:text-2xl font-semibold',
    h4: 'text-lg sm:text-xl font-medium',
    h5: 'text-base sm:text-lg font-medium',
    h6: 'text-sm sm:text-base font-medium',
    p: 'text-base',
    span: 'text-base',
    lead: 'text-lg sm:text-xl',
    small: 'text-sm',
    caption: 'text-xs'
  }[variant];
  
  const colorClasses = {
    default: 'text-gray-900 dark:text-gray-100',
    muted: 'text-gray-500 dark:text-gray-400',
    accent: 'text-yellow-500',
    white: 'text-white'
  }[color];
  
  return (
    <Element
      className={cn(
        variantClasses,
        colorClasses,
        className
      )}
    >
      {children}
    </Element>
  );
}; 