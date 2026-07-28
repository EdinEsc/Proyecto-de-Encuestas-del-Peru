"use client";

import { useEffect, useState, useCallback, use } from "react";
import Link from "next/link";
import { api, Results, Election, getImageUrl, sortRanking } from "@/lib/api";
import { usePolling } from "@/lib/usePolling";
import { useSearchParams } from "next/navigation";
import ResultBars from "@/components/ResultBars";

export default function ResultsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const searchParams = useSearchParams();
  const isMinimal = searchParams.get("minimal") === "true";
  const [results, setResults] = useState<Results | null>(null);
  const [election, setElection] = useState<Election | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  
  const loadResults = useCallback(() => {
    api<Results>(`/results/${id}`)
      .then(data => {
        setResults(data);
        setLastUpdated(new Date());
      })
      .catch(err => console.error(err));
  }, [id]);

  // La elección (título, estado) no cambia mientras se mira la pantalla: se
  // pide una sola vez. Antes se recargaba junto con los resultados cada 5 s.
  useEffect(() => {
    if (!id) return;
    api<Election>(`/elections/${id}`).then(setElection).catch(err => console.error(err));
    loadResults();
  }, [id, loadResults]);

  usePolling(loadResults, 30000, Boolean(id));

  const totalVotes = results?.total_votes || 0;
  // "No sabe / No opina" cierra siempre la tabla, por muchos votos que acumule.
  const ranking = sortRanking(results?.ranking);
  // Referencia para el ancho de las barras: el candidato más votado.
  const topVotes = ranking.reduce((m, x) => Math.max(m, x.votes), 0);

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

      <div className="max-w-[1500px] mx-auto px-6 py-20">
        <div className="mb-20">
          {!isMinimal ? (
            <Link href={`/election/${id}`} className="mb-12 inline-flex items-center gap-2 rounded-xl border border-navy/20 px-4 py-2.5 text-sm font-semibold text-navy transition-colors hover:bg-navy hover:text-white dark:border-white/20 dark:text-white dark:hover:bg-white/10">
              ← Volver a la votación
            </Link>
          ) : (
            <button onClick={() => window.history.back()} className="mb-12 inline-flex items-center gap-2 rounded-xl border border-navy/20 px-4 py-2.5 text-sm font-semibold text-navy transition-colors hover:bg-navy hover:text-white dark:border-white/20 dark:text-white dark:hover:bg-white/10">
              ← Regresar a la votación
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

        {/* Misma altura de portada que en la página de votación */}
        {election?.banner_url && !isMinimal && (
          <div className="rounded-xl w-full h-[200px] sm:h-[260px] md:h-[320px] bg-ink-50 dark:bg-ink-800 mb-20 overflow-hidden border border-ink-100 dark:border-ink-700 shadow-xl">
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
          {ranking.map((r, i) => {
            const fill = topVotes > 0 ? (r.votes / topVotes) * 100 : 0;
            const isLeader = i === 0 && r.votes > 0 && !r.is_undecided;
            // La opción neutral no ocupa puesto en el ranking de candidatos.
            const position = ranking.slice(0, i + 1).filter(x => !x.is_undecided).length;
            return (
              <div key={r.candidate_id} className="group">
                <div className="flex justify-between items-end mb-6">
                  <div className="flex items-center gap-6">
                    <div className="h-16 w-16 bg-ink-50 dark:bg-ink-800 overflow-hidden border border-ink-100 dark:border-ink-700 shadow-sm">
                      <img src={getImageUrl(r.image_url)} alt={r.name} className="w-full h-full object-contain" />
                    </div>
                    <div>
                      <span className="mb-1 flex items-center gap-2 text-xs font-semibold tracking-[0.1em] text-brand-600 dark:text-brand-400">
                        {r.is_undecided ? "SIN PREFERENCIA" : `RANKING ${position}`}
                        {isLeader && <span className="badge-up">Líder</span>}
                      </span>
                      <h3 className="text-3xl font-semibold leading-none tracking-tight text-ink-900 dark:text-white">{r.name}</h3>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-5xl font-semibold tabular-nums tracking-tight text-ink-900 dark:text-white">
                      {r.votes.toLocaleString()}
                    </span>
                    <p className="mt-1 text-xs font-semibold tracking-[0.1em] text-steel-400">
                      {r.votes === 1 ? "VOTO" : "VOTOS"}
                    </p>
                  </div>
                </div>
                <div className="h-3 w-full overflow-hidden rounded-xl border border-steel-200 bg-steel-100 dark:border-white/10 dark:bg-white/5">
                  <div
                    className={`h-full rounded-xl transition-all duration-1000 ease-out ${
                      isLeader
                        ? "bg-gradient-to-r from-brand-600 to-accent-500"
                        : "bg-brand-600/45 dark:bg-brand-400/45"
                    }`}
                    style={{ width: `${fill}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>

        {ranking.length === 0 && (
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

