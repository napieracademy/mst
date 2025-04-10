"use client"

import React, { useState } from 'react';
import { cn } from '@/atomic/utils/cn';

interface TooltipProps {
  children: React.ReactNode;
  content: string;
  className?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export function Tooltip({
  children,
  content,
  className,
  position = 'top'
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  const positionClasses = {
    top: '-top-10 left-1/2 -translate-x-1/2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2'
  };

  return (
    <div 
      className={cn("relative inline-block", className)}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      {children}
      
      {isVisible && (
        <div 
          className={cn(
            "absolute z-50 px-2 py-1 text-xs whitespace-nowrap rounded bg-black text-white",
            "shadow-sm pointer-events-none opacity-0 transition-opacity duration-300",
            "animate-fade-in",
            positionClasses[position]
          )}
          style={{ opacity: isVisible ? 1 : 0 }}
          role="tooltip"
        >
          {content}
          {/* Freccia del tooltip */}
          <div 
            className={cn(
              "absolute w-2 h-2 bg-black rotate-45",
              position === 'top' && 'bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2',
              position === 'bottom' && 'top-0 left-1/2 -translate-x-1/2 -translate-y-1/2',
              position === 'left' && 'right-0 top-1/2 -translate-y-1/2 translate-x-1/2',
              position === 'right' && 'left-0 top-1/2 -translate-y-1/2 -translate-x-1/2'
            )}
          />
        </div>
      )}
    </div>
  );
} 