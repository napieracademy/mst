'use client';

import { BuilderComponent, useIsPreviewing, type BuilderContent } from '@builder.io/react';
import { BUILDER_API_KEY } from '@/lib/builder';
import { useEffect, useState } from 'react';

// L'ID del contenuto e del blocco specifico
const CONTENT_ID = 'cda05585495d47759451c474f1bf4a46';
const BLOCK_ID = 'builder-4b4cbf0278874203a88c123dfb354e89';

type BuilderPageContent = BuilderContent & {
  data?: {
    blocks?: any[];
    inputs?: any[];
    state?: { [key: string]: any };
  }
};

export default function BuilderExamplePage() {
  const [content, setContent] = useState<BuilderPageContent | null>(null);
  const isPreviewing = useIsPreviewing();

  useEffect(() => {
    async function fetchContent() {
      try {
        const response = await fetch(
          `https://cdn.builder.io/api/v3/content/page/${CONTENT_ID}?apiKey=${BUILDER_API_KEY}&query.id=${BLOCK_ID}`
        ).then(res => res.json());
        
        console.log('Builder.io response:', response);
        
        if (response?.data?.length > 0) {
          setContent(response.data[0]);
        }
      } catch (error) {
        console.error('Error fetching Builder.io content:', error);
      }
    }
    
    fetchContent();
  }, []);

  // Se non c'è contenuto, mostra un messaggio di caricamento
  if (!content && !isPreviewing) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-lg text-gray-600">Caricamento contenuto...</p>
          <p className="text-sm text-gray-500 mt-2">Content ID: {CONTENT_ID}</p>
          <p className="text-sm text-gray-500">Block ID: {BLOCK_ID}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <BuilderComponent
        apiKey={BUILDER_API_KEY}
        model="page"
        content={content || undefined}
      />
      {/* Debug info */}
      <div className="mt-8 p-4 bg-gray-100 rounded-lg">
        <h3 className="text-lg font-semibold">Debug Info:</h3>
        <pre className="mt-2 text-sm overflow-auto">
          {JSON.stringify(content, null, 2)}
        </pre>
      </div>
    </div>
  );
} 