import { Container as AtomicContainer } from "@/atomic/atoms/container"
import { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  maxWidth?: 'default' | 'small' | 'large' | 'standardized' | 'custom'
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
      'max-w-[1100px]': maxWidth === 'standardized',
      '': maxWidth === 'custom',
    },
    className
  )

  return <Component className={containerClass} {...props}>{children}</Component>
}