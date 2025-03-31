import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Questa è una semplice API di test per verificare che le API routes funzionino correttamente
export async function GET(request: NextRequest) {
  return NextResponse.json({
    status: "ok",
    message: "API di test funzionante",
    timestamp: new Date().toISOString(),
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))

    return NextResponse.json({
      status: "ok",
      message: "POST ricevuto correttamente",
      receivedData: body,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        message: error instanceof Error ? error.message : "Errore sconosciuto",
      },
      { status: 500 },
    )
  }
}

