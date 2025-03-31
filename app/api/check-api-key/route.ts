import { NextResponse } from "next/server"

export async function GET() {
  const apiKey = process.env.TMDB_API_KEY

  // Non mostriamo la chiave completa, solo i primi e ultimi caratteri
  const maskedKey = apiKey ? `${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}` : "non configurata"

  return NextResponse.json({
    configured: !!apiKey,
    keyPreview: maskedKey,
    environment: process.env.NODE_ENV,
  })
}

