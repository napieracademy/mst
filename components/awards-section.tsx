import React from 'react';

type Award = {
  awardName: string;
  awardNominationId?: string;
  year: string;
  category: string;
  outcome?: string;
  awardOutcome?: string;
  normalizedOutcome?: string;
  isWinner?: boolean;
};

type AwardsData = {
  resource?: {
    awards?: Award[];
  };
};

export default function AwardsSection({ awardsData }: { awardsData: AwardsData | null }) {
  if (!awardsData || !awardsData.resource || !awardsData.resource.awards || awardsData.resource.awards.length === 0) {
    return null;
  }

  // Group awards by name
  const groupedAwards = awardsData.resource.awards.reduce((acc, award) => {
    const name = award.awardName;
    if (!acc[name]) {
      acc[name] = [];
    }
    acc[name].push(award);
    return acc;
  }, {} as Record<string, Award[]>);

  // Function to determine if an award is a win
  const isWinner = (award: Award) => {
    if (award.normalizedOutcome === "Winner") return true;
    
    return (award.outcome?.toLowerCase().includes("winner") || 
            award.awardOutcome?.toLowerCase().includes("winner") || 
            award.isWinner === true);
  };

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4">Awards</h2>
      <div className="space-y-4">
        {Object.entries(groupedAwards).map(([awardName, awards]) => (
          <div key={awardName} className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-xl font-semibold mb-2">{awardName}</h3>
            <ul className="space-y-2">
              {awards.map((award) => (
                <li 
                  key={award.awardNominationId || `${award.awardName}-${award.year}-${award.category}`} 
                  className="flex justify-between"
                >
                  <div>
                    <span className="text-gray-300">{award.year}</span> - {award.category}
                  </div>
                  <span className={isWinner(award) ? "text-yellow-400 font-semibold" : "text-gray-400"}>
                    {isWinner(award) ? "Winner" : "Nominated"}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
