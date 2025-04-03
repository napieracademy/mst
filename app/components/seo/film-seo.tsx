import React from 'react';
import Head from 'next/head';
import Script from 'next/script';

type FilmSEOProps = {
  title: string;
  overview: string;
  posterUrl: string;
  releaseDate?: string;
  director?: {
    name: string;
  } | null;
  genres?: {
    name: string;
  }[];
};

const FilmSEO: React.FC<FilmSEOProps> = ({
  title,
  overview,
  posterUrl,
  releaseDate,
  director,
  genres
}) => {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mastroianni.app';
  const description = overview?.slice(0, 150) + (overview?.length > 150 ? '...' : '') || 'Scheda film su Mastroianni';
  const releaseYear = releaseDate?.split('-')[0] || '';
  const genreNames = genres?.map(g => g.name).join(', ') || '';
  const directorName = director?.name || '';

  // Dati strutturati per Google Rich Snippets
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Movie',
    'name': title,
    'description': description,
    'image': posterUrl,
    'datePublished': releaseDate,
    'director': director ? {
      '@type': 'Person',
      'name': directorName
    } : undefined,
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
        <meta property="og:type" content="video.movie" />
        <meta property="og:url" content={`${siteUrl}/film/${title.toLowerCase().replace(/\s+/g, '-')}-${releaseYear}`} />
        <meta property="og:site_name" content="Mastroianni" />
        
        {/* Meta tag per Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={posterUrl} />
        
        {/* Meta tag aggiuntivi */}
        {releaseYear && <meta name="keywords" content={`${title}, film, ${releaseYear}, ${genreNames}, ${directorName}`} />}
      </Head>
      
      {/* Dati strutturati JSON-LD */}
      <Script 
        id="film-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
};

export default FilmSEO; 