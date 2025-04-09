"use client"

import { OscarBestPictures } from "@/components/oscar-best-pictures"
import { useState } from "react"

export default function TestBestPicturesPage() {
  const [limit, setLimit] = useState(10)

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-3xl font-bold mb-8">Test Oscar Best Pictures API</h1>
      
      <div className="flex gap-4 items-end mb-8">
        <div>
          <label className="block mb-2 text-sm">Numero di film:</label>
          <input 
            type="number" 
            min="5" 
            max="50"
            value={limit}
            onChange={(e) => setLimit(parseInt(e.target.value))}
            className="px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white w-24"
          />
        </div>
      </div>
      
      <div className="mb-6">
        <div className="flex gap-2 flex-wrap">
          <button 
            onClick={() => setLimit(5)}
            className="px-3 py-1 bg-gray-800 hover:bg-gray-700 rounded text-sm"
          >
            5 film
          </button>
          <button 
            onClick={() => setLimit(10)}
            className="px-3 py-1 bg-gray-800 hover:bg-gray-700 rounded text-sm"
          >
            10 film
          </button>
          <button 
            onClick={() => setLimit(20)}
            className="px-3 py-1 bg-gray-800 hover:bg-gray-700 rounded text-sm"
          >
            20 film
          </button>
          <button 
            onClick={() => setLimit(30)}
            className="px-3 py-1 bg-gray-800 hover:bg-gray-700 rounded text-sm"
          >
            30 film
          </button>
        </div>
      </div>
      
      <div className="bg-gray-900 p-6 rounded-lg">
        <OscarBestPictures limit={limit} />
      </div>
    </div>
  )
}