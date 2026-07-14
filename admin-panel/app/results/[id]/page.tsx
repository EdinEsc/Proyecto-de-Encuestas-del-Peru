"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api, Results } from "@/lib/api";
import ResultBars from "@/components/ResultBars";

export default function ResultsPage({ params }: { params: Promise<{ id: string }> }) {
  const [id, setId] = useState("");
  const [results, setResults] = useState<Results | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => { params.then(p => setId(p.id)); }, [params]);
  
  useEffect(() => {
    if (!id) return;
    const load = () => api<Results>(`/results/${id}`).then(data => {
      setResults(data);
      setLastUpdated(new Date());
    });
    load();
    const timer = setInterval(load, 5000);
    return () => clearInterval(timer);
  }, [id]);

  return (
    <div className="rounded-xl py-12 bg-ink-50 dark:bg-ink-950 min-h-screen">
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        <div className="mb-8 flex items-center justify-between">
          <Link href={id ? `/election/${id}` : "/"} className="inline-flex items-center text-sm font-medium text-ink-600 hover:text-primary transition-colors dark:text-ink-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
            Volver a la votación
          </Link>
          
          <div className="flex items-center gap-2 text-xs font-medium text-ink-400">
            <span className="rounded-lg relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            Actualizado: {lastUpdated.toLocaleTimeString()}
          </div>
        </div>

        <div className="mb-12 text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-ink-900 dark:text-white sm:text-5xl mb-4">
            Resultados en Vivo
          </h1>
          <p className="text-lg text-ink-500 dark:text-ink-400 max-w-2xl mx-auto">
            Sigue el conteo de votos en tiempo real. La transparencia es la base de nuestra democracia digital.
          </p>
        </div>

        {results && <ResultBars results={results}/>}
        
        <div className="mt-16 rounded-2xl bg-ink-900 p-8 text-white dark:bg-ink-900">
          <div className="flex flex-col md:flex-row items-center gap-6 justify-between">
            <div>
              <h4 className="text-xl font-bold mb-2">¿Aún no has votado?</h4>
              <p className="text-ink-400">Tu participación es fundamental para el proceso.</p>
            </div>
            <Link href={`/election/${id}`} className="btn-primary whitespace-nowrap">
              Emitir mi voto ahora
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

