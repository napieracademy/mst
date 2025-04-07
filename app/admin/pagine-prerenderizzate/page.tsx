import Link from 'next/link';
import { Container } from "@/components/container";

export const metadata = {
  title: 'Debug Pagine Prerenderizzate | Mastroianni',
  description: 'Strumento di debug per visualizzare le pagine prerenderizzate durante il build',
};

export default function PaginePrerender() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Pagine Prerenderizzate</h1>
      <p className="text-gray-600">
        Questa pagina mostra le statistiche delle pagine prerenderizzate.
      </p>
    </div>
  );
} 