'use client'

import { useEffect, useState } from 'react'
import { createApiSupabaseClient } from '@/lib/supabase-server'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
// Rimuoviamo l'import di heroicons e usiamo emoji Unicode per le icone
import { formatDistanceToNow } from 'date-fns'
import { it } from 'date-fns/locale'

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
      const supabase = await createApiSupabaseClient()
      const { data, error } = await supabase
        .from('sitemap_stats')
        .select('*')
        .eq('id', 1)
        .single()

      if (error) {
        throw new Error(`Errore nel recupero delle statistiche: ${error.message}`)
      }

      setStats(data as SitemapStats)
    } catch (err) {
      setError(`Errore: ${err instanceof Error ? err.message : String(err)}`)
      console.error('Errore nel recupero delle statistiche sitemap:', err)
    } finally {
      setLoading(false)
    }
  }

  async function triggerSitemapGeneration() {
    setGenerating(true)
    
    try {
      // URL della funzione edge di Supabase
      const apiUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/generate-sitemap`
        : null
        
      if (!apiUrl) {
        throw new Error('URL Supabase non configurato')
      }
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
        }
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Errore nella generazione sitemap: ${errorText}`)
      }
      
      const result = await response.json()
      
      if (result.success) {
        await fetchStats() // Ricarica le statistiche
      } else {
        throw new Error(result.error || 'Errore sconosciuto')
      }
    } catch (err) {
      setError(`Errore: ${err instanceof Error ? err.message : String(err)}`)
      console.error('Errore nella generazione sitemap:', err)
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