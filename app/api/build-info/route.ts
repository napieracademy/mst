import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const revalidate = 3600; // Riconvalida ogni ora

export async function GET() {
  try {
    const buildInfo = {
      version: '1.0.0',
      buildDate: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      nextVersion: process.env.NEXT_RUNTIME || 'unknown',
      isStaticBuild: process.env.NEXT_PHASE === 'phase-production-build',
      isPrerendering: process.env.NEXT_PHASE === 'phase-production-build'
    };

    return NextResponse.json(buildInfo, { status: 200 });
  } catch (error) {
    console.error('Errore nella route build-info:', error);
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 });
  }
} 