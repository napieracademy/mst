"use client"

import React from 'react';
import { cn } from "@/atomic/utils/cn";
import Image from "next/image";
import Link from "next/link";

interface GraphNodeProps {
  id: number;
  label: string;
  x: number;
  y: number;
  imageUrl?: string | null;
  color?: string;
  radius?: number;
  className?: string;
  isSelected?: boolean;
  onClick?: (id: number) => void;
  type?: 'movie' | 'tv';
}

export const GraphNode: React.FC<GraphNodeProps> = ({
  id,
  label,
  x,
  y,
  imageUrl,
  color = "#fde047", // Yellow-400 in Tailwind
  radius = 30,
  className,
  isSelected = false,
  onClick,
  type = 'movie'
}) => {
  if (!id || isNaN(x) || isNaN(y)) {
    console.error(`GraphNode: Invalid props - id: ${id}, x: ${x}, y: ${y}`);
    return null;
  }

  const safeLabel = label || "Sconosciuto";
  
  const handleClick = () => {
    if (onClick) {
      onClick(id);
    }
  };

  return (
    <g
      transform={`translate(${x}, ${y})`}
      onClick={handleClick}
      className={cn(
        "cursor-pointer transition-all duration-300 ease-out hover:opacity-90 group",
        isSelected ? "scale-110" : "",
        className
      )}
    >
      {/* Nodo principale con immagine o colore di sfondo */}
      <Link href={`/${type}/${id}`}>
        <circle
          r={radius}
          fill={isSelected ? "#f59e0b" : color}
          className={cn(
            "stroke-2",
            isSelected ? "stroke-white" : "stroke-gray-700",
            "transition-all duration-300",
            "group-hover:stroke-white"
          )}
        />
        
        {imageUrl ? (
          <foreignObject
            x={-radius * 0.9}
            y={-radius * 0.9}
            width={radius * 1.8}
            height={radius * 1.8}
            className="overflow-hidden rounded-full"
          >
            <div className="w-full h-full relative">
              <Image
                src={`https://image.tmdb.org/t/p/w92${imageUrl}`}
                alt={safeLabel}
                fill
                className="object-cover"
              />
            </div>
          </foreignObject>
        ) : (
          <text
            textAnchor="middle"
            dy=".3em"
            fontSize={radius * 0.4}
            fill={isSelected ? "white" : "black"}
            className="pointer-events-none font-bold"
          >
            {safeLabel.substring(0, 2)}
          </text>
        )}
      </Link>
      
      {/* Etichetta del nodo */}
      <text
        textAnchor="middle"
        y={radius + 15}
        fontSize={12}
        fill="white"
        className={cn(
          "pointer-events-none opacity-0 transition-opacity duration-300",
          "group-hover:opacity-100",
          isSelected ? "opacity-100" : ""
        )}
      >
        {safeLabel.length > 20 ? `${safeLabel.substring(0, 20)}...` : safeLabel}
      </text>
    </g>
  );
}; 