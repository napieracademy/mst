import { NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import { headers } from 'next/headers';

/**
 * Endpoint API per forzare la rigenerazione della sitemap
 * Richiede un token di sicurezza per prevenire abusi (token semplice in questo esempio)
 */
export async function GET(request: Request) {
  const headersList = headers();
  const token = headersList.get('x-regenerate-token');
  const url = new URL(request.url);
  const redirect = url.searchParams.get('redirect') === 'true';
  
  // Token di sicurezza semplice
  const validToken = process.env.REGENERATE_TOKEN || 'sitemap-secret-token';
  
  // Quando richiamato da UI, non controlliamo il token
  const fromUI = url.searchParams.get('from') === 'ui';
  
  // Verifica token (in produzione usare un sistema più sicuro)
  if (!fromUI && token !== validToken) {
    return NextResponse.json(
      { success: false, message: 'Token non valido' },
      { status: 401 }
    );
  }

  try {
    // Forza la rigenerazione della sitemap in modo aggressivo
    revalidatePath('/sitemap.xml', 'layout');
    revalidatePath('/sitemap.xml', 'page');
    
    // Forza anche la rigenerazione della pagina statistiche
    revalidatePath('/admin/statistiche-pagine', 'layout');
    revalidatePath('/admin/statistiche-pagine', 'page');
    
    // Se è richiesto un redirect, reindirizza alla pagina delle statistiche
    if (redirect || fromUI) {
      return NextResponse.redirect(new URL('/admin/statistiche-pagine', request.url));
    }
    
    return NextResponse.json({
      success: true,
      message: 'Sitemap rigenerata con successo',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Errore durante la rigenerazione della sitemap:', error);
    return NextResponse.json(
      { success: false, message: 'Errore durante la rigenerazione' },
      { status: 500 }
    );
  }
} 