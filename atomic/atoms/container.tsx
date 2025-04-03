import React, { ReactNode } from 'react';
import { cn } from '@/atomic/utils/cn';

interface ContainerProps {
  children: ReactNode;
  className?: string;
  as?: React.ElementType;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full' | 'custom';
}

export const Container: React.FC<ContainerProps> = ({
  children,
  className,
  as: Component = 'div',
  maxWidth = 'custom'
}) => {
  const maxWidthClass = {
    sm: 'max-w-screen-sm',
    md: 'max-w-screen-md',
    lg: 'max-w-screen-lg',
    xl: 'max-w-screen-xl',
    '2xl': 'max-w-screen-2xl',
    'full': 'max-w-full',
    'custom': 'max-w-[1100px]'
  }[maxWidth];

  return (
    <Component
      className={cn(
        'w-full mx-auto px-4',
        maxWidthClass,
        className
      )}
    >
      {children}
    </Component>
  );
}; 