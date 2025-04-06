import { createApiSupabaseClient } from './supabase-server';
import { FEATURES } from './features-flags';

// Cache della connessione Supabase per il tracking
let trackingClient: Awaited<ReturnType<typeof createApiSupabaseClient>> | null = null;

/**
 * Sistema di tracciamento pagine generate 
 * Facilmente disattivabile modificando FEATURES.TRACK_GENERATED_PAGES in features-flags.ts
 * 
 * @param slug - Slug della pagina
 * @param pageType - Tipo di pagina ('film' o 'serie')
 * @param isFirstGeneration - Se true, registra come prima generazione, altrimenti come visita
 */
export async function trackGeneratedPage(
  slug: string, 
  pageType: 'film' | 'serie', 
  isFirstGeneration: boolean = false
): Promise<void> {
  // Log di inizio per debug
  console.log(`⚠️ TRACK PAGE: Tentativo di tracciamento pagina ${isFirstGeneration ? '(GENERAZIONE)' : '(VISITA)'}: ${pageType}/${slug}`);
  
  // Se la feature è disattivata, termina subito
  if (!FEATURES.TRACK_GENERATED_PAGES) {
    console.log(`⚠️ TRACK PAGE: Tracciamento disattivato via FEATURES`);
    return;
  }
  
  try {
    // Verifica che lo slug sia valido
    if (!slug) {
      console.log('⚠️ TRACK PAGE: slug mancante');
      return;
    }
    
    // Usa client esistente o creane uno nuovo se necessario
    if (!trackingClient) {
      console.log(`⚠️ TRACK PAGE: Creazione nuovo client Supabase per tracking`);
      trackingClient = createApiSupabaseClient();
    }
    
    if (!trackingClient) {
      console.log('⚠️ TRACK PAGE: client Supabase non disponibile');
      return;
    }
    
    console.log(`⚠️ TRACK PAGE: Chiamata a RPC track_generated_page con:`, {
      p_slug: slug,
      p_page_type: pageType,
      p_is_first_generation: isFirstGeneration
    });
    
    // Utilizza la funzione RPC sicura per tracciare la pagina
    // Questa funzione gestisce sia inserimenti che aggiornamenti
    const { data, error } = await trackingClient.rpc('track_generated_page', {
      p_slug: slug,
      p_page_type: pageType,
      p_is_first_generation: isFirstGeneration
    });
    
    if (error) {
      console.log(`⚠️ TRACK PAGE: ERRORE per ${slug}`, error.message);
      console.log(`⚠️ TRACK PAGE: Dettagli completi errore:`, error);
      
      // Resetta il client in caso di errori di connessione
      if (error.code === 'PGRST301' || error.code === '28P01') {
        console.log('⚠️ TRACK PAGE: Errore di connessione, reset del client');
        trackingClient = null;
      }
    } else if (data) {
      // Operazione completata con successo
      const isNew = data.visit_count === 1;
      if (isNew && isFirstGeneration) {
        console.log(`✅ TRACK PAGE: registrata nuova pagina ${pageType} '${slug}'`);
      } else if (isFirstGeneration) {
        console.log(`✅ TRACK PAGE: aggiornata generazione esistente ${pageType} '${slug}', visite: ${data.visit_count}`);
      } else {
        console.log(`✅ TRACK PAGE: incrementata visita per ${pageType} '${slug}', visite: ${data.visit_count}`);
      }
    } else {
      console.log(`⚠️ TRACK PAGE: Nessun dato o errore restituito per ${slug}`);
    }
  } catch (error: any) {
    // Logga ma non far crashare l'app
    console.log('⚠️ TRACK PAGE: ERRORE GENERICO', error?.message || error);
    console.log('⚠️ TRACK PAGE: Stack trace:', error?.stack || 'Non disponibile');
    
    // Resetta il client in caso di errori generici
    trackingClient = null;
  }
} 