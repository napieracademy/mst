import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { isValidImagePath } from "@/lib/tmdb"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  // Usiamo await per params.id come richiesto dall'errore
  const { id } = await params
  const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY
  
  // Ottieni la lingua dalla query string, default a it-IT
  const url = new URL(request.url)
  const lang = url.searchParams.get('lang') || 'it-IT'
  // Forza cache bypass se presente il timestamp
  const noCache = url.searchParams.has('_')

  if (!id) {
    return NextResponse.json({ error: "Missing id parameter" }, { status: 400 })
  }

  if (!apiKey) {
    return NextResponse.json({ error: "API key is not configured" }, { status: 500 })
  }

  try {
    console.log(`API: Fetching person details for ID ${id}`)
    
    // Ottieni i dettagli base della persona in inglese per avere nomi corretti
    const personUrl = `https://api.themoviedb.org/3/person/${id}?api_key=${apiKey}&language=en-US`
    // Ottieni i dettagli nella lingua richiesta per la biografia e altri campi localizzati
    const personUrlLocalized = `https://api.themoviedb.org/3/person/${id}?api_key=${apiKey}&language=${lang}`
    // Ottieni i crediti combinati nella lingua richiesta
    const creditsUrl = `https://api.themoviedb.org/3/person/${id}/combined_credits?api_key=${apiKey}&language=${lang}`
    // Ottieni le immagini
    const imagesUrl = `https://api.themoviedb.org/3/person/${id}/images?api_key=${apiKey}`
    
    // Opzioni cache
    const cacheOptions = noCache 
      ? { cache: 'no-store' }
      : { next: { revalidate: 3600 } }; // Cache per 1 ora
    
    // Esegui tutte le chiamate in parallelo
    const [personResponseEn, personResponseLocalized, creditsResponse, imagesResponse] = await Promise.all([
      fetch(personUrl, {
        ...cacheOptions,
        headers: { Accept: "application/json" },
      }),
      fetch(personUrlLocalized, {
        ...cacheOptions,
        headers: { Accept: "application/json" },
      }),
      fetch(creditsUrl, {
        ...cacheOptions,
        headers: { Accept: "application/json" },
      }),
      fetch(imagesUrl, {
        ...cacheOptions,
        headers: { Accept: "application/json" },
      })
    ]);

    // Verifica che tutte le chiamate siano andate a buon fine
    if (!personResponseEn.ok || !personResponseLocalized.ok) {
      const errorText = await personResponseEn.text()
      console.error(`TMDB API person error (${personResponseEn.status}): ${errorText}`)
      throw new Error(`TMDB API error: ${personResponseEn.status} - ${errorText}`)
    }
    
    // Ottieni i dati JSON da tutte le risposte
    const [personDataEn, personDataLocalized, creditsData, imagesData] = await Promise.all([
      personResponseEn.json(),
      personResponseLocalized.json(),
      creditsResponse.json(),
      imagesResponse.json()
    ]);
    
    // Combina i dati mantenendo il nome in inglese come name_en
    // Assicurati che place_of_birth venga dalla versione localizzata
    const data = {
      ...personDataEn,
      name_en: personDataEn.name,
      biography: personDataLocalized.biography || personDataEn.biography,
      place_of_birth: personDataLocalized.place_of_birth || personDataEn.place_of_birth,
      combined_credits: creditsData,
      images: imagesData
    }
    
    // Verifica e log delle informazioni sulle immagini per debugging
    if (data) {
      const imageInfo = {
        hasProfilePath: Boolean(data.profile_path),
        profilePath: data.profile_path,
        isValidPath: isValidImagePath(data.profile_path),
        hasImagesCollection: Boolean(data.images && data.images.profiles && data.images.profiles.length > 0),
        imagesCount: data.images?.profiles?.length || 0
      }
      
      console.log(`API: Person ${id} image info:`, imageInfo)
      
      // Se l'immagine primaria non è valida ma ci sono immagini alternative, 
      // proviamo ad usare la prima immagine alternativa disponibile
      if (!imageInfo.isValidPath && imageInfo.hasImagesCollection && data.images.profiles.length > 0) {
        const firstValidImage = data.images.profiles.find((img: any) => 
          isValidImagePath(img.file_path)
        )
        
        if (firstValidImage) {
          console.log(`API: Using alternative image for person ${id}:`, firstValidImage.file_path)
          // Sostituisci il percorso dell'immagine principale con l'alternativa valida
          data.profile_path = firstValidImage.file_path
        }
      }
    }
    
    return NextResponse.json(data)
  } catch (error) {
    console.error("API: Error fetching person details:", error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "Unknown error",
      personId: id 
    }, { status: 500 })
  }
}

