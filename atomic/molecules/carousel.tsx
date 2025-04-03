"use client"

import React, { useState, useRef, useEffect } from 'react';
import { cn } from '../../atomic/utils/cn';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CarouselProps {
  children: React.ReactNode;
  showArrows?: boolean;
  showDots?: boolean;
  autoScroll?: boolean;
  autoScrollInterval?: number;
  className?: string;
}

export const Carousel: React.FC<CarouselProps> = ({
  children,
  showArrows = true,
  showDots = true,
  autoScroll = false,
  autoScrollInterval = 5000,
  className
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const childrenArray = React.Children.toArray(children);
  const totalItems = childrenArray.length;
  
  // Verifica se ci sono abbastanza elementi per lo scroll
  const canScroll = totalItems > 4;

  useEffect(() => {
    if (autoScroll && canScroll) {
      const interval = setInterval(() => {
        handleNext();
      }, autoScrollInterval);
      
      return () => clearInterval(interval);
    }
  }, [autoScroll, currentIndex, canScroll, autoScrollInterval]);
  
  const handlePrev = () => {
    if (isScrolling) return;
    
    setIsScrolling(true);
    setCurrentIndex(prev => (prev === 0 ? totalItems - 1 : prev - 1));
    
    if (scrollContainerRef.current) {
      const scrollContainer = scrollContainerRef.current;
      const itemWidth = scrollContainer.scrollWidth / totalItems;
      
      scrollContainer.scrollTo({
        left: itemWidth * (currentIndex === 0 ? totalItems - 1 : currentIndex - 1),
        behavior: 'smooth'
      });
      
      setTimeout(() => setIsScrolling(false), 500);
    }
  };
  
  const handleNext = () => {
    if (isScrolling) return;
    
    setIsScrolling(true);
    setCurrentIndex(prev => (prev === totalItems - 1 ? 0 : prev + 1));
    
    if (scrollContainerRef.current) {
      const scrollContainer = scrollContainerRef.current;
      const itemWidth = scrollContainer.scrollWidth / totalItems;
      
      scrollContainer.scrollTo({
        left: itemWidth * (currentIndex === totalItems - 1 ? 0 : currentIndex + 1),
        behavior: 'smooth'
      });
      
      setTimeout(() => setIsScrolling(false), 500);
    }
  };
  
  const handleDotClick = (index: number) => {
    if (isScrolling) return;
    
    setIsScrolling(true);
    setCurrentIndex(index);
    
    if (scrollContainerRef.current) {
      const scrollContainer = scrollContainerRef.current;
      const itemWidth = scrollContainer.scrollWidth / totalItems;
      
      scrollContainer.scrollTo({
        left: itemWidth * index,
        behavior: 'smooth'
      });
      
      setTimeout(() => setIsScrolling(false), 500);
    }
  };
  
  const handleScroll = () => {
    if (scrollContainerRef.current && !isScrolling) {
      const scrollContainer = scrollContainerRef.current;
      const itemWidth = scrollContainer.scrollWidth / totalItems;
      const index = Math.round(scrollContainer.scrollLeft / itemWidth);
      
      if (index !== currentIndex) {
        setCurrentIndex(index);
      }
    }
  };
  
  return (
    <div className={cn('relative', className)}>
      {/* Container principale con overflow */}
      <div
        ref={scrollContainerRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory"
        onScroll={handleScroll}
      >
        {childrenArray.map((child, index) => (
          <div
            key={index}
            className={cn(
              "snap-start",
              index === currentIndex ? "scale-100" : "scale-95"
            )}
          >
            {child}
          </div>
        ))}
      </div>
      
      {/* Frecce di navigazione */}
      {showArrows && canScroll && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 p-2 rounded-full z-10 transition-all"
            aria-label="Precedente"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 p-2 rounded-full z-10 transition-all"
            aria-label="Successivo"
          >
            <ChevronRight className="w-5 h-5 text-white" />
          </button>
        </>
      )}
      
      {/* Indicatori di pagina */}
      {showDots && canScroll && (
        <div className="flex justify-center space-x-2 mt-4">
          {Array.from({ length: totalItems }).map((_, index) => (
            <button
              key={index}
              onClick={() => handleDotClick(index)}
              className={cn(
                "w-2 h-2 rounded-full transition-colors",
                index === currentIndex ? "bg-yellow-400" : "bg-gray-600 hover:bg-gray-500"
              )}
              aria-label={`Vai alla slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}; 