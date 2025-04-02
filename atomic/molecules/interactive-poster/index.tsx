'use client';

import React, { useRef, useState, useEffect } from 'react';
import Image from 'next/image';

interface InteractivePosterProps {
  posterUrl: string;
  title: string;
  isDesktop: boolean;
  onSizeChange?: (size: number) => void;
  onPositionChange?: (position: { x: number; y: number }) => void;
}

export const InteractivePoster: React.FC<InteractivePosterProps> = ({
  posterUrl,
  title,
  isDesktop,
  onSizeChange,
  onPositionChange,
}) => {
  const [posterSize, setPosterSize] = useState(1);
  const [posterPosition, setPosterPosition] = useState({ x: 0, y: 0 });
  const [isResizing, setIsResizing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startPoint, setStartPoint] = useState({ x: 0, y: 0 });
  const posterRef = useRef<HTMLDivElement>(null);

  // Reset poster to original state
  const resetPoster = () => {
    setPosterSize(1);
    setPosterPosition({ x: 0, y: 0 });
    onSizeChange?.(1);
    onPositionChange?.({ x: 0, y: 0 });
  };

  // Handle mouse down for dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isDesktop) return;
    e.preventDefault();
    setIsDragging(true);
    setStartPoint({ x: e.clientX - posterPosition.x, y: e.clientY - posterPosition.y });
  };

  // Handle resize start
  const handleResizeStart = (e: React.MouseEvent) => {
    if (!isDesktop) return;
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    setStartPoint({ x: e.clientX, y: e.clientY });
  };

  // Handle mouse move for both dragging and resizing
  const handleMouseMove = (e: MouseEvent) => {
    if (!isDesktop) return;

    if (isDragging) {
      const newX = e.clientX - startPoint.x;
      const newY = e.clientY - startPoint.y;

      const maxX = 500;
      const minX = -500;
      const maxY = 300;
      const minY = -300;
      
      const constrainedX = Math.max(minX, Math.min(maxX, newX));
      const constrainedY = Math.max(minY, Math.min(maxY, newY));
      
      setPosterPosition({ x: constrainedX, y: constrainedY });
      onPositionChange?.({ x: constrainedX, y: constrainedY });
      
      if (posterRef.current) {
        const rect = posterRef.current.getBoundingClientRect();
        if (rect.right > window.innerWidth + 5) {
          setPosterPosition(prev => ({ ...prev, x: prev.x - 50 }));
          onPositionChange?.({ x: posterPosition.x - 50, y: posterPosition.y });
        }
      }
    } else if (isResizing) {
      const deltaX = e.clientX - startPoint.x;
      const deltaY = e.clientY - startPoint.y;
      const maxDelta = Math.max(Math.abs(deltaX), Math.abs(deltaY));
      const direction = Math.abs(deltaX) > Math.abs(deltaY) ? (deltaX > 0 ? 1 : -1) : deltaY > 0 ? 1 : -1;

      const newSize = Math.max(0.5, Math.min(2.5, posterSize + direction * maxDelta * 0.01));
      setPosterSize(newSize);
      onSizeChange?.(newSize);
      setStartPoint({ x: e.clientX, y: e.clientY });
    }
  };

  // Handle mouse up to stop dragging/resizing
  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
  };

  // Add and remove event listeners
  useEffect(() => {
    if (isDesktop && (isDragging || isResizing)) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, isDesktop, startPoint, posterPosition, posterSize]);

  return (
    <div
      ref={posterRef}
      className="relative w-[200px] h-[300px] sm:w-[300px] sm:h-[450px] cursor-move"
      style={{
        transform: `translate(${posterPosition.x}px, ${posterPosition.y}px) scale(${posterSize})`,
        transition: isDragging || isResizing ? 'none' : 'transform 0.3s ease-out',
      }}
      onMouseDown={handleMouseDown}
    >
      <Image
        src={posterUrl}
        alt={title}
        fill
        className="object-cover rounded-lg shadow-lg border-2 border-gray-800"
        priority
      />
      {isDesktop && (
        <div
          className="absolute bottom-0 right-0 w-6 h-6 bg-black bg-opacity-50 rounded-bl-lg cursor-se-resize flex items-center justify-center"
          onMouseDown={handleResizeStart}
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="white">
            <path d="M1 9L9 1M5 9L9 5M9 9L9 9" stroke="white" strokeWidth="1.5" />
          </svg>
        </div>
      )}
    </div>
  );
}; 