'use client';

import { cn } from '@/atomic/utils/cn';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useRef, useState } from 'react';

interface CarouselProps {
  children: React.ReactNode;
  className?: string;
  showArrows?: boolean;
  showDots?: boolean;
}

export function Carousel({
  children,
  className,
  showArrows = true,
  showDots = true,
}: CarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [totalItems, setTotalItems] = useState(0);

  const scroll = (direction: 'left' | 'right') => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const scrollAmount = container.clientWidth;
    const newScrollPosition = container.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount);

    container.scrollTo({
      left: newScrollPosition,
      behavior: 'smooth',
    });
  };

  const handleScroll = () => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const newIndex = Math.round(container.scrollLeft / container.clientWidth);
    setCurrentIndex(newIndex);
  };

  return (
    <div className={cn('relative group', className)}>
      <div
        ref={containerRef}
        className="overflow-x-auto scrollbar-hide scroll-smooth"
        onScroll={handleScroll}
        onLoad={(e) => {
          const container = e.currentTarget;
          setTotalItems(Math.ceil(container.scrollWidth / container.clientWidth));
        }}
      >
        <div className="flex gap-4">
          {children}
        </div>
      </div>

      {showArrows && (
        <>
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {showDots && totalItems > 1 && (
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex gap-2 p-2">
          {Array.from({ length: totalItems }).map((_, index) => (
            <button
              key={index}
              onClick={() => {
                if (!containerRef.current) return;
                containerRef.current.scrollTo({
                  left: index * containerRef.current.clientWidth,
                  behavior: 'smooth',
                });
              }}
              className={cn(
                'w-2 h-2 rounded-full transition-all',
                currentIndex === index
                  ? 'bg-white w-4'
                  : 'bg-white/50 hover:bg-white/70'
              )}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
} 