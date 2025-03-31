import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const endpoint = searchParams.get("endpoint")
  const apiKey = process.env.TMDB_API_KEY

  if (!apiKey) {
    return NextResponse.json({ error: "TMDB API key is not configured" }, { status: 500 })
  }

  if (!endpoint) {
    return NextResponse.json({ error: "Endpoint parameter is required" }, { status: 400 })
  }

  try {
    const url = new URL(`https://api.themoviedb.org/3${endpoint}`)
    url.searchParams.append("api_key", apiKey)
    url.searchParams.append("language", "it-IT")

    const response = await fetch(url.toString())

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json(
        { error: `TMDB API error (${response.status}): ${errorText}` },
        { status: response.status },
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error testing TMDB API:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 })
  }
}

