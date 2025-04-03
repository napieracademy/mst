import React from 'react';
import Head from 'next/head';
import Script from 'next/script';

type SerieSEOProps = {
  title: string;
  overview: string;
  posterUrl: string;
  firstAirDate?: string;
  creators?: {
    name: string;
  }[];
  genres?: {
    name: string;
  }[];
  numberOfSeasons?: number;
};

const SerieSEO: React.FC<SerieSEOProps> = ({
  title,
  overview,
  posterUrl,
  firstAirDate,
  creators,
  genres,
  numberOfSeasons
}) => {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mastroianni.app';
  const description = overview?.slice(0, 150) + (overview?.length > 150 ? '...' : '') || 'Scheda serie TV su Mastroianni';
  const releaseYear = firstAirDate?.split('-')[0] || '';
  const genreNames = genres?.map(g => g.name).join(', ') || '';
  const creatorNames = creators?.map(c => c.name).join(', ') || '';

  // Dati strutturati per Google Rich Snippets
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'TVSeries',
    'name': title,
    'description': description,
    'image': posterUrl,
    'datePublished': firstAirDate,
    'numberOfSeasons': numberOfSeasons,
    'creator': creators?.map(creator => ({
      '@type': 'Person',
      'name': creator.name
    })),
    'genre': genreNames
  };

  return (
    <>
      <Head>
        {/* Meta tag di base */}
        <title>{`${title} | Mastroianni`}</title>
        <meta name="description" content={description} />
        
        {/* Meta tag per Open Graph (Facebook) */}
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={posterUrl} />
        <meta property="og:type" content="video.tv_show" />
        <meta property="og:url" content={`${siteUrl}/serie/${title.toLowerCase().replace(/\s+/g, '-')}-${releaseYear}`} />
        <meta property="og:site_name" content="Mastroianni" />
        
        {/* Meta tag per Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={posterUrl} />
        
        {/* Meta tag aggiuntivi */}
        {releaseYear && <meta name="keywords" content={`${title}, serie tv, ${releaseYear}, ${genreNames}, ${creatorNames}`} />}
      </Head>
      
      {/* Dati strutturati JSON-LD */}
      <Script 
        id="serie-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
};

export default SerieSEO; 