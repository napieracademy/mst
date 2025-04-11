import { useEffect, useState } from 'react';
import { fetchImdbAwards } from '@/utils/imdb-api';

export function MovieAwards({ imdbId }: { imdbId: string }) {
  const [awards, setAwards] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function getAwards() {
      try {
        setIsLoading(true);
        const data = await fetchImdbAwards(imdbId);
        setAwards(data);
      } catch (error) {
        console.error("Error fetching awards:", error);
      } finally {
        setIsLoading(false);
      }
    }

    if (imdbId) {
      getAwards();
    }
  }, [imdbId]);

  if (isLoading) return null;
  if (!awards || !awards.resource || !awards.resource.awards || awards.resource.awards.length === 0) return null;

  // Find major awards (Oscar, Golden Globe, etc.)
  const majorAwards = awards.resource.awards.filter(
    (award: any) => 
      (award.awardName.includes("Oscar") || 
       award.awardName.includes("Academy Award") ||
       award.awardName.includes("Golden Globe")) &&
      (award.outcome === "Winner" || award.awardOutcome === "Winner")
  );

  if (majorAwards.length === 0) return null;

  return (
    <div className="mt-6 p-4 bg-gray-900 rounded-lg">
      <h3 className="text-lg font-semibold mb-2">Premi principali</h3>
      <ul className="space-y-1">
        {majorAwards.slice(0, 3).map((award: any) => (
          <li key={award.awardNominationId || `${award.awardName}-${award.category}`} className="text-sm">
            <span className="text-yellow-400">★</span> {award.awardName}: {award.category} ({award.year})
          </li>
        ))}
      </ul>
    </div>
  );
}
