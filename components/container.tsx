import { Container as AtomicContainer } from "@/atomic/atoms/container"
import { ReactNode } from "react"

interface ContainerProps {
  children: ReactNode
  className?: string
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full' | 'custom'
  as?: React.ElementType
}

export function Container({
  children,
  className,
  maxWidth = 'custom',
  as
}: ContainerProps) {
  return (
    <AtomicContainer
      className={className}
      maxWidth={maxWidth}
      as={as}
    >
      {children}
    </AtomicContainer>
  )
} 