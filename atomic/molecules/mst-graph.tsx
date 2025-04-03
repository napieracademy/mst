"use client"

import React from 'react';
import { cn } from '@/atomic/utils/cn';
import { Graph } from '@/lib/graph';
import Link from 'next/link';
import Image from "next/image"

interface MSTGraphProps {
  graph: Graph;
  className?: string;
  type?: 'movie' | 'tv';
  getLinkUrl?: (nodeId: number) => string;
}

export const MSTGraph: React.FC<MSTGraphProps> = ({
  graph,
  className,
  type = 'movie',
  getLinkUrl
}) => {
  if (!graph || !graph.nodes || graph.nodes.length === 0 || !graph.edges || graph.edges.length === 0) {
    return (
      <div className="p-4 bg-gray-900 text-white rounded-lg text-center">
        <p>Dati insufficienti per visualizzare il grafo.</p>
      </div>
    );
  }

  // Funzione per generare l'URL per un nodo
  const getNodeUrl = (nodeId: number): string => {
    // Se è stata fornita una funzione personalizzata, usala
    if (getLinkUrl) {
      return getLinkUrl(nodeId);
    }
    // Altrimenti usa il formato URL standard
    return `/${type}/${nodeId}`;
  };

  return (
    <div className={cn("relative p-4 bg-gray-900 rounded-lg", className)}>
      <h3 className="text-white text-xl mb-4">Relazioni tra i contenuti</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {graph.nodes.map(node => (
          <div key={node.id} className="flex flex-col items-center">
            <Link href={getNodeUrl(node.id)} className="block">
              <div className="relative h-36 w-24 mb-2 rounded-lg overflow-hidden transition-transform hover:scale-105">
                {node.data.poster_path ? (
                  <Image
                    src={`https://image.tmdb.org/t/p/w92${node.data.poster_path}`}
                    alt={node.label}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                    <span className="text-white text-lg">{node.label.substring(0, 2)}</span>
                  </div>
                )}
              </div>
              
              <p className="text-white text-sm text-center truncate max-w-full">
                {node.label}
              </p>
            </Link>
            
            <div className="mt-1 text-gray-400 text-xs">
              {/* Trova le connessioni (archi) per questo nodo */}
              {graph.edges
                .filter(edge => edge.source === node.id || edge.target === node.id)
                .slice(0, 2)
                .map((edge, idx) => {
                  // Trova l'altro nodo connesso
                  const connectedNodeId = edge.source === node.id ? edge.target : edge.source;
                  const connectedNode = graph.nodes.find(n => n.id === connectedNodeId);
                  
                  if (!connectedNode) return null;
                  
                  return (
                    <div key={idx} className="text-center whitespace-nowrap">
                      Simile a: <Link href={getNodeUrl(connectedNode.id)} className="underline hover:text-yellow-400">
                        {connectedNode.label.length > 15 
                          ? `${connectedNode.label.substring(0, 15)}...` 
                          : connectedNode.label}
                      </Link>
                    </div>
                  );
                })}
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 p-2 bg-black rounded text-xs text-gray-400">
        <p>Questa visualizzazione mostra le relazioni tra contenuti simili basate su un algoritmo MST (Minimum Spanning Tree).</p>
      </div>
    </div>
  );
}; 