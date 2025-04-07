import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const timestamp = new Date().toISOString();
    const path = request.nextUrl.pathname;
    
    return NextResponse.json({
      timestamp,
      path,
      isPrerendered: false,
      nota: "Verifica della prerenderizzazione"
    });
  } catch (error) {
    console.error('Errore nella verifica della prerenderizzazione:', error);
    return NextResponse.json({ 
      error: 'Errore nella verifica della prerenderizzazione'
    }, { status: 500 });
  }
} 