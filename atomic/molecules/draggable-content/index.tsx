
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useSpring } from 'framer-motion';

interface DraggableContentProps {
  children: React.ReactNode;
  className?: string;
  dragConstraints?: {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
  };
  snapBackDuration?: number; // durata dell'animazione di ritorno in ms
  dragElastic?: number; // elasticità durante il drag (0-1)
}

export function DraggableContent({
  children,
  className = '',
  dragConstraints = {
    top: -100,
    right: 100,
    bottom: 100,
    left: -100,
  },
  snapBackDuration = 0.5,
  dragElastic = 0.5,
}: DraggableContentProps) {
  const [isDragging, setIsDragging] = useState(false);
  const constraintsRef = useRef<HTMLDivElement>(null);
  
  // Utilizzo di springs per un effetto più fluido di ritorno alla posizione originale
  const x = useSpring(0, {
    stiffness: 1000,
    damping: 100,
    duration: snapBackDuration * 1000,
  });
  
  const y = useSpring(0, {
    stiffness: 1000,
    damping: 100,
    duration: snapBackDuration * 1000,
  });

  return (
    <div ref={constraintsRef} className={`relative ${className}`}>
      <motion.div
        drag
        dragElastic={dragElastic}
        dragConstraints={constraintsRef}
        style={{ x, y }}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={() => {
          setIsDragging(false);
          // Resetta alla posizione originale
          x.set(0);
          y.set(0);
        }}
        className="cursor-grab active:cursor-grabbing"
      >
        {children}
      </motion.div>
    </div>
  );
}
