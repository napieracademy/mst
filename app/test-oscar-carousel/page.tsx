"use client"

import { OscarWinnersCarousel } from "@/components/oscar-winners-carousel"
import { useState } from "react"

export default function TestOscarCarouselPage() {
  const [startYear, setStartYear] = useState(2015)
  const [endYear, setEndYear] = useState(2025)
  const [key, setKey] = useState(0) // Per forzare il re-render quando cambiano gli anni

  const handleYearChange = () => {
    setKey(prev => prev + 1)
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-3xl font-bold mb-8">Test Oscar Winners Carousel</h1>
      
      <div className="flex gap-4 items-end mb-8">
        <div>
          <label className="block mb-2 text-sm">Anno inizio:</label>
          <input 
            type="number" 
            min="1929" 
            max="2025"
            value={startYear}
            onChange={(e) => setStartYear(parseInt(e.target.value))}
            className="px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white w-24"
          />
        </div>
        
        <div>
          <label className="block mb-2 text-sm">Anno fine:</label>
          <input 
            type="number" 
            min="1929" 
            max="2025"
            value={endYear}
            onChange={(e) => setEndYear(parseInt(e.target.value))}
            className="px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white w-24"
          />
        </div>
        
        <button 
          onClick={handleYearChange}
          className="px-4 py-2 bg-yellow-500 text-black font-medium rounded hover:bg-yellow-400 transition-colors"
        >
          Aggiorna
        </button>
      </div>
      
      <div className="mb-6">
        <div className="flex gap-2 flex-wrap">
          <button 
            onClick={() => { setStartYear(2015); setEndYear(2025); handleYearChange(); }}
            className="px-3 py-1 bg-gray-800 hover:bg-gray-700 rounded text-sm"
          >
            2015-2025
          </button>
          <button 
            onClick={() => { setStartYear(2010); setEndYear(2019); handleYearChange(); }}
            className="px-3 py-1 bg-gray-800 hover:bg-gray-700 rounded text-sm"
          >
            2010-2019
          </button>
          <button 
            onClick={() => { setStartYear(2000); setEndYear(2009); handleYearChange(); }}
            className="px-3 py-1 bg-gray-800 hover:bg-gray-700 rounded text-sm"
          >
            2000-2009
          </button>
          <button 
            onClick={() => { setStartYear(1990); setEndYear(1999); handleYearChange(); }}
            className="px-3 py-1 bg-gray-800 hover:bg-gray-700 rounded text-sm"
          >
            1990-1999
          </button>
        </div>
      </div>
      
      <div className="bg-gray-900 p-6 rounded-lg">
        <OscarWinnersCarousel key={key} startYear={startYear} endYear={endYear} />
      </div>
    </div>
  )
}