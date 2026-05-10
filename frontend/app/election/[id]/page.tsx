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
        <Link href="/" className="text-[10px] font-bold uppercase tracking-widest text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white mb-12 inline-block transition-colors">
          ← Volver al inicio
        </Link>
        <div className="flex items-center gap-6 mb-8">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] bg-emerald-600 text-white px-3 py-1">
            {election?.election_type || "Proceso Oficial"}
          </span>
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-800 dark:text-slate-200 border-l border-slate-300 dark:border-slate-600 pl-6">
            {!election ? 'Cargando...' : election.is_active ? 'PROCESO EN CURSO' : 'ESCRUTINIO FINALIZADO'}
          </span>
          {election?.created_at && (
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600 dark:text-slate-400 ml-auto">
              Publicado: {new Date(election.created_at).toLocaleDateString()}
            </span>
          )}
        </div>

        <h1 className="text-6xl font-black tracking-tighter mb-12 leading-[1.1] text-black dark:text-white">{election?.title}</h1>
        
        {election?.banner_url && (
          <div className="w-full h-[450px] bg-slate-50 dark:bg-slate-800 mb-20 overflow-hidden border border-slate-100 dark:border-slate-700 shadow-xl">
            <img src={getImageUrl(election.banner_url)} alt="Portada" className="w-full h-full object-cover" />
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-16 border-t border-slate-100 dark:border-slate-800 pt-12">
          <div className="space-y-6">
            <p className="text-2xl text-black dark:text-white font-medium leading-relaxed italic border-l-4 border-emerald-600 pl-8">
              {election?.description || "Su voto es fundamental para la transparencia democrática."}
            </p>
            
            <div className="bg-slate-50 dark:bg-slate-800/50 p-10 border border-slate-100 dark:border-slate-700 space-y-8">
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-600 dark:text-emerald-400">Cronograma del Sondeo</span>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-widest">
                  Desde el {election ? new Date(election.created_at).toLocaleDateString() : "..."} 
                  hasta el {election ? new Date(election.end_date).toLocaleDateString() : "..."}*
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-600 dark:text-emerald-400"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-black dark:text-white">Seguridad de Voto Estricta</span>
                </div>
                <p className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest leading-loose">
                  Los votos son auditados bajo protocolo estricto: 1 voto por IP + Identificador Digital (Cookie), 
                  evitando el voto múltiple y garantizando la integridad del proceso.
                </p>
              </div>

              <div className="border-t border-slate-200 dark:border-slate-600 pt-8">
                <span className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-600 dark:text-slate-400 block mb-3 underline decoration-emerald-500 decoration-2 underline-offset-4">Nota Importante:</span>
                <p className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest leading-relaxed">
                  La presente encuesta refleja las preferencias del segmento "Usuarios de Internet", 
                  el cual comprende principalmente juventud, comunidades universitarias y sectores influyentes de la sociedad civil digital.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-center text-center p-12 bg-white dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 shadow-sm">
            <h2 className="text-3xl font-black tracking-tight italic mb-8 text-black dark:text-white">
              "¿Por cuál de los siguientes pre candidatos a {election?.region_name || "la Nación"} votaría?"
            </h2>
            <div className="h-1 w-20 bg-emerald-600 mx-auto mb-8"></div>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 dark:text-slate-400">
              Cierre de votaciones: {election ? new Date(election.end_date).toLocaleDateString() : "..."}
            </p>
            {results && (
              <div className="mt-10 pt-10 border-t border-slate-50 dark:border-slate-700">
                <p className="text-[9px] font-black uppercase tracking-[0.5em] text-emerald-600 dark:text-emerald-400 mb-2">Participación Total</p>
                <p className="text-4xl font-black tracking-tighter text-black dark:text-white">{results.total_votes} VOTOS</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {candidates?.map(c => {
          const stats = getCandidateStats(c.id);
          return (
            <div key={c.id} className="group flex flex-col bg-white dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 overflow-hidden hover:border-emerald-600 dark:hover:border-emerald-500 transition-all duration-500">
              <div className="relative h-80 bg-slate-50 dark:bg-slate-800 overflow-hidden">
                <img src={getImageUrl(c.image_url)} alt={c.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 transform group-hover:scale-105" />
                <div className="absolute top-6 right-6 flex flex-col items-end gap-2">
                  <span className="bg-black text-white px-4 py-2 text-[14px] font-black tracking-tighter shadow-xl">
                    {stats.percentage}%
                  </span>
                  <span className="bg-emerald-600 text-white px-3 py-1 text-[9px] font-bold uppercase tracking-widest">
                    {stats.votes} Votos
                  </span>
                </div>
              </div>
              
              <div className="p-10 flex flex-col flex-grow">
                <h2 className="text-3xl font-black mb-6 tracking-tighter text-black dark:text-white uppercase leading-none">{c.name}</h2>
                <div className="h-0.5 w-10 bg-emerald-600 mb-8"></div>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-10 flex-grow italic">
                  "{c.description || "Comprometido con el desarrollo transparente y el servicio íntegro a la ciudadanía."}"
                </p>

                {c.button_text && c.button_url && (
                  <a 
                    href={c.button_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="mb-8 inline-block w-full border border-slate-200 dark:border-slate-600 py-3 text-[10px] font-black uppercase tracking-widest text-center text-black dark:text-white hover:bg-black dark:hover:bg-emerald-600 hover:text-white hover:border-black dark:hover:border-emerald-600 transition-all"
                  >
                    {c.button_text}
                  </a>
                )}

                <div className="flex flex-col gap-4 mt-auto">
                  <button 
                    className={`w-full py-5 text-[10px] font-black uppercase tracking-[0.4em] transition-all disabled:opacity-50 border-2 ${
                      voted 
                        ? "border-slate-100 dark:border-slate-700 text-slate-300 dark:text-slate-600 cursor-not-allowed" 
                        : "border-black dark:border-emerald-600 bg-black dark:bg-emerald-600 text-white hover:bg-emerald-600 hover:border-emerald-600"
                    }`} 
                    disabled={voted || !election?.is_active || loading} 
                    onClick={() => vote(c.id)}
                  >
                    {loading ? 'Procesando...' : voted ? 'PARTICIPACIÓN REGISTRADA' : 'REGISTRAR MI VOTO'}
                  </button>

                  <div className="pt-8 border-t border-slate-50 dark:border-slate-700">
                    <CandidateComments candidateId={c.id} />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </section>

      {message && (
        <div className="fixed bottom-10 right-10 z-[200] animate-bounce">
          <div className="bg-emerald-600 text-white px-10 py-6 text-[11px] font-black uppercase tracking-widest shadow-2xl border-2 border-white">
            {message}
          </div>
        </div>
      )}

      <div className="mt-40 text-center">
        <Link 
          href={`/results/${id}`} 
          className="inline-flex items-center justify-center bg-black dark:bg-emerald-600 text-white px-20 py-8 text-[11px] font-black uppercase tracking-[0.5em] transition-all hover:bg-emerald-600 dark:hover:bg-emerald-500"
        >
          Ver Escrutinio Detallado
        </Link>
      </div>
    </div>
  );
}
