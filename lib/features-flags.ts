/**
 * Flag di funzionalità per l'applicazione
 * 
 * Questo file consente di attivare/disattivare rapidamente determinate funzionalità
 * senza dover modificare il codice in più punti.
 */

export const FEATURES = {
  /**
   * Controllo per il tracciamento delle pagine generate in Supabase
   * Se disattivato, non verranno registrate nuove pagine nella tabella generated_pages
   * ma il resto dell'applicazione continuerà a funzionare normalmente
   */
  TRACK_GENERATED_PAGES: true,
}; 