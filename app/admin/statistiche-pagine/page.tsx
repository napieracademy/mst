'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function SimpleStatisticsPage() {
  const [dbCount, setDbCount] = useState<number | null>(null)
  const [xmlCount, setXmlCount] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchCounts() {
      try {
        setLoading(true)
        
        // Fetch del conteggio DB
        const dbResponse = await fetch('/api/check-api-key?check=db-count', {
          cache: 'no-store'
        })
        const dbData = await dbResponse.json()
        
        if (dbData.count) {
          setDbCount(dbData.count)
        }
        
        // Fetch del conteggio XML
        const sitemapResponse = await fetch('/sitemap.xml', {
          cache: 'no-store',
          method: 'GET',
          headers: {
            'Range': 'bytes=0-500'
          }
        })
        
        const sitemapText = await sitemapResponse.text()
        const countMatch = sitemapText.match(/con (\d+) URL/)
        
        if (countMatch && countMatch[1]) {
          setXmlCount(parseInt(countMatch[1], 10))
        }
        
      } catch (error) {
        console.error("Errore nel recupero conteggi:", error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchCounts()
  }, [])

  return (
    <div className="container mx-auto p-8 bg-white text-black">
      <h1 className="text-3xl font-bold mb-6">Conteggio pagine</h1>
      
      <div className="grid grid-cols-2 gap-8 mb-8">
        <div className="border border-gray-300 p-6 rounded-lg bg-blue-50">
          <h2 className="text-xl font-semibold mb-2">Database</h2>
          <p className="text-5xl font-bold text-blue-700">{loading ? "..." : dbCount?.toLocaleString()}</p>
        </div>
        
        <div className="border border-gray-300 p-6 rounded-lg bg-green-50">
          <h2 className="text-xl font-semibold mb-2">Sitemap XML</h2>
          <p className="text-5xl font-bold text-green-700">{loading ? "..." : xmlCount?.toLocaleString()}</p>
        </div>
      </div>
      
      <div className="mt-4 flex gap-4">
        <Link 
          href="/sitemap.xml" 
          className="px-4 py-2 bg-gray-100 border border-gray-300 rounded hover:bg-gray-200"
          target="_blank"
          rel="noopener noreferrer"
        >
          Visualizza Sitemap XML
        </Link>
        
        <Link 
          href="/" 
          className="px-4 py-2 bg-gray-100 border border-gray-300 rounded hover:bg-gray-200"
        >
          Torna alla Home
        </Link>
      </div>
    </div>
  )
}