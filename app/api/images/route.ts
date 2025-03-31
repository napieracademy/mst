import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const id = searchParams.get("id")
  const type = searchParams.get("type") || "movie"
  const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY

  if (!id) {
    return NextResponse.json({ error: "Missing id parameter" }, { status: 400 })
  }

  if (!apiKey) {
    return NextResponse.json({ error: "API key is not configured" }, { status: 500 })
  }

  try {
    const url = `https://api.themoviedb.org/3/${type}/${id}/images?api_key=${apiKey}`
    const response = await fetch(url)

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json(
        { error: `TMDB API error: ${response.status} - ${errorText}` },
        { status: response.status },
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching images:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 })
  }
}

