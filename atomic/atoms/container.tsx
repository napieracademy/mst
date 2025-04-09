import { cn } from "@/lib/utils"
import React from "react"

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  maxWidth?: 'default' | 'small' | 'large' | 'custom'
  as?: React.ElementType
}

export function Container({
  children,
  className,
  maxWidth = 'default',
  as: Component = 'div',
  ...props
}: ContainerProps) {
  const containerClass = cn(
    'w-full mx-auto px-4 sm:px-6 lg:px-8',
    {
      'max-w-7xl': maxWidth === 'default',
      'max-w-5xl': maxWidth === 'small',
      'max-w-screen-2xl': maxWidth === 'large',
      '': maxWidth === 'custom',
    },
    className
  )

  return <Component className={containerClass} {...props}>{children}</Component>
}