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
 * @param title Titolo del contenuto
 * @param year Anno di uscita
 * @param id ID univoco
 * @returns Slug normalizzato
 */
export function generateSlug(title: string, year: string | number | null, id: number | string): string {
  // Normalizza il titolo usando la funzione slugify
  const normalizedTitle = slugify(title);
  
  // Se non abbiamo l'anno, usa solo titolo-id
  if (!year) {
    return `${normalizedTitle}-${id}`;
  }
  
  return `${normalizedTitle}-${year}-${id}`;
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
 * Estrae l'ID da uno slug
 * @param slug Lo slug completo
 * @returns L'ID estratto, o null se non trovato
 */
export function extractIdFromSlug(slug: string): string | null {
  // Cerca un ID alla fine dello slug
  // Gestisce sia slug con formato titolo-id che titolo-anno-id
  const matchEnd = slug.match(/[-](\d+)$/);
  if (matchEnd) return matchEnd[1];
  
  // Se non lo trova alla fine, cerca un ID ovunque nello slug
  const matchAnywhere = slug.match(/(\d{5,})/);
  if (matchAnywhere) return matchAnywhere[1];
  
  // Nessun ID trovato
  console.error(`Nessun ID trovato nello slug: ${slug}`);
  return null;
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

