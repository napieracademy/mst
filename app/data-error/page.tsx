import { Suspense } from "react";
import ErrorPage from "../components/error-page";

interface DataErrorProps {
  searchParams: {
    title?: string;
    message?: string;
    redirectPath?: string;
    countdownSeconds?: string;
  };
}

export default async function DataErrorPage({ searchParams }: DataErrorProps) {
  // Next.js 15 richiede che searchParams sia awaited
  const params = await searchParams;
  
  // Log migliorato per debug
  console.log("DataErrorPage: Parametri ricevuti:", JSON.stringify(params, null, 2));
  
  const title = params.title || "Dati insufficienti";
  const message = params.message || "Non ci sono abbastanza dati per mostrare questa pagina";
  const redirectPath = params.redirectPath || "/";
  const countdownSeconds = parseInt(params.countdownSeconds || "5", 10);

  return (
    <ErrorPage
      title={title}
      message={message}
      redirectPath={redirectPath}
      countdownSeconds={countdownSeconds}
    />
  );
} 