"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { api, Candidate, Election, getBrowserId, getImageUrl } from "@/lib/api";
import CandidateComments from "@/components/CandidateComments";

export default function VotePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [election, setElection] = useState<Election | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [results, setResults] = useState<any>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [voted, setVoted] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!slug) return;

    api<Election>(`/election-by-slug/${slug}`)
      .then(data => {
        setElection(data);
        setVoted(localStorage.getItem(`voted:election:${data.id}`) === "true");

        api<Candidate[]>(`/elections/${data.id}/candidates`).then(d => setCandidates(d || [])).catch(() => {});
        api<any>(`/results/${data.id}`).then(setResults).catch(() => {});
      })
      .catch(() => setError(true));
  }, [slug]);

  // Auto-refresh results
  useEffect(() => {
    if (!election) return;
    const interval = setInterval(() => {
      api<any>(`/results/${election.id}`).then(setResults).catch(() => {});
    }, 30000);
    return () => clearInterval(interval);
  }, [election]);

  async function vote(candidate_id: string) {
    if (!election || voted || !election.is_active) return;

    setLoading(true);
    try {
      await api(`/vote`, {
        method: "POST",
        body: JSON.stringify({
          election_id: election.id,
          candidate_id,
          browser_id: getBrowserId()
        })
      });
      localStorage.setItem(`voted:election:${election.id}`, "true");
      setVoted(true);
      setMessage("¡Tu participación ha sido registrada con éxito!");
      api<any>(`/results/${election.id}`).then(setResults).catch(() => {});
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

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950">
        <div className="text-center space-y-6">
          <div className="h-16 w-16 bg-red-100 text-red-500 flex items-center justify-center mx-auto text-2xl font-black">!</div>
          <h1 className="text-2xl font-black tracking-tighter uppercase text-black dark:text-white">Proceso No Encontrado</h1>
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">El enlace proporcionado no es válido o el proceso ha sido removido.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-black dark:text-white font-['Outfit',_sans-serif] antialiased">
      {/* Minimal Header - Just logo and banner */}
      <header className="w-full bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
        <div className="relative w-full overflow-hidden" style={{ minHeight: '180px' }}>
          <img
            src="/banner.png"
            alt="Encuestas Perú Banner"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80" />
          <div className="relative z-10 flex flex-col items-center text-center py-8 px-6">
            <div className="h-16 w-16 bg-emerald-500 text-white flex items-center justify-center mb-4 text-2xl font-black shadow-lg shadow-emerald-500/30 border-2 border-white/20">EP</div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-1 uppercase text-white leading-none drop-shadow-lg">Encuestas Perú</h1>
            <p className="text-white/70 text-[10px] font-black uppercase tracking-[0.4em]">
              Portal Oficial de Participación Ciudadana
            </p>
          </div>
        </div>
      </header>

      {/* Election Content */}
      <main className="max-w-6xl mx-auto px-6 py-16">
        {!election ? (
          <div className="flex items-center justify-center py-32">
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-300 dark:text-slate-600 animate-pulse">Cargando proceso electoral...</div>
          </div>
        ) : (
          <>
            <div className="mb-16">
              <div className="flex items-center gap-6 mb-8">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] bg-emerald-600 text-white px-3 py-1">
                  {election.election_type || "Proceso Oficial"}
                </span>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-800 dark:text-slate-200 border-l border-slate-300 dark:border-slate-600 pl-6">
                  {election.is_active ? 'PROCESO EN CURSO' : 'ESCRUTINIO FINALIZADO'}
                </span>
              </div>

              <h2 className="text-5xl font-black tracking-tighter mb-10 leading-[1.1] text-black dark:text-white">{election.title}</h2>

              {election.banner_url && (
                <div className="w-full h-[400px] bg-slate-50 dark:bg-slate-800 mb-16 overflow-hidden border border-slate-100 dark:border-slate-700 shadow-xl">
                  <img src={getImageUrl(election.banner_url)} alt="Portada" className="w-full h-full object-cover" />
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-12 border-t border-slate-100 dark:border-slate-800 pt-10">
                <div className="space-y-6">
                  <p className="text-xl text-black dark:text-white font-medium leading-relaxed italic border-l-4 border-emerald-600 pl-8">
                    {election.description || "Su voto es fundamental para la transparencia democrática."}
                  </p>

                  <div className="bg-slate-50 dark:bg-slate-800/50 p-8 border border-slate-100 dark:border-slate-700 space-y-6">
                    <div className="flex items-center gap-3">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-600 dark:text-emerald-400"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-black dark:text-white">Seguridad de Voto Estricta</span>
                    </div>
                    <p className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest leading-loose">
                      Los votos son auditados bajo protocolo estricto: 1 voto por IP + Identificador Digital, 
                      evitando el voto múltiple y garantizando la integridad del proceso.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col justify-center text-center p-10 bg-white dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 shadow-sm">
                  <h3 className="text-2xl font-black tracking-tight italic mb-6 text-black dark:text-white">
                    "¿Por cuál de los siguientes pre candidatos a {election.region_name || "la Nación"} votaría?"
                  </h3>
                  <div className="h-1 w-16 bg-emerald-600 mx-auto mb-6"></div>
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 dark:text-slate-400">
                    Cierre de votaciones: {new Date(election.end_date).toLocaleDateString()}
                  </p>
                  {results && (
                    <div className="mt-8 pt-8 border-t border-slate-50 dark:border-slate-700">
                      <p className="text-[9px] font-black uppercase tracking-[0.5em] text-emerald-600 dark:text-emerald-400 mb-2">Participación Total</p>
                      <p className="text-3xl font-black tracking-tighter text-black dark:text-white">{results.total_votes} VOTOS</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <section className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {candidates?.map(c => {
                const stats = getCandidateStats(c.id);
                return (
                  <div key={c.id} className="group flex flex-col bg-white dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 overflow-hidden hover:border-emerald-600 dark:hover:border-emerald-500 transition-all duration-500">
                    <div className="relative h-72 bg-slate-50 dark:bg-slate-800 overflow-hidden">
                      <img src={getImageUrl(c.image_url)} alt={c.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 transform group-hover:scale-105" />
                      <div className="absolute top-5 right-5 flex flex-col items-end gap-2">
                        <span className="bg-black text-white px-3 py-1.5 text-[13px] font-black tracking-tighter shadow-xl">
                          {stats.percentage}%
                        </span>
                        <span className="bg-emerald-600 text-white px-2 py-1 text-[8px] font-bold uppercase tracking-widest">
                          {stats.votes} Votos
                        </span>
                      </div>
                    </div>

                    <div className="p-8 flex flex-col flex-grow">
                      <h3 className="text-2xl font-black mb-4 tracking-tighter text-black dark:text-white uppercase leading-none">{c.name}</h3>
                      <div className="h-0.5 w-8 bg-emerald-600 mb-6"></div>
                      <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-8 flex-grow italic">
                        "{c.description || "Comprometido con el desarrollo transparente y el servicio íntegro a la ciudadanía."}"
                      </p>

                      {c.button_text && c.button_url && (
                        <a
                          href={c.button_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mb-6 inline-block w-full border border-slate-200 dark:border-slate-600 py-3 text-[10px] font-black uppercase tracking-widest text-center text-black dark:text-white hover:bg-black dark:hover:bg-emerald-600 hover:text-white hover:border-black dark:hover:border-emerald-600 transition-all"
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
                          disabled={voted || !election.is_active || loading}
                          onClick={() => vote(c.id)}
                        >
                          {loading ? 'Procesando...' : voted ? 'PARTICIPACIÓN REGISTRADA' : 'REGISTRAR MI VOTO'}
                        </button>

                        <div className="pt-6 border-t border-slate-50 dark:border-slate-700">
                          <CandidateComments candidateId={c.id} />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </section>

            {results && (
              <div className="mt-24 text-center">
                <Link
                  href={`/results/${election.id}?minimal=true`}
                  className="inline-flex items-center justify-center bg-black dark:bg-emerald-600 text-white px-16 py-6 text-[11px] font-black uppercase tracking-[0.5em] transition-all hover:bg-emerald-600 dark:hover:bg-emerald-500"
                >
                  Ver Escrutinio Detallado
                </Link>
              </div>
            )}
          </>
        )}
      </main>

      {/* Minimal footer */}
      <footer className="border-t border-slate-100 dark:border-slate-800 py-8 bg-white dark:bg-slate-950">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <span className="text-[9px] font-bold uppercase tracking-[0.5em] text-slate-400 dark:text-slate-500">
            © {new Date().getFullYear()} Escrutinio Digital Perú
          </span>
          <div className="flex items-center gap-3">
            <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-black dark:text-white">Red en Línea</span>
          </div>
        </div>
      </footer>

      {message && (
        <div className="fixed bottom-10 right-10 z-[200] animate-bounce">
          <div className="bg-emerald-600 text-white px-10 py-6 text-[11px] font-black uppercase tracking-widest shadow-2xl border-2 border-white">
            {message}
          </div>
        </div>
      )}
    </div>
  );
}
