export async function fetchImdbAwards(imdbId: string) {
  try {
    if (!imdbId) {
      console.error('IMDb ID is missing or invalid');
      return null;
    }
    
    // Check if API key is available - use provided key as fallback for testing
    const apiKey = process.env.NEXT_PUBLIC_RAPIDAPI_KEY || '93ba2d0ef4msh63a61e6cc307208p151d14jsnacb83f03f7ff';
    if (!apiKey) {
      console.error('RapidAPI key is missing. Make sure NEXT_PUBLIC_RAPIDAPI_KEY is set in your environment');
      return null;
    }

    console.log(`Fetching awards for IMDb ID: ${imdbId}`);
    
    // Add language=it-IT parameter to get Italian awards data
    const response = await fetch(
      `https://imdb8.p.rapidapi.com/title/get-awards?tconst=${imdbId}&language=it-IT`,
      {
        headers: {
          'x-rapidapi-host': 'imdb8.p.rapidapi.com',
          'x-rapidapi-key': apiKey,
          // Add Accept-Language header for Italian content
          'Accept-Language': 'it-IT,it;q=0.9'
        },
        next: {
          revalidate: 86400 // Cache for 24 hours
        }
      }
    );

    if (!response.ok) {
      const statusText = response.statusText;
      const status = response.status;
      console.error(`API request failed with status: ${status} ${statusText}`);
      
      // Try to get more info from the response
      try {
        const errorBody = await response.text();
        console.error('Error response body:', errorBody);
      } catch (e) {
        console.error('Could not parse error response');
      }
      
      return null; // Return null instead of throwing to avoid breaking the UI
    }

    const data = await response.json();
    
    // Debug the structure to understand award outcomes
    console.log("Awards data structure sample:", 
      data?.resource?.awards && data.resource.awards.length > 0 
        ? data.resource.awards[0] 
        : "No awards found");
    
    // Process the data to normalize the "winner" information
    if (data && data.resource && data.resource.awards) {
      // Define prestigious awards names in Italian and English
      const prestigiousAwards = [
        // Names and variations of the most prestigious awards in Italian and English
        'oscar', 'academy award', 'premio oscar', 'accademia',
        'cannes', 'palme d\'or', 'palma d\'oro',
        'golden globe', 'globo d\'oro',
        'bafta',
        'venice', 'venezia', 'leone d\'oro', 'golden lion', 'mostra',
        'berlin', 'berlino', 'orso d\'oro', 'golden bear', 'berlinale',
        'screen actors guild', 'sag award', 'sindacato attori'
      ];

      // Italian translations of "Winner" for matching
      const winnerTerms = ['winner', 'vincitore', 'vinto', 'vincente'];

      data.resource.awards = data.resource.awards.map(award => {
        // Check various possible fields that might indicate a win using Italian terms
        const outcomeStr = (award.outcome || award.awardOutcome || '').toLowerCase();
        const isWinner = 
          winnerTerms.some(term => outcomeStr.includes(term)) || 
          award.isWinner === true;
        
        // Check if this is a prestigious award
        const awardNameLower = award.awardName?.toLowerCase() || '';
        const isPrestigious = prestigiousAwards.some(
          prestigious => awardNameLower.includes(prestigious)
        );
        
        // Normalize the outcome field for consistent display
        return {
          ...award,
          normalizedOutcome: isWinner ? "Winner" : "Nominated",
          isPrestigiousAward: isPrestigious
        };
      });
      
      // Filter to only include winners from prestigious awards if any exist
      const prestigiousWinners = data.resource.awards.filter(
        award => award.normalizedOutcome === "Winner" && award.isPrestigiousAward
      );
      
      // If we have prestigious winners, generate text summary in Italian
      if (prestigiousWinners.length > 0) {
        // Group by award name for better text formatting
        const awardsByName = prestigiousWinners.reduce((acc, award) => {
          if (!acc[award.awardName]) {
            acc[award.awardName] = [];
          }
          acc[award.awardName].push(award);
          return acc;
        }, {} as Record<string, any[]>);
        
        // Generate the awards text
        let awardsText = "Il film è stato premiato con ";
        const awardParts: string[] = [];
        
        Object.entries(awardsByName).forEach(([awardName, awards]) => {
          const categories = awards.map(award => award.category).join(", ");
          const years = [...new Set(awards.map(award => award.year))].sort().join(", ");
          
          // Format for different award types with Italian text
          const awardNameLower = awardName.toLowerCase();
          if (awardNameLower.includes("oscar") || awardNameLower.includes("academy")) {
            awardParts.push(`${awards.length} Oscar ${awards.length === 1 ? 'per la categoria' : 'per le categorie'} ${categories}${years ? ` nell'anno ${years}` : ''}`);
          } 
          else if (awardNameLower.includes("golden globe") || awardNameLower.includes("globo d'oro")) {
            awardParts.push(`${awards.length} Golden Globe ${awards.length === 1 ? 'per' : 'per'} ${categories}${years ? ` nell'anno ${years}` : ''}`);
          }
          else if (awardNameLower.includes("cannes")) {
            awardParts.push(`la Palma d'Oro al Festival di Cannes ${years ? `del ${years}` : ''} ${categories ? `per ${categories}` : ''}`);
          }
          else if (awardNameLower.includes("venice") || awardNameLower.includes("venezia")) {
            awardParts.push(`il Leone d'Oro al Festival di Venezia ${years ? `del ${years}` : ''} ${categories ? `per ${categories}` : ''}`);
          }
          else if (awardNameLower.includes("berlin") || awardNameLower.includes("berlino")) {
            awardParts.push(`l'Orso d'Oro al Festival di Berlino ${years ? `del ${years}` : ''} ${categories ? `per ${categories}` : ''}`);
          }
          else if (awardNameLower.includes("bafta")) {
            awardParts.push(`${awards.length} BAFTA ${awards.length === 1 ? 'per' : 'per'} ${categories}${years ? ` nell'anno ${years}` : ''}`);
          }
          else if (awardNameLower.includes("screen actors guild") || awardNameLower.includes("sag") || awardNameLower.includes("sindacato attori")) {
            awardParts.push(`${awards.length} Screen Actors Guild Award ${awards.length === 1 ? 'per' : 'per'} ${categories}${years ? ` nell'anno ${years}` : ''}`);
          }
          else {
            awardParts.push(`${awards.length} ${awardName} ${awards.length === 1 ? 'per' : 'per'} ${categories}${years ? ` nell'anno ${years}` : ''}`);
          }
        });
        
        // Join award parts with proper punctuation
        if (awardParts.length === 1) {
          awardsText += awardParts[0] + ".";
        } else if (awardParts.length === 2) {
          awardsText += awardParts.join(" e ") + ".";
        } else {
          const lastPart = awardParts.pop();
          awardsText += awardParts.join(", ") + " e " + lastPart + ".";
        }
        
        // Add the text to data
        data.awardsText = awardsText;
        console.log("Generated awards text:", awardsText);
      } 
      else {
        // Handle case for regular winners and nominations in Italian
        const allWinners = data.resource.awards.filter(
          award => award.normalizedOutcome === "Winner"
        );
        
        if (allWinners.length > 0) {
          // Generate simpler text for non-prestigious winners in Italian
          const winnerCount = allWinners.length;
          const awardNames = [...new Set(allWinners.map(a => a.awardName))];
          
          let awardsText = `Il film ha vinto ${winnerCount} ${winnerCount === 1 ? 'premio' : 'premi'}`;
          if (awardNames.length <= 3) {
            awardsText += ` ai seguenti concorsi: ${awardNames.join(", ")}.`;
          } else {
            awardsText += ` in diverse competizioni cinematografiche.`;
          }
          
          data.awardsText = awardsText;
        } else if (data.resource.awards.length > 0) {
          // If only nominations
          const nomCount = data.resource.awards.length;
          data.awardsText = `Il film ha ricevuto ${nomCount} ${nomCount === 1 ? 'nomination' : 'nominations'} in diverse competizioni cinematografiche.`;
        } else {
          data.awardsText = null;
        }
      }
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching IMDb awards:', error);
    return null;
  }
}
