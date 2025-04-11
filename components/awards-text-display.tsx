import React from 'react';

export function AwardsTextDisplay({ awardsText }: { awardsText: string | null }) {
  if (!awardsText) return null;
  
  return (
    <p className="text-gray-300 mt-4">{awardsText}</p>
  );
}
