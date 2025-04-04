import { redirect } from 'next/navigation';

/**
 * Verifica se un oggetto ha dati sufficienti per essere renderizzato
 * e raccoglie informazioni sui campi mancanti
 * @param data L'oggetto da verificare
 * @param requiredFields Array di campi che devono essere presenti e non vuoti
 * @returns Oggetto con risultato e dettagli sui campi mancanti
 */
export function hasRequiredData<T>(
  data: T | null | undefined, 
  requiredFields: (keyof T)[]
): { isValid: boolean; missingFields: string[] } {
  const missingFields: string[] = [];
  
  if (!data) {
    return { isValid: false, missingFields: ['entire_object'] };
  }
  
  requiredFields.forEach(field => {
    const value = data[field];
    let fieldIsMissing = false;
    
    if (value === undefined || value === null) {
      fieldIsMissing = true;
    }
    else if (typeof value === 'string' && value.trim() === '') {
      fieldIsMissing = true;
    }
    else if (Array.isArray(value) && value.length === 0) {
      fieldIsMissing = true;
    }
    
    if (fieldIsMissing) {
      missingFields.push(String(field));
    }
  });
  
  return { 
    isValid: missingFields.length === 0,
    missingFields 
  };
}

/**
 * Genera un URL di errore con parametri di query
 */
export function generateErrorUrl({
  title = "Dati insufficienti",
  message = "Non ci sono abbastanza dati per mostrare questa pagina",
  redirectPath = "/",
  countdownSeconds = 5,
  missingFields = []
}: {
  title?: string;
  message?: string;
  redirectPath?: string;
  countdownSeconds?: number;
  missingFields?: string[];
} = {}): string {
  const params = new URLSearchParams();
  params.append('title', title);
  
  // Aggiungi i campi mancanti al messaggio se ce ne sono
  if (missingFields.length > 0) {
    message += `\n\nCampi mancanti: ${missingFields.join(', ')}`;
  }
  
  params.append('message', message);
  params.append('redirectPath', redirectPath);
  params.append('countdownSeconds', countdownSeconds.toString());
  
  const errorUrl = `/data-error?${params.toString()}`;
  console.log("Generato URL di errore:", errorUrl);
  return errorUrl;
}

/**
 * Gestisce il caso in cui i dati necessari non sono disponibili
 * @param data I dati da verificare
 * @param requiredFields Array di campi che devono essere presenti e non vuoti
 * @param errorOptions Opzioni per la pagina di errore
 */
export function handleMissingData<T>(
  data: T | null | undefined, 
  requiredFields: (keyof T)[],
  errorOptions: {
    title?: string;
    message?: string;
    redirectPath?: string;
    countdownSeconds?: number;
  } = {}
): never {
  const { isValid, missingFields } = hasRequiredData(data, requiredFields);
  
  if (!isValid) {
    console.error("Dati insufficienti per generare la pagina", { data, missingFields });
    const errorUrl = generateErrorUrl({
      ...errorOptions,
      missingFields
    });
    redirect(errorUrl);
  }
  
  // Questa parte non verrà mai eseguita a causa del redirect
  throw new Error("Unexpected execution after redirect");
} 