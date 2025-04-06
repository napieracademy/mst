'use client'

import { useEffect, useState } from 'react'
import { createApiSupabaseClient } from '@/lib/supabase-server'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
// Rimuoviamo l'import di heroicons e usiamo emoji Unicode per le icone
import { formatDistanceToNow } from 'date-fns'
import { it } from 'date-fns/locale'

// Definizione delle variabili d'ambiente da lato client
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export type SitemapStats = {
  id: number
  last_generation: string
  urls_count: number
  film_count: number
  serie_count: number
  is_error: boolean
  error_message: string | null
  created_at: string
  updated_at: string
}

export default function SitemapStats() {
  const [stats, setStats] = useState<SitemapStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    fetchStats()
  }, [])

  async function fetchStats() {
    setLoading(true)
    setError(null)

    try {
      // Implementazione con retry automatico
      const maxRetries = 2
      let attempt = 0
      let success = false
      let lastError: Error | null = null
      
      while (attempt <= maxRetries && !success) {
        try {
          attempt++
          
          if (attempt > 1) {
            console.log(`Tentativo ${attempt}/${maxRetries + 1} di recupero statistiche...`)
          }
          
          const supabase = await createApiSupabaseClient()
          const { data, error } = await supabase
            .from('sitemap_stats')
            .select('*')
            .eq('id', 1)
            .single()

          if (error) {
            // Errore specifico di Supabase
            throw new Error(`Errore query (${error.code}): ${error.message}`)
          }

          if (!data) {
            throw new Error('Nessun dato ricevuto dal database')
          }

          // Se arriviamo qui, il recupero è riuscito
          setStats(data as SitemapStats)
          success = true
          
        } catch (e) {
          lastError = e instanceof Error ? e : new Error(String(e))
          
          if (attempt <= maxRetries) {
            // Attendi prima del retry con backoff esponenziale
            const waitTime = Math.min(1000 * Math.pow(2, attempt - 1), 3000)
            console.log(`In attesa di ${waitTime}ms prima del nuovo tentativo...`)
            await new Promise(resolve => setTimeout(resolve, waitTime))
          }
        }
      }
      
      // Se tutti i tentativi sono falliti, lancia l'ultimo errore
      if (!success && lastError) {
        throw lastError
      }
    } catch (err) {
      // Formatta l'errore in modo più chiaro
      const errorMessage = err instanceof Error ? err.message : String(err)
      const formattedError = `Impossibile recuperare le statistiche della sitemap: ${errorMessage}`
      setError(formattedError)
      console.error(formattedError, err)
    } finally {
      setLoading(false)
    }
  }

  async function triggerSitemapGeneration() {
    setGenerating(true)
    setError(null)
    
    try {
      // URL della funzione edge di Supabase
      const apiUrl = SUPABASE_URL
        ? `${SUPABASE_URL}/functions/v1/generate-sitemap`
        : null
        
      if (!apiUrl) {
        throw new Error('URL Supabase non configurato')
      }
      
      // Implementa retry automatico
      const maxRetries = 2
      let attempt = 0
      let success = false
      let lastError: Error | null = null
      
      while (attempt <= maxRetries && !success) {
        try {
          attempt++
          
          if (attempt > 1) {
            console.log(`Tentativo ${attempt}/${maxRetries + 1} di generazione sitemap...`)
          }
          
          const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
            }
          })
          
          if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`Errore HTTP ${response.status}: ${errorText}`)
          }
          
          const result = await response.json()
          
          if (result.success) {
            success = true
            console.log('Generazione sitemap completata con successo')
            await fetchStats() // Ricarica le statistiche
          } else {
            throw new Error(result.error || 'Risposta di errore dal server')
          }
        } catch (e) {
          lastError = e instanceof Error ? e : new Error(String(e))
          
          if (attempt <= maxRetries) {
            // Attendi prima del retry (backoff esponenziale)
            const waitTime = Math.min(1000 * Math.pow(2, attempt - 1), 5000)
            console.log(`In attesa di ${waitTime}ms prima del nuovo tentativo...`)
            await new Promise(resolve => setTimeout(resolve, waitTime))
          }
        }
      }
      
      if (!success && lastError) {
        throw lastError
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err)
      const formattedError = `Errore nella generazione sitemap: ${errorMessage}`
      setError(formattedError)
      console.error(formattedError, err)
    } finally {
      setGenerating(false)
    }
  }

  function formatLastGeneration(date: string) {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true, locale: it })
    } catch (err) {
      return "Data non valida"
    }
  }

  if (loading) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Statistiche Sitemap</CardTitle>
          <CardDescription>Caricamento in corso...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center p-6">
          <div className="h-10 w-10 animate-spin text-gray-400">⟳</div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="w-full max-w-md border-red-200">
        <CardHeader className="bg-red-50">
          <CardTitle className="flex items-center gap-2">
            <span className="text-red-500 text-xl">⚠</span>
            <span>Errore Statistiche</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <p className="text-sm text-red-600">{error}</p>
        </CardContent>
        <CardFooter className="bg-red-50">
          <Button variant="outline" onClick={fetchStats} size="sm">
            Riprova
          </Button>
        </CardFooter>
      </Card>
    )
  }

  if (!stats) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Statistiche Sitemap</CardTitle>
          <CardDescription>Nessun dato disponibile</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-sm text-gray-500">
            Nessuna informazione sulla sitemap trovata nel database
          </p>
        </CardContent>
        <CardFooter>
          <Button onClick={triggerSitemapGeneration} disabled={generating}>
            {generating ? 'Generazione...' : 'Genera sitemap'}
          </Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card className={`w-full max-w-md ${stats.is_error ? 'border-red-200' : 'border-green-200'}`}>
      <CardHeader className={stats.is_error ? 'bg-red-50' : 'bg-green-50'}>
        <CardTitle className="flex items-center gap-2">
          {stats.is_error 
            ? <span className="text-red-500 text-xl">⚠</span>
            : <span className="text-green-500 text-xl">✓</span>
          }
          <span>Statistiche Sitemap</span>
        </CardTitle>
        <CardDescription>
          {stats.is_error 
            ? 'Ultima generazione fallita' 
            : `Ultimo aggiornamento: ${formatLastGeneration(stats.last_generation)}`
          }
        </CardDescription>
      </CardHeader>
      
      <CardContent className="p-4">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg bg-slate-100 p-3">
              <p className="text-xs text-slate-500">Totale URL</p>
              <p className="text-2xl font-bold">{stats.urls_count.toLocaleString()}</p>
            </div>
            <div className="rounded-lg bg-slate-100 p-3">
              <p className="text-xs text-slate-500">Film + Serie</p>
              <p className="text-2xl font-bold">
                {(stats.film_count + stats.serie_count).toLocaleString()}
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg bg-blue-50 p-3">
              <p className="text-xs text-blue-500">Film</p>
              <p className="text-xl font-semibold text-blue-700">{stats.film_count.toLocaleString()}</p>
            </div>
            <div className="rounded-lg bg-purple-50 p-3">
              <p className="text-xs text-purple-500">Serie TV</p>
              <p className="text-xl font-semibold text-purple-700">{stats.serie_count.toLocaleString()}</p>
            </div>
          </div>
          
          {stats.is_error && stats.error_message && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3">
              <p className="text-xs font-medium text-red-800">Messaggio di errore:</p>
              <p className="text-sm text-red-600">{stats.error_message}</p>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="bg-slate-50 justify-between">
        <Button variant="outline" size="sm" onClick={fetchStats} disabled={generating}>
          <span className={`mr-1 ${loading ? 'animate-spin' : ''}`}>⟳</span>
          Aggiorna
        </Button>
        <Button onClick={triggerSitemapGeneration} disabled={generating} size="sm">
          {generating ? 'Generazione...' : 'Genera sitemap'}
        </Button>
      </CardFooter>
    </Card>
  )
}