import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

// Formatta una data nel formato italiano
export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return ""

  try {
    const date = new Date(dateString)
    return date.toLocaleDateString("it-IT", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  } catch (error) {
    console.error("Error formatting date:", error)
    return dateString
  }
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Normalizza un testo per creare uno slug SEO-friendly
 * @param text Il testo da convertire in slug
 * @returns Testo normalizzato come slug
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD') // rimuove accenti
    .replace(/[\u0300-\u036f]/g, '') // rimuove accenti (parte 2)
    .replace(/[^a-z0-9\s-]/g, '') // elimina simboli
    .replace(/\s+/g, '-') // spazi → trattini
    .replace(/-+/g, '-') // doppio trattino
    .trim();
}

/**
 * Genera uno slug SEO-friendly
 * @param title Titolo del film
 * @param year Anno di uscita (o null se non disponibile)
 * @param id ID univoco del film
 * @returns Slug completo con titolo, anno e id
 */
export function generateSlug(title: string, year: string | null, id: number | string): string {
  return `${slugify(title)}${year ? `-${year}` : ""}-${id}`
}

/**
 * Genera uno slug SEO-friendly
 * @param title Titolo del film
 * @param year Anno di uscita
 * @param id ID univoco del film
 * @returns Slug completo del film
 */
export function generateFilmSlug(title: string, year: number, id: number): string {
  return `${slugify(title)}-${year}-${id}`;
}

/**
 * Estrae l'ID numerico da uno slug
 * @param slug Lo slug completo (es. "titolo-film-2021-12345")
 * @returns L'ID numerico estratto dallo slug, o null se non trovato
 */
export function extractIdFromSlug(slug: string): string | null {
  // Cerca il numero alla fine dello slug dopo l'ultimo trattino
  const match = slug.match(/-(\d+)$/)
  return match ? match[1] : null
}

/**
 * Recupera i dettagli di un film dal suo slug
 * @param slug Lo slug del film da cercare
 * @returns I dettagli del film o null se non trovato
 */
export async function getMovieBySlug(slug: string) {
  try {
    // Estrai l'ID dallo slug
    const id = extractIdFromSlug(slug);
    if (!id) return null;
    
    // Importa dinamicamente per evitare dipendenze circolari
    const { getMovieDetails } = await import('./tmdb');
    
    // Recupera i dettagli del film usando l'ID
    const movie = await getMovieDetails(id, "movie");
    return movie;
  } catch (error) {
    console.error("Errore nel recupero del film per slug:", error);
    return null;
  }
}

// Definizione del tipo per i membri della troupe
interface CrewMember {
  job: string;
  name?: string;
  id?: number;
  [key: string]: any;
}

/**
 * Verifica se un oggetto film contiene tutti i campi necessari
 * @param film Oggetto film da validare
 * @returns true se il film è valido, false altrimenti
 */
export function isValidFilm(film: any): boolean {
  return Boolean(
    film &&
    film.id &&
    film.title
    // I seguenti campi sono ora opzionali:
    // film.release_date
    // film.poster_path
    // film.credits?.crew?.find((person: CrewMember) => person.job === "Director")
    // film.overview
  );
}

/**
 * Verifica se un oggetto serie TV contiene tutti i campi necessari
 * @param show Oggetto serie TV da validare
 * @returns true se la serie è valida, false altrimenti
 */
export function isValidShow(show: any): boolean {
  return Boolean(
    show &&
    show.id &&
    show.name
    // I seguenti campi sono ora opzionali:
    // show.first_air_date
    // show.poster_path
    // show.overview
  );
}

/**
 * Verifica se un percorso immagine è valido
 * @param path Il percorso dell'immagine da verificare
 * @returns true se il percorso è valido, false altrimenti
 */
export function checkImagePath(path: string | null | undefined): boolean {
  return !!path && typeof path === 'string' && path.startsWith('/');
}

/**
 * Verifica se un oggetto persona contiene tutti i campi necessari
 * @param person Oggetto persona da validare
 * @returns true se la persona è valida, false altrimenti
 */
export function isValidPerson(person: any): boolean {
  return Boolean(
    person &&
    person.id &&
    person.name
    // I seguenti campi sono ora opzionali:
    // person.profile_path
    // person.biography
  );
}

