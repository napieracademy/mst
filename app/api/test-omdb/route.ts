import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { testOMDB } from "@/lib/debug-omdb"
import { config } from '@/lib/config'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const imdbId = searchParams.get("imdbId") || "tt0111161" // Default a Le ali della libertà
  
  try {
    // Informazioni aggiuntive sull'ambiente
    const environment = {
      NODE_ENV: process.env.NODE_ENV,
      NEXT_PUBLIC_ENV: process.env.NEXT_PUBLIC_ENV,
      VERCEL_ENV: process.env.VERCEL_ENV,
      RENDER_EXTERNAL_URL: process.env.RENDER_EXTERNAL_URL,
      OMDB_API_KEY_SET: process.env.OMDB_API_KEY ? 'yes' : 'no',
      OMDB_API_KEY_LENGTH: process.env.OMDB_API_KEY ? process.env.OMDB_API_KEY.length : 0,
      enableOMDBApi: config.enableOMDBApi
    }
    
    const result = await testOMDB(imdbId)
    
    return NextResponse.json({
      ...result,
      environment,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error("Error testing OMDB:", error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}