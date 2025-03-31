"use client"

import { useApiState } from "@/lib/api-state.tsx"

export function ApiToggle() {
  const { tmdbApiEnabled, setTmdbApiEnabled } = useApiState()

  return (
    <div className="flex items-center space-x-2 p-4 bg-gray-800 rounded-lg">
      <span className="text-sm">API TMDB:</span>
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={tmdbApiEnabled}
          onChange={(e) => setTmdbApiEnabled(e.target.checked)}
          className="sr-only peer"
        />
        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
      </label>
      <span className="text-sm">{tmdbApiEnabled ? "Abilitata" : "Disabilitata"}</span>
    </div>
  )
}

