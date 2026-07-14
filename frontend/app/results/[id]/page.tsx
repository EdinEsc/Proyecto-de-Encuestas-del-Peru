"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { api, Results, Election, getImageUrl } from "@/lib/api";
import { useSearchParams } from "next/navigation";
import ResultBars from "@/components/ResultBars";

export default function ResultsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const searchParams = useSearchParams();
  const isMinimal = searchParams.get("minimal") === "true";
  const [results, setResults] = useState<Results | null>(null);
  const [election, setElection] = useState<Election | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  
  useEffect(() => {
    if (!id) return;
    const load = () => {
      api<Results>(`/results/${id}`).then(data => {
        setResults(data);
        setLastUpdated(new Date());
      });
      api<Election>(`/elections/${id}`).then(setElection).catch(err => console.error(err));
    };
    load();
    const timer = setInterval(load, 5000);
    return () => clearInterval(timer);
  }, [id]);

  const totalVotes = results?.total_votes || 0;

  return (
    <div className={`min-h-screen bg-white dark:bg-ink-950 ${isMinimal ? "font-['Outfit',_sans-serif]" : ""}`}>
      {isMinimal && (
        <header className="w-full bg-white dark:bg-ink-900 border-b border-ink-100 dark:border-ink-800 mb-12">
          <div className="flex flex-col items-center text-center py-6">
            <div className="rounded-lg h-12 w-12 bg-brand-500 text-white flex items-center justify-center mb-2 text-xl font-semibold">EP</div>
            <h2 className="text-xl font-semibold tracking-tight text-black dark:text-white">Encuestas Perú</h2>
          </div>
        </header>
      )}

      <div className="max-w-6xl mx-auto px-6 py-20">
        <div className="mb-20">
          {!isMinimal ? (
            <Link href={`/election/${id}`} className="text-xs font-bold tracking-wide text-ink-600 dark:text-ink-400 hover:text-black dark:hover:text-white mb-12 inline-block transition-colors">
              ← Volver a la votación
            </Link>
          ) : (
            <button onClick={() => window.history.back()} className="text-xs font-semibold tracking-[0.12em] text-brand-600 mb-12 hover:text-black transition-colors">
              ← REGRESAR A VOTACIÓN
            </button>
          )}

          <div className="flex items-center gap-6 mb-8">
            <span className="rounded-xl text-xs font-semibold tracking-[0.08em] bg-brand-600 text-white px-3 py-1">
              {election?.election_type || "Proceso Oficial"}
            </span>
            <span className="text-xs font-semibold tracking-[0.1em] text-ink-800 dark:text-ink-200 border-l border-ink-300 dark:border-ink-600 pl-6">
              {!election ? 'Cargando...' : election.is_active ? 'ESCRUTINIO EN TIEMPO REAL' : 'ESCRUTINIO FINALIZADO'}
            </span>
          </div>

          <h1 className="text-6xl font-semibold tracking-tight mb-4 text-black dark:text-white leading-none">
            {election?.title || "Cargando resultados..."}
          </h1>
          <p className="text-ink-500 dark:text-ink-400 tracking-[0.12em] text-xs font-semibold">
            Actualización automática cada 5 segundos
          </p>
        </div>

        {election?.banner_url && !isMinimal && (
          <div className="rounded-xl w-full h-[450px] bg-ink-50 dark:bg-ink-800 mb-20 overflow-hidden border border-ink-100 dark:border-ink-700 shadow-xl">
            <img src={getImageUrl(election.banner_url)} alt="Portada" className="rounded-lg w-full h-full object-cover" />
          </div>
        )}

        {!isMinimal && election?.description && (
          <div className="mb-24 pb-12 border-b border-ink-100 dark:border-ink-800">
             <p className="text-2xl text-black dark:text-white font-medium leading-relaxed italic border-l-4 border-brand-600 pl-8 max-w-4xl">
              {election.description}
            </p>
          </div>
        )}

        <div className="grid gap-16 max-w-4xl">
          {(results?.ranking || []).map((r, i) => {
            const percentage = totalVotes > 0 ? (r.votes / totalVotes) * 100 : 0;
            return (
              <div key={r.candidate_id} className="group">
                <div className="flex justify-between items-end mb-6">
                  <div className="flex items-center gap-6">
                    <div className="h-16 w-16 bg-ink-50 dark:bg-ink-800 overflow-hidden border border-ink-100 dark:border-ink-700 shadow-sm">
                      <img src={getImageUrl(r.image_url)} alt={r.name} className="rounded-lg w-full h-full object-cover" />
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-brand-600 tracking-[0.1em] mb-1 block">RANKING {i + 1}</span>
                      <h3 className="text-3xl font-semibold tracking-tight text-black dark:text-white leading-none">{r.name}</h3>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-5xl font-semibold tracking-tight text-black dark:text-white">{percentage.toFixed(1)}%</span>
                    <p className="text-xs font-semibold text-ink-400 tracking-[0.1em] mt-1">{r.votes} VOTOS</p>
                  </div>
                </div>
                <div className="rounded-xl h-3 bg-ink-50 dark:bg-ink-800 w-full overflow-hidden border border-ink-100 dark:border-ink-700">
                  <div 
                    className="h-full bg-brand-600 transition-all duration-1000 ease-out" 
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>

        {(results?.ranking || []).length === 0 && (
          <div className="py-20 text-ink-400 italic text-sm font-bold tracking-wide text-center">
            Aún no se han registrado participaciones en este proceso.
          </div>
        )}

        <div className="mt-20 pt-12 border-t border-ink-100 dark:border-ink-800">
          <p className="text-xs font-semibold tracking-[0.12em] text-ink-400">
            Última actualización: {lastUpdated.toLocaleTimeString()}
          </p>
        </div>

        {isMinimal && (
          <footer className="mt-32 pt-12 border-t border-ink-100 dark:border-ink-800 text-center">
            <p className="text-xs font-semibold tracking-[0.12em] text-ink-400">© {new Date().getFullYear()} Escrutinio Digital Perú</p>
          </footer>
        )}
      </div>
    </div>
  );
}

