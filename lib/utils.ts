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
export function generateSlug(title: string, year: string | null, id: number) {
  const slugTitle = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  return year ? `${slugTitle}-${year}-${id}` : `${slugTitle}-${id}`
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
  // Gestisce i nuovi formati semplificati: movie-123, tv-123, persona-123
  const simpleMatch = slug.match(/^(movie|tv|persona)-(\d+)$/);
  if (simpleMatch) return simpleMatch[2];
  
  // Cerca un ID alla fine dello slug (formato tradizionale titolo-id o titolo-anno-id)
  const matchEnd = slug.match(/[-](\d+)$/);
  if (matchEnd) return matchEnd[1];
  
  // Se non lo trova alla fine, cerca un ID ovunque nello slug
  const matchAnywhere = slug.match(/(\d{5,})/);
  if (matchAnywhere) return matchAnywhere[1];
  
  // Nessun ID trovato
  console.log(`Warning: Nessun ID trovato nello slug: ${slug}`);
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

/**
 * Traduce i nomi delle nazioni in italiano
 * @param countries Array di nomi di paesi in inglese
 * @returns Stringa con i nomi tradotti in italiano, separati da virgole
 */
export function translateCountries(countries: string[]): string {
  const translations: Record<string, string> = {
    "United States of America": "Stati Uniti d'America",
    "United States": "Stati Uniti",
    "United Kingdom": "Regno Unito",
    "Germany": "Germania",
    "France": "Francia",
    "Italy": "Italia",
    "Spain": "Spagna",
    "Japan": "Giappone",
    "China": "Cina",
    "Russia": "Russia",
    "Canada": "Canada",
    "Australia": "Australia",
    "Brazil": "Brasile",
    "Mexico": "Messico",
    "South Korea": "Corea del Sud",
    "India": "India",
    "Netherlands": "Paesi Bassi",
    "Sweden": "Svezia",
    "Denmark": "Danimarca",
    "Norway": "Norvegia",
    "Finland": "Finlandia",
    "Belgium": "Belgio",
    "Switzerland": "Svizzera",
    "Austria": "Austria",
    "Poland": "Polonia",
    "Greece": "Grecia",
    "Portugal": "Portogallo",
    "Ireland": "Irlanda",
    "New Zealand": "Nuova Zelanda",
    "Argentina": "Argentina",
    "Chile": "Cile",
    "Colombia": "Colombia",
    "Turkey": "Turchia",
    "Israel": "Israele",
    "South Africa": "Sudafrica"
  };
  
  // Traduci i nomi dei paesi
  return countries.map(country => translations[country] || country).join(", ");
}

/**
 * Traduce i codici lingua in italiano
 * @param langCode Codice lingua (es. "en", "fr", "it")
 * @returns Nome della lingua in italiano
 */
export function translateLanguage(langCode: string): string {
  const languages: Record<string, string> = {
    "en": "inglese",
    "es": "spagnolo",
    "fr": "francese",
    "de": "tedesco",
    "it": "italiano",
    "ja": "giapponese",
    "ko": "coreano",
    "zh": "cinese",
    "ru": "russo",
    "pt": "portoghese",
    "hi": "hindi",
    "ar": "arabo",
    "tr": "turco",
    "nl": "olandese",
    "pl": "polacco",
    "sv": "svedese",
    "da": "danese",
    "fi": "finlandese",
    "no": "norvegese",
    "he": "ebraico",
    "cs": "ceco",
    "hu": "ungherese",
    "th": "thailandese",
    "vi": "vietnamita",
    "ro": "rumeno",
    "uk": "ucraino",
    "el": "greco",
    "id": "indonesiano",
    "ms": "malese",
    "fa": "persiano"
  };

  // Normalizza il codice lingua (converti a minuscolo e prendi solo i primi 2 caratteri)
  const normalizedCode = langCode.toLowerCase().substring(0, 2);
  return languages[normalizedCode] || langCode.toUpperCase();
}

/**
 * Traduce lo stato della serie TV in italiano
 * @param status Stato della serie in inglese
 * @returns Stato tradotto in italiano
 */
export function translateStatus(status: string): string {
  const translations: Record<string, string> = {
    "Ended": "conclusa",
    "Returning Series": "in corso",
    "Canceled": "cancellata",
    "In Production": "in produzione",
    "Planned": "in programmazione"
  };
  
  return translations[status] || status.toLowerCase();
}

