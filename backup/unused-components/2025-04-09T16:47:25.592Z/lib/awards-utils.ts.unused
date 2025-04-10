/**
 * Funzione per analizzare la stringa Awards di OMDB
 * 
 * @param awardsString - Stringa con i premi ricevuti dal film
 * @returns Oggetto con analisi strutturata dei premi
 */
export function analyzeAwards(awardsString: string | undefined | null): any {
  if (!awardsString || awardsString === 'N/A') {
    return {
      hasAwards: false,
      oscars: 0,
      nominations: 0,
      wins: 0,
      other: 0,
      summary: 'Nessun premio'
    }
  }

  // Struttura per memorizzare l'analisi
  const analysis = {
    hasAwards: true,
    oscars: 0,
    nominations: 0,
    wins: 0,
    other: 0,
    summary: '',
    rawText: awardsString
  }

  // Cerca le vittorie agli Oscar
  const oscarWinsMatch = awardsString.match(/Won (\d+) Oscar/i)
  if (oscarWinsMatch) {
    analysis.oscars = parseInt(oscarWinsMatch[1], 10)
  }

  // Cerca le nomination specifiche
  const nominationsMatch = awardsString.match(/Nominated for (\d+)/i)
  if (nominationsMatch) {
    analysis.nominations = parseInt(nominationsMatch[1], 10)
  } else {
    // Pattern alternativo per le nomination - "X nominations total" o "X nominations."
    const totalNominationsMatch = awardsString.match(/(\d+) nomination/i)
    if (totalNominationsMatch) {
      analysis.nominations = parseInt(totalNominationsMatch[1], 10)
    }
  }

  // Cerca vittorie non-Oscar con vari pattern
  // 1. Pattern "X wins & Y nominations"
  const winsAndNominationsMatch = awardsString.match(/(\d+) wins/i)
  if (winsAndNominationsMatch) {
    analysis.wins = parseInt(winsAndNominationsMatch[1], 10)
  } 
  // 2. Pattern "Another X wins"
  const anotherWinsMatch = awardsString.match(/Another (\d+) wins/i)
  if (anotherWinsMatch) {
    analysis.wins = parseInt(anotherWinsMatch[1], 10)
  }

  // Crea un riepilogo
  const summaryParts = []
  if (analysis.oscars > 0) {
    summaryParts.push(`${analysis.oscars} Oscar`)
  }
  if (analysis.wins > 0) {
    summaryParts.push(`${analysis.wins} altri premi`)
  }
  if (analysis.nominations > 0) {
    summaryParts.push(`${analysis.nominations} nomination`)
  }

  analysis.summary = summaryParts.length > 0 
    ? summaryParts.join(', ') 
    : 'Informazioni sui premi non strutturate'

  return analysis
}