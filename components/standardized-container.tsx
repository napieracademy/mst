"use client"

import { ReactNode } from "react"
import { cn } from "@/lib/utils"
import { useIsMobile } from "@/hooks/use-mobile"

interface StandardizedContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  disablePadding?: boolean // Per disabilitare i padding laterali quando necessario
  fullWidth?: boolean // Per permettere la larghezza piena in casi eccezionali
  as?: React.ElementType // Per rendere flessibile il componente
  mobileOptimized?: boolean // Per attivare ottimizzazioni specifiche per mobile
}

/**
 * Container standardizzato per l'applicazione
 * Imposta una larghezza massima di 1100px per mantenere la coerenza dell'UI
 * Disattiva automaticamente i padding quando si utilizzano componenti interni
 * Aggiunge ottimizzazioni specifiche per mobile quando richiesto
 */
export function StandardizedContainer({
  children,
  className,
  disablePadding = false,
  fullWidth = false,
  mobileOptimized = true,
  as: Component = 'div',
  ...props
}: StandardizedContainerProps) {
  const isMobile = useIsMobile()
  
  const containerClass = cn(
    'mx-auto w-full',
    {
      'max-w-[1100px]': !fullWidth,
      'px-4 sm:px-6': !disablePadding,
      'prevent-overflow': isMobile && mobileOptimized,
      'mobile-optimized': isMobile && mobileOptimized,
      'mobile-padding': isMobile && mobileOptimized && !disablePadding,
    },
    className
  )

  return (
    <Component className={containerClass} {...props}>
      {children}
    </Component>
  )
}