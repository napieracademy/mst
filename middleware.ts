import { createServerSupabaseClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { session } } = await supabase.auth.getSession()

    // Se l'utente non è autenticato e sta cercando di accedere a una rotta protetta
    if (!session && request.nextUrl.pathname.startsWith("/wines")) {
      return NextResponse.redirect(new URL("/login", request.url))
    }

    // Se l'utente è autenticato e sta cercando di accedere a login/register
    if (session && (request.nextUrl.pathname === "/login" || request.nextUrl.pathname === "/register")) {
      return NextResponse.redirect(new URL("/wines", request.url))
    }

    return NextResponse.next()
  } catch (error) {
    console.error("Middleware error:", error)
    return NextResponse.next()
  }
}

export const config = {
  matcher: ["/wines/:path*", "/login", "/register"],
} 