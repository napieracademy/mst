import { NextResponse } from 'next/server';

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mastroianni.app';
  
  const robotsTxt = `# Mastroianni - https://mastroianni.app
User-agent: *
Allow: /

# Sitemaps - Versione statica
Sitemap: ${baseUrl}/sitemap.xml

# Disallow
Disallow: /api/
Disallow: /admin/
Disallow: /protected/
`;

  return new NextResponse(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400'
    }
  });
}

// Configura la revalidazione del robots.txt ogni giorno
export const revalidate = 86400; 