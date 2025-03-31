import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("query")

    if (!query) {
      return NextResponse.json({ error: "Query parameter is required" }, { status: 400 })
    }

    const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY
    if (!apiKey) {
      console.error("TMDB API key is not defined")
      return NextResponse.json({ error: "Configuration error" }, { status: 500 })
    }

    // Effettua la ricerca multi (film, serie TV, persone)
    const response = await fetch(
      `https://api.themoviedb.org/3/search/multi?api_key=${apiKey}&query=${encodeURIComponent(query)}&language=it-IT&page=1`,
      { next: { revalidate: 60 } } // Cache per 60 secondi
    )

    if (!response.ok) {
      throw new Error(`TMDB API returned ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data.results)
  } catch (error) {
    console.error("Search API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 