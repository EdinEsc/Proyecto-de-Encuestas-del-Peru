"use client";

import { useEffect, useState, useRef, use } from "react";
import Link from "next/link";
import { api, Candidate, Election, getBrowserId, getImageUrl } from "@/lib/api";
import CandidateComments from "@/components/CandidateComments";

declare global {
  interface Window {
    grecaptcha: any;
  }
}

export default function ElectionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [election, setElection] = useState<Election | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [results, setResults] = useState<any>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [voted, setVoted] = useState(false);
  
  useEffect(() => {
    if (!id) return;
    setVoted(localStorage.getItem(`voted:election:${id}`) === "true");
    
    const fetchData = () => {
      api<Election>(`/elections/${id}`).then(setElection).catch(err => console.error(err));
      api<Candidate[]>(`/elections/${id}/candidates`).then(data => setCandidates(data || [])).catch(err => console.error(err));
      api<any>(`/results/${id}`).then(setResults).catch(err => console.error(err));
    };

    fetchData();
    const interval = setInterval(fetchData, 30000); // Update every 30s
    return () => clearInterval(interval);
  }, [id]);

  async function vote(candidate_id: string) {
    if (voted || !election?.is_active) return;
    
    setLoading(true);
    try {
      await api(`/vote`, { 
        method: "POST", 
        body: JSON.stringify({ 
          election_id: id, 
          candidate_id, 
          browser_id: getBrowserId()
        }) 
      });
      localStorage.setItem(`voted:election:${id}`, "true");
      setVoted(true);
      setMessage("¡Tu participación ha sido registrada con éxito!");
      
      // Update results immediately after voting
      api<any>(`/results/${id}`).then(setResults).catch(err => console.error(err));
    } catch (e: any) { 
      setMessage(e.message || "Error al registrar el voto"); 
    } finally {
      setLoading(false);
    }
  }

  const getCandidateStats = (candidateId: string) => {
    if (!results || !results.ranking) return { votes: 0, percentage: 0 };
    const item = results.ranking.find((r: any) => r.candidate_id === candidateId);
    if (!item) return { votes: 0, percentage: 0 };
    const percentage = results.total_votes > 0 ? (item.votes / results.total_votes) * 100 : 0;
    return { votes: item.votes, percentage: percentage.toFixed(1) };
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-20 min-h-screen">
      <div className="mb-20">
        <Link href="/" className="text-xs font-bold tracking-wide text-ink-600 dark:text-ink-400 hover:text-black dark:hover:text-white mb-12 inline-block transition-colors">
          ← Volver al inicio
        </Link>
        <div className="flex items-center gap-6 mb-8">
          <span className="rounded-xl text-xs font-semibold tracking-[0.08em] bg-brand-600 text-white px-3 py-1">
            {election?.election_type || "Proceso Oficial"}
          </span>
          <span className="text-xs font-semibold tracking-[0.1em] text-ink-800 dark:text-ink-200 border-l border-ink-300 dark:border-ink-600 pl-6">
            {!election ? 'Cargando...' : election.is_active ? 'PROCESO EN CURSO' : 'ESCRUTINIO FINALIZADO'}
          </span>
          {election?.created_at && (
            <span className="text-xs font-bold tracking-[0.08em] text-ink-600 dark:text-ink-400 ml-auto">
              Publicado: {new Date(election.created_at).toLocaleDateString()}
            </span>
          )}
        </div>

        <h1 className="text-6xl font-semibold tracking-tight mb-12 leading-[1.1] text-black dark:text-white">{election?.title}</h1>
        
        {election?.banner_url && (
          <div className="rounded-xl w-full h-[450px] bg-ink-50 dark:bg-ink-800 mb-20 overflow-hidden border border-ink-100 dark:border-ink-700 shadow-xl">
            <img src={getImageUrl(election.banner_url)} alt="Portada" className="rounded-lg w-full h-full object-cover" />
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-16 border-t border-ink-100 dark:border-ink-800 pt-12">
          <div className="space-y-6">
            <p className="text-2xl text-black dark:text-white font-medium leading-relaxed italic border-l-4 border-brand-600 pl-8">
              {election?.description || "Su voto es fundamental para la transparencia democrática."}
            </p>
            
            <div className="rounded-xl bg-ink-50 dark:bg-ink-800/50 p-10 border border-ink-100 dark:border-ink-700 space-y-8">
              <div className="flex flex-col gap-2">
                <span className="text-xs font-semibold tracking-[0.12em] text-brand-600 dark:text-brand-400">Cronograma del Sondeo</span>
                <p className="text-sm font-bold text-ink-800 dark:text-ink-200 tracking-wide">
                  Desde el {election ? new Date(election.created_at).toLocaleDateString() : "..."} 
                  hasta el {election ? new Date(election.end_date).toLocaleDateString() : "..."}*
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-brand-600 dark:text-brand-400"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                  <span className="text-xs font-semibold tracking-[0.08em] text-black dark:text-white">Seguridad de Voto Estricta</span>
                </div>
                <p className="text-sm font-bold text-ink-600 dark:text-ink-400 tracking-wide leading-loose">
                  Los votos son auditados bajo protocolo estricto: 1 voto por IP + Identificador Digital (Cookie), 
                  evitando el voto múltiple y garantizando la integridad del proceso.
                </p>
              </div>

              <div className="border-t border-ink-200 dark:border-ink-600 pt-8">
                <span className="text-xs font-semibold tracking-[0.12em] text-ink-600 dark:text-ink-400 block mb-3 underline decoration-brand-500 decoration-2 underline-offset-4">Nota Importante:</span>
                <p className="text-xs font-bold text-ink-600 dark:text-ink-400 tracking-wide leading-relaxed">
                  La presente encuesta refleja las preferencias del segmento "Usuarios de Internet", 
                  el cual comprende principalmente juventud, comunidades universitarias y sectores influyentes de la sociedad civil digital.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl flex flex-col justify-center text-center p-12 bg-white dark:bg-ink-800/50 border border-ink-100 dark:border-ink-700 shadow-sm">
            <h2 className="text-3xl font-semibold tracking-tight italic mb-8 text-black dark:text-white">
              "¿Por cuál de los siguientes pre candidatos a {election?.region_name || "la Nación"} votaría?"
            </h2>
            <div className="rounded-lg h-1 w-20 bg-brand-600 mx-auto mb-8"></div>
            <p className="text-xs font-semibold tracking-[0.12em] text-ink-500 dark:text-ink-400">
              Cierre de votaciones: {election ? new Date(election.end_date).toLocaleDateString() : "..."}
            </p>
            {results && (
              <div className="mt-10 pt-10 border-t border-ink-50 dark:border-ink-700">
                <p className="text-xs font-semibold tracking-[0.12em] text-brand-600 dark:text-brand-400 mb-2">Participación Total</p>
                <p className="text-4xl font-semibold tracking-tight text-black dark:text-white">{results.total_votes} VOTOS</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <section className="grid grid-cols-2 gap-4 md:gap-12">
        {candidates?.map(c => {
          const stats = getCandidateStats(c.id);
          return (
            <div key={c.id} className="rounded-xl group flex flex-col bg-white dark:bg-navy border border-mist dark:border-white/10 overflow-hidden hover:border-electric transition-all duration-500">
              {/* Filo dorado: el acento de identidad, solo al pasar el mouse */}
              <div className="h-1 w-full bg-gold opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

              <div className="relative h-44 sm:h-64 md:h-80 bg-mist dark:bg-navy-dark overflow-hidden">
                <img src={getImageUrl(c.image_url)} alt={c.name} className="rounded-lg w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 transform group-hover:scale-105" />
                <div className="absolute top-2 right-2 md:top-6 md:right-6 flex flex-col items-end gap-1 md:gap-2">
                  <span className="rounded-xl bg-navy text-white px-2 py-1 text-xs md:px-4 md:py-2 md:text-[15px] font-semibold tracking-tight shadow-xl">
                    {stats.percentage}%
                  </span>
                  {/* Dorado con texto marino: el blanco sobre dorado no da contraste */}
                  <span className="rounded-xl bg-gold text-navy px-2 py-0.5 md:px-3 md:py-1 text-[10px] md:text-xs font-bold tracking-wide">
                    {stats.votes} Votos
                  </span>
                </div>
              </div>

              <div className="p-4 md:p-10 flex flex-col flex-grow">
                <h2 className="text-lg md:text-3xl font-semibold mb-3 md:mb-6 tracking-tight text-navy dark:text-white leading-tight md:leading-none">{c.name}</h2>
                <div className="h-0.5 w-10 bg-gold mb-4 md:mb-8"></div>
                <p className="text-carbon/75 dark:text-ink-300 text-xs md:text-sm leading-relaxed mb-5 md:mb-10 flex-grow italic">
                  "{c.description || "Comprometido con el desarrollo transparente y el servicio íntegro a la ciudadanía."}"
                </p>

                {c.button_text && c.button_url && (
                  <a 
                    href={c.button_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="rounded-xl mb-4 md:mb-8 inline-block w-full border border-navy/20 dark:border-white/20 py-2.5 md:py-3 text-[11px] md:text-xs font-semibold tracking-wide text-center text-navy dark:text-white hover:bg-navy hover:text-white hover:border-navy dark:hover:bg-electric dark:hover:border-electric transition-all"
                  >
                    {c.button_text}
                  </a>
                )}

                <div className="flex flex-col gap-3 md:gap-4 mt-auto">
                  <button
                    className={`w-full rounded-xl py-3 md:py-4 text-xs md:text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                      voted || !election?.is_active
                        ? "bg-mist text-carbon/50 dark:bg-white/10 dark:text-ink-300"
                        : "bg-navy text-white hover:bg-navy-light dark:bg-electric dark:hover:bg-electric-hover"
                    }`}
                    disabled={voted || !election?.is_active || loading}
                    onClick={() => vote(c.id)}
                  >
                    {loading
                      ? "Procesando…"
                      : voted
                        ? "Ya votaste en este proceso"
                        : !election?.is_active
                          ? "Votación cerrada"
                          : "Votar por este candidato"}
                  </button>

                  <div className="pt-4 md:pt-8 border-t border-mist dark:border-white/10">
                    <CandidateComments candidateId={c.id} />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </section>

      {message && (
        <div className="fixed bottom-8 right-8 z-[200] max-w-sm">
          <div className={`flex items-start gap-3 rounded-xl px-5 py-4 text-sm font-medium text-white shadow-lg ${voted ? "bg-brand-600" : "bg-red-600"}`}>
            <span>{message}</span>
            <button onClick={() => setMessage("")} aria-label="Cerrar aviso" className="shrink-0 opacity-70 hover:opacity-100">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
        </div>
      )}

      <div className="mt-40 text-center">
        <Link 
          href={`/results/${id}`} 
          className="rounded-xl inline-flex items-center justify-center bg-navy text-white px-20 py-8 text-sm font-semibold tracking-[0.12em] transition-colors hover:bg-navy-light"
        >
          Ver Escrutinio Detallado
        </Link>
      </div>
    </div>
  );
}
