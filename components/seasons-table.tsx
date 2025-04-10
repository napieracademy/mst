interface Season {
  id: number
  name: string
  season_number: number
  episode_count: number
  air_date: string | null
  overview: string | null
  poster_path: string | null
}

interface SeasonsTableProps {
  seasons: Season[]
}

export function SeasonsTable({ seasons }: SeasonsTableProps) {
  // Filtra le stagioni (esclude spesso la stagione 0 che contiene speciali)
  const filteredSeasons = seasons.filter((season) => season.season_number > 0)

  if (!filteredSeasons.length) return null

  return (
    <div className="mt-6 pt-4">
      {/* Titolo Stagioni rimosso */}

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="py-4 px-4 text-left font-medium text-gray-400 text-sm">Titolo</th>
              <th className="py-4 px-4 text-left font-medium text-gray-400 text-sm">Episodi</th>
              <th className="py-4 px-4 text-left font-medium text-gray-400 text-sm">Data di uscita</th>
            </tr>
          </thead>
          <tbody>
            {filteredSeasons.map((season) => {
              // Estrai l'anno dalla data di uscita
              const airDate = season.air_date ? new Date(season.air_date) : null
              const year = airDate ? airDate.getFullYear() : "—"

              // Formatta la data completa
              const formattedDate = season.air_date
                ? new Date(season.air_date).toLocaleDateString("it-IT", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })
                : "—"

              return (
                <tr key={season.id} className="border-b border-gray-800 hover:bg-gray-900/50 transition-colors">
                  <td className="py-4 px-4">{season.name}</td>
                  <td className="py-4 px-4">{season.episode_count} episodi</td>
                  <td className="py-4 px-4">
                    <span className="text-gray-300">{formattedDate}</span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

