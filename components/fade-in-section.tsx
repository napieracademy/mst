"use client"

import { useRef, useEffect, useState, ReactNode } from 'react'

interface FadeInSectionProps {
  children: ReactNode
  delay?: number // ritardo in ms prima del fade in
  threshold?: number // percentuale di visibilità richiesta (0-1)
  className?: string
}

export function FadeInSection({
  children,
  delay = 0,
  threshold = 0.1,
  className = ""
}: FadeInSectionProps) {
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const currentRef = sectionRef.current
    if (!currentRef) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Quando l'elemento diventa visibile
        if (entry.isIntersecting) {
          // Applicare il ritardo specificato
          setTimeout(() => {
            setIsVisible(true)
          }, delay)
          
          // Una volta che abbiamo attivato l'animazione, possiamo smettere di osservare
          observer.unobserve(currentRef)
        }
      },
      { threshold } // Mostra quando almeno 10% dell'elemento è visibile
    )

    observer.observe(currentRef)

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef)
      }
    }
  }, [delay, threshold])

  return (
    <div
      ref={sectionRef}
      className={`transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'} ${className}`}
    >
      {children}
    </div>
  )
} 