
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, useSpring, useMotionValue, useTransform } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/atomic/utils/cn';

interface InteractiveCarouselProps {
  children: React.ReactNode;
  className?: string;
  itemWidth?: number;
  gap?: number;
  showArrows?: boolean;
  showDots?: boolean;
  dragSpeed?: number; // Fattore di velocità per il trascinamento
  snapBackDuration?: number; // Durata dell'animazione di ritorno in ms
}

export function InteractiveCarousel({
  children,
  className = '',
  itemWidth = 250,
  gap = 16,
  showArrows = true,
  showDots = true,
  dragSpeed = 2.5, // Valore più alto = movimento più veloce
  snapBackDuration = 0.3, // Più basso = ritorno più veloce
}: InteractiveCarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  
  // Motion values per un'animazione fluida
  const x = useMotionValue(0);
  const baseVelocity = useMotionValue(0);
  
  useEffect(() => {
    if (containerRef.current) {
      const { clientWidth, scrollWidth } = containerRef.current;
      setContainerWidth(clientWidth);
      
      // Calcolo del numero totale di elementi/schermate
      const totalScreens = Math.ceil((scrollWidth - gap) / (clientWidth - gap));
      setTotalItems(totalScreens);
      
      // Verifica se dobbiamo mostrare le frecce
      setShowRightArrow(scrollWidth > clientWidth);
    }
    
    const handleResize = () => {
      if (containerRef.current) {
        const { clientWidth, scrollWidth } = containerRef.current;
        setContainerWidth(clientWidth);
        const totalScreens = Math.ceil((scrollWidth - gap) / (clientWidth - gap));
        setTotalItems(totalScreens);
        setShowRightArrow(scrollWidth > clientWidth);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [gap, children]);
  
  // Funzione per scrollare a un indice specifico
  const scrollToIndex = (index: number) => {
    if (!containerRef.current) return;
    
    const container = containerRef.current;
    const targetPosition = index * (containerWidth - gap);
    
    // Animare il valore motion x
    const animation = {
      type: "spring",
      stiffness: 300,
      damping: 30,
      duration: snapBackDuration * 1000
    };
    
    x.set(-targetPosition);
    setCurrentIndex(index);
    
    // Aggiorna la visibilità delle frecce
    setShowLeftArrow(index > 0);
    setShowRightArrow(index < totalItems - 1);
  };
  
  // Funzione per navigare
  const navigate = (direction: 'left' | 'right') => {
    const nextIndex = direction === 'left' 
      ? Math.max(0, currentIndex - 1) 
      : Math.min(totalItems - 1, currentIndex + 1);
    
    scrollToIndex(nextIndex);
  };
  
  // Gestione del drag
  const handleDragStart = () => {
    setIsDragging(true);
  };
  
  const handleDragEnd = (e: any, info: any) => {
    setIsDragging(false);
    
    const { offset, velocity } = info;
    const swipeThreshold = containerWidth * 0.2;
    
    // Determina la direzione del drag basata sull'offset e velocità
    if (offset.x > swipeThreshold || velocity.x > 500) {
      // Drag verso destra (prev)
      navigate('left');
    } else if (offset.x < -swipeThreshold || velocity.x < -500) {
      // Drag verso sinistra (next)
      navigate('right');
    } else {
      // Torna alla posizione originale
      scrollToIndex(currentIndex);
    }
  };
  
  // Converti i figli in un array
  const childrenArray = React.Children.toArray(children);
  
  return (
    <div className={cn('relative group overflow-hidden', className)}>
      <motion.div 
        ref={containerRef}
        className="flex"
        style={{ 
          x,
          cursor: isDragging ? 'grabbing' : 'grab'
        }}
        drag="x"
        dragConstraints={{ left: -((childrenArray.length * (itemWidth + gap)) - containerWidth), right: 0 }}
        dragElastic={0.1}
        dragTransition={{ power: dragSpeed, timeConstant: 400 }}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        {React.Children.map(children, (child, index) => (
          <div 
            key={index} 
            className="flex-none" 
            style={{ width: itemWidth, marginRight: index < childrenArray.length - 1 ? gap : 0 }}
          >
            {child}
          </div>
        ))}
      </motion.div>

      {showArrows && (
        <>
          {showLeftArrow && (
            <button
              onClick={() => navigate('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-black/50 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Scorri a sinistra"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
          )}
          
          {showRightArrow && (
            <button
              onClick={() => navigate('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-black/50 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Scorri a destra"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          )}
        </>
      )}
      
      {showDots && totalItems > 1 && (
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex gap-2 p-2">
          {Array.from({ length: totalItems }).map((_, index) => (
            <button
              key={index}
              onClick={() => scrollToIndex(index)}
              className={cn(
                'w-2 h-2 rounded-full transition-all',
                currentIndex === index
                  ? 'bg-white w-4'
                  : 'bg-white/50 hover:bg-white/70'
              )}
              aria-label={`Vai allo slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
