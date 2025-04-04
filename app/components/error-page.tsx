"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface ErrorPageProps {
  title?: string;
  message?: string;
  redirectPath?: string;
  countdownSeconds?: number;
}

export default function ErrorPage({
  title = "Dati insufficienti",
  message = "Non ci sono abbastanza dati per mostrare questa pagina",
  redirectPath = "/",
  countdownSeconds = 5
}: ErrorPageProps) {
  const router = useRouter();
  const [countdown, setCountdown] = useState(countdownSeconds);
  
  const hasMissingFields = message.includes('Campi mancanti:');
  const [mainMessage, missingFieldsText] = hasMissingFields 
    ? message.split('\n\nCampi mancanti:') 
    : [message, null];
  
  const missingFields = missingFieldsText 
    ? missingFieldsText.split(',').map(f => f.trim())
    : [];

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push(redirectPath);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router, redirectPath, countdownSeconds]);

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
      <div className="max-w-[1100px] mx-auto px-4 py-12 flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold mb-4">{title}</h1>
        <p className="text-gray-400 mb-4 text-center max-w-md">
          {mainMessage}
        </p>
        
        {missingFields.length > 0 && (
          <div className="mb-6 text-center">
            <p className="text-yellow-500 mb-2 font-semibold">Campi mancanti:</p>
            <ul className="bg-gray-900 p-4 rounded-lg text-left inline-block">
              {missingFields.map((field, i) => (
                <li key={i} className="text-gray-300">
                  <code className="bg-gray-800 px-1 py-0.5 rounded">{field}</code>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        <p className="text-sm text-gray-500 mb-6">
          Sarai reindirizzato alla home page tra {countdown} secondi...
        </p>
        <button 
          onClick={() => router.push(redirectPath)} 
          className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
        >
          Vai alla home
        </button>
      </div>
    </main>
  );
} 