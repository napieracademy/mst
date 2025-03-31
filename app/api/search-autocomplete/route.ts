import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get("query")
  const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY

  if (!query) {
    return NextResponse.json({ results: [] })
  }

  if (!apiKey) {
    console.error("TMDB API key is missing")
    return NextResponse.json({ error: "API key is missing" }, { status: 500 })
  }

  try {
    // Richiesta per film
    const movieUrl = new URL("https://api.themoviedb.org/3/search/movie")
    movieUrl.searchParams.append("api_key", apiKey)
    movieUrl.searchParams.append("query", query)
    movieUrl.searchParams.append("language", "it-IT")
    movieUrl.searchParams.append("include_adult", "false")
    movieUrl.searchParams.append("page", "1")

    // Richiesta per serie TV
    const tvUrl = new URL("https://api.themoviedb.org/3/search/tv")
    tvUrl.searchParams.append("api_key", apiKey)
    tvUrl.searchParams.append("query", query)
    tvUrl.searchParams.append("language", "it-IT")
    tvUrl.searchParams.append("include_adult", "false")
    tvUrl.searchParams.append("page", "1")

    // Esegui entrambe le richieste in parallelo
    const [movieResponse, tvResponse] = await Promise.all([fetch(movieUrl.toString()), fetch(tvUrl.toString())])

    if (!movieResponse.ok || !tvResponse.ok) {
      throw new Error("Failed to fetch search results")
    }

    const movieData = await movieResponse.json()
    const tvData = await tvResponse.json()

    // Combina e formatta i risultati
    const combinedResults = [
      ...(movieData.results || []).slice(0, 5).map((item: any) => ({
        id: item.id,
        title: item.title,
        poster_path: item.poster_path,
        media_type: "movie",
        year: item.release_date ? item.release_date.split("-")[0] : null,
      })),
      ...(tvData.results || []).slice(0, 5).map((item: any) => ({
        id: item.id,
        title: item.name,
        poster_path: item.poster_path,
        media_type: "tv",
        year: item.first_air_date ? item.first_air_date.split("-")[0] : null,
      })),
    ]

    // Ordina per popolarità (assumendo che i primi risultati siano i più popolari)
    return NextResponse.json({ results: combinedResults.slice(0, 7) })
  } catch (error) {
    console.error("Error fetching search autocomplete:", error)
    return NextResponse.json({ error: "Failed to fetch search results" }, { status: 500 })
  }
}

