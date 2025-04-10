'use client';

import { cn } from '@/atomic/utils/cn';

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'fluid' | 'narrow';
  children: React.ReactNode;
}

const variantStyles = {
  default: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
  fluid: 'w-full px-4 sm:px-6 lg:px-8',
  narrow: 'max-w-3xl mx-auto px-4 sm:px-6 lg:px-8',
};

export function Container({
  variant = 'default',
  className,
  children,
  ...props
}: ContainerProps) {
  return (
    <div
      className={cn(variantStyles[variant], className)}
      {...props}
    >
      {children}
    </div>
  );
} 