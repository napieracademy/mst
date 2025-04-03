"use client"

import React from 'react';
import { cn } from "@/atomic/utils/cn";

interface GraphEdgeProps {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  weight?: number;
  className?: string;
  isHighlighted?: boolean;
  showWeight?: boolean;
}

export const GraphEdge: React.FC<GraphEdgeProps> = ({
  x1,
  y1,
  x2,
  y2,
  weight = 1,
  className,
  isHighlighted = false,
  showWeight = false
}) => {
  // Verifica che i valori delle coordinate siano numeri validi
  if (isNaN(x1) || isNaN(y1) || isNaN(x2) || isNaN(y2)) {
    console.error(`GraphEdge: Invalid coordinates - x1: ${x1}, y1: ${y1}, x2: ${x2}, y2: ${y2}`);
    return null;
  }

  // Calcola il punto medio dell'arco per posizionare il peso
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;
  
  // Normalizza il peso per determinare lo spessore della linea (da 1 a 3)
  const strokeWidth = weight >= 0 ? Math.max(1, Math.min(3, (10 - weight) / 3)) : 1;
  
  return (
    <g>
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        className={cn(
          "transition-all duration-300",
          isHighlighted ? "stroke-yellow-400" : "stroke-gray-700",
          className
        )}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      
      {showWeight && (
        <text
          x={midX}
          y={midY}
          dy="-5"
          textAnchor="middle"
          fontSize="10"
          fill={isHighlighted ? "#fde047" : "#9ca3af"}
          className="pointer-events-none bg-black px-1 rounded"
        >
          {weight.toFixed(1)}
        </text>
      )}
    </g>
  );
}; 