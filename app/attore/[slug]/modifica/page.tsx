'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import BiografiaEditor from '@/components/BiografiaEditor';

export default function ModificaBiografiaPage() {
  const params = useParams();
  const router = useRouter();
  const [attore, setAttore] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const fetchAttore = async () => {
      try {
        setLoading(true);
        
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
        
        const supabase = createClient(supabaseUrl, supabaseKey);
        
        console.log('Cercando attore con slug:', params.slug);
        
        // Recupera i dati dell'attore da Supabase usando lo slug
        const { data, error } = await supabase
          .from('generated_pages')
          .select('*')
          .eq('slug', params.slug)
          .eq('page_type', 'person')  // Filtra solo gli attori/persone
          .single();
          
        if (error) {
          console.error('Errore Supabase:', error);
          throw error;
        }
        
        if (data) {
          console.log('Dati attore trovati:', data);
          setAttore(data);
        } else {
          console.log('Attore non trovato per slug:', params.slug);
          setError('Attore non trovato');
        }
      } catch (err) {
        console.error('Errore nel recupero dati:', err);
        setError('Impossibile caricare i dati dell\'attore');
      } finally {
        setLoading(false);
      }
    };
    
    if (params.slug) {
      fetchAttore();
    }
  }, [params.slug]);
  
  const salvaModifiche = async (nuovaBiografia: string) => {
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
      
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      console.log('Salvando biografia per:', params.slug);
      
      // Aggiorna la biografia dell'attore
      const { error } = await supabase
        .from('generated_pages')
        .update({ 
          biography: nuovaBiografia,
          last_visited_at: new Date().toISOString()
        })
        .eq('slug', params.slug);
        
      if (error) {
        console.error('Errore salvataggio:', error);
        throw error;
      }
      
      // Aggiornamento locale dello stato
      setAttore({
        ...attore,
        biography: nuovaBiografia
      });
    } catch (err) {
      console.error('Errore nel salvataggio:', err);
      throw new Error('Errore durante il salvataggio delle modifiche');
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-t-4 border-gray-200 rounded-full animate-spin mx-auto mb-4"></div>
          <p>Caricamento dati...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded">
          <h2 className="font-bold text-lg mb-2">Errore</h2>
          <p>{error}</p>
          <button 
            onClick={() => router.back()} 
            className="mt-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Torna indietro
          </button>
        </div>
      </div>
    );
  }
  
  if (!attore) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="p-4 bg-yellow-50 border border-yellow-200 text-yellow-700 rounded">
          <h2 className="font-bold text-lg mb-2">Attore non trovato</h2>
          <p>I dati richiesti non sono disponibili.</p>
          <button 
            onClick={() => router.back()} 
            className="mt-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Torna indietro
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <button 
          onClick={() => router.back()} 
          className="inline-flex items-center text-gray-600 hover:text-gray-900"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 111.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Torna alla pagina dell'attore
        </button>
      </div>
      
      <h1 className="text-2xl font-bold mb-6">Biografia di {attore.name || params.slug}</h1>
      
      <BiografiaEditor
        nomeAttore={attore.name || params.slug as string}
        dataNascita={attore.birth_date}
        luogoNascita={attore.birth_place}
        filmNoti={attore.known_for_titles}
        biografiaAttuale={attore.biography || ''}
        onSalva={salvaModifiche}
      />
    </div>
  );
} 