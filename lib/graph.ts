import { Movie } from './types';

/**
 * Interfaccia per un nodo del grafo
 */
export interface GraphNode {
  id: number;
  label: string;
  data: Movie;
}

/**
 * Interfaccia per un arco del grafo
 */
export interface GraphEdge {
  source: number;
  target: number;
  weight: number;
}

/**
 * Interfaccia per un grafo
 */
export interface Graph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

/**
 * Classe Union-Find per l'algoritmo di Kruskal
 */
class UnionFind {
  private parent: number[];
  private rank: number[];

  constructor(size: number) {
    this.parent = Array.from({ length: size }, (_, i) => i);
    this.rank = Array(size).fill(0);
  }

  // Trova il rappresentante (radice) di un insieme
  find(x: number): number {
    if (this.parent[x] !== x) {
      this.parent[x] = this.find(this.parent[x]); // Path compression
    }
    return this.parent[x];
  }

  // Unisce due insiemi
  union(x: number, y: number): void {
    const rootX = this.find(x);
    const rootY = this.find(y);

    if (rootX === rootY) return;

    // Union by rank
    if (this.rank[rootX] < this.rank[rootY]) {
      this.parent[rootX] = rootY;
    } else if (this.rank[rootX] > this.rank[rootY]) {
      this.parent[rootY] = rootX;
    } else {
      this.parent[rootY] = rootX;
      this.rank[rootX]++;
    }
  }
}

/**
 * Calcola la similarità tra due film
 * @param movie1 Primo film
 * @param movie2 Secondo film
 * @returns Un punteggio di similarità (più è alto, più sono simili)
 */
export function calculateSimilarity(movie1: Movie, movie2: Movie): number {
  try {
    if (!movie1 || !movie2) {
      console.error("Invalid movie objects in calculateSimilarity");
      return 0;
    }

    let similarity = 0;

    // Similarità basata sui generi
    const genres1 = movie1.genres || [];
    const genres2 = movie2.genres || [];
    
    const commonGenres = genres1.filter(g1 => 
      genres2.some(g2 => g2.id === g1.id)
    ).length;
    
    if (genres1.length && genres2.length) {
      similarity += (commonGenres / Math.max(genres1.length, genres2.length)) * 5;
    }

    // Similarità basata sulla popolarità (differenza inversa)
    const popularity1 = movie1.popularity || 0;
    const popularity2 = movie2.popularity || 0;
    const popDiff = Math.abs(popularity1 - popularity2);
    similarity += Math.max(0, 3 - (popDiff / 20));

    // Similarità basata sul voto medio (differenza inversa)
    const voteAvg1 = movie1.vote_average || 0;
    const voteAvg2 = movie2.vote_average || 0;
    const voteDiff = Math.abs(voteAvg1 - voteAvg2);
    similarity += Math.max(0, 2 - voteDiff);

    return similarity;
  } catch (error) {
    console.error("Error in calculateSimilarity:", error);
    return 0; // Ritorna 0 similarità in caso di errore
  }
}

/**
 * Crea un grafo completo dai film, dove ogni film è collegato a ogni altro film
 * con un peso basato sulla loro similarità (più è alta la similarità, più è basso il peso)
 */
export function createGraphFromMovies(movies: Movie[]): Graph {
  try {
    if (!movies || movies.length === 0) {
      console.error("No movies provided to createGraphFromMovies");
      return { nodes: [], edges: [] };
    }

    const nodes: GraphNode[] = movies.map(movie => ({
      id: movie.id,
      label: movie.title || movie.name || "Sconosciuto",
      data: movie
    }));

    const edges: GraphEdge[] = [];

    // Crea archi tra ogni coppia di nodi
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        try {
          const similarity = calculateSimilarity(movies[i], movies[j]);
          // Invertiamo la similarità per ottenere il peso (vogliamo MST con peso minimo)
          const weight = 10 - similarity;
          
          edges.push({
            source: nodes[i].id,
            target: nodes[j].id,
            weight
          });
        } catch (innerError) {
          console.error(`Error calculating similarity between ${movies[i]?.id} and ${movies[j]?.id}:`, innerError);
          // Continua con il prossimo arco
        }
      }
    }

    // Se il grafo è vuoto o non ha abbastanza archi, lancia un errore
    if (nodes.length < 2 || edges.length === 0) {
      console.error("Not enough valid nodes or edges to create a graph");
      return { nodes: [], edges: [] };
    }

    return { nodes, edges };
  } catch (error) {
    console.error("Error in createGraphFromMovies:", error);
    return { nodes: [], edges: [] };
  }
}

/**
 * Algoritmo di Kruskal per trovare il Minimum Spanning Tree
 */
export function kruskalMST(graph: Graph): Graph {
  try {
    if (!graph || !graph.nodes || !graph.edges || graph.nodes.length === 0) {
      console.error("Invalid graph data for MST:", graph);
      return { nodes: [], edges: [] }; // Ritorna un grafo vuoto
    }
    
    const { nodes, edges } = graph;

    // Ordina gli archi per peso (dal più basso al più alto)
    const sortedEdges = [...edges].sort((a, b) => a.weight - b.weight);
    
    // Mappa gli ID dei nodi a indici contiguent
    const nodeIndices = new Map<number, number>();
    nodes.forEach((node, index) => {
      nodeIndices.set(node.id, index);
    });

    const unionFind = new UnionFind(nodes.length);
    const mstEdges: GraphEdge[] = [];

    // Per ogni arco in ordine di peso
    for (const edge of sortedEdges) {
      const sourceIndex = nodeIndices.get(edge.source);
      const targetIndex = nodeIndices.get(edge.target);

      // Verifica se gli indici esistono
      if (sourceIndex === undefined || targetIndex === undefined) {
        console.warn(`Nodo mancante per arco: ${edge.source} -> ${edge.target}`);
        continue;
      }

      // Se l'aggiunta di questo arco non forma un ciclo
      if (unionFind.find(sourceIndex) !== unionFind.find(targetIndex)) {
        // Aggiungi l'arco al MST
        mstEdges.push(edge);
        unionFind.union(sourceIndex, targetIndex);

        // Se abbiamo già n-1 archi (per n nodi), abbiamo il MST completo
        if (mstEdges.length === nodes.length - 1) {
          break;
        }
      }
    }

    return {
      nodes,
      edges: mstEdges
    };
  } catch (error) {
    console.error("Error in kruskalMST:", error);
    return { nodes: [], edges: [] }; // Ritorna un grafo vuoto in caso di errore
  }
} 