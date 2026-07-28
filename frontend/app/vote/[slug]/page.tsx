"use client";

import { useEffect, useState, use } from "react";
import { api, Candidate, Election, getBrowserId, getImageUrl } from "@/lib/api";
import CandidateComments from "@/components/CandidateComments";
import LiveRanking from "@/components/LiveRanking";
import HeaderHero from "@/components/HeaderHero";
import Footer from "@/components/Footer";
import Toast from "@/components/Toast";

export default function VotePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [election, setElection] = useState<Election | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [results, setResults] = useState<any>(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("success");
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
      setMessageType("success");
      setMessage("¡Tu participación ha sido registrada con éxito!");
      api<any>(`/results/${election.id}`).then(setResults).catch(() => {});
    } catch (e: any) {
      setMessageType("error");
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
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-ink-950">
        <div className="text-center space-y-6">
          <div className="rounded-lg h-16 w-16 bg-red-100 text-red-500 flex items-center justify-center mx-auto text-2xl font-semibold">!</div>
          <h1 className="text-2xl font-semibold tracking-tight text-black dark:text-white">Proceso No Encontrado</h1>
          <p className="text-sm font-bold tracking-wide text-ink-500 dark:text-ink-400">El enlace proporcionado no es válido o el proceso ha sido removido.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-ink-950 text-black dark:text-white font-['Outfit',_sans-serif] antialiased">
      {/*
        Mismo hero que el header del sitio: el enlace compartido es la primera
        vista que tiene mucha gente, así que la marca no puede cambiar de una
        página a otra. Solo se omite la navegación por categorías.
      */}
      <header className="relative z-40 w-full border-b border-ink-100 bg-white dark:border-white/10 dark:bg-ink-950">
        <HeaderHero />
      </header>

      {/* Election Content */}
      <main className="max-w-[1500px] mx-auto px-4 sm:px-6 py-16">
        {!election ? (
          <div className="flex items-center justify-center py-32">
            <div className="text-xs font-semibold tracking-wide text-ink-300 dark:text-ink-600 animate-pulse">Cargando proceso electoral...</div>
          </div>
        ) : (
          <>
            <div className="mb-16">
              <div className="flex items-center gap-6 mb-8">
                <span className="rounded-xl text-xs font-semibold tracking-[0.08em] bg-brand-600 text-white px-3 py-1">
                  {election.election_type || "Proceso Oficial"}
                </span>
                <span className="text-xs font-semibold tracking-[0.1em] text-ink-800 dark:text-ink-200 border-l border-ink-300 dark:border-ink-600 pl-6">
                  {election.is_active ? 'PROCESO EN CURSO' : 'ESCRUTINIO FINALIZADO'}
                </span>
              </div>

              <h2 className="text-5xl font-semibold tracking-tight mb-10 leading-[1.1] text-black dark:text-white">{election.title}</h2>

              {election.banner_url && (
                <div className="rounded-xl w-full h-[400px] bg-ink-50 dark:bg-ink-800 mb-10 overflow-hidden border border-ink-100 dark:border-ink-700 shadow-xl">
                  <img src={getImageUrl(election.banner_url)} alt="Portada" className="rounded-lg w-full h-full object-cover" />
                </div>
              )}

              {/* Descripción y datos del proceso: una sola fila a todo el ancho bajo el banner. */}
              <div className="rounded-xl bg-ink-50 dark:bg-ink-800/50 border border-ink-100 dark:border-ink-700 p-6 md:p-8 mb-8 flex flex-col lg:flex-row lg:items-center gap-6 lg:gap-10">
                <p className="text-lg md:text-xl text-black dark:text-white font-medium leading-snug italic border-l-4 border-brand-600 pl-6 lg:flex-1">
                  {election.description || "Su voto es fundamental para la transparencia democrática."}
                </p>

                <div className="flex flex-wrap gap-x-10 gap-y-4 lg:border-l lg:border-ink-200 lg:dark:border-ink-700 lg:pl-10">
                  <div>
                    <span className="text-[10px] font-semibold tracking-[0.12em] text-brand-600 dark:text-brand-400">VIGENCIA</span>
                    <p className="text-sm font-semibold text-ink-800 dark:text-ink-200 whitespace-nowrap">
                      {new Date(election.created_at).toLocaleDateString()} — {new Date(election.end_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold tracking-[0.12em] text-brand-600 dark:text-brand-400">SEGURIDAD</span>
                    <p className="text-sm font-semibold text-ink-800 dark:text-ink-200">1 voto por IP y dispositivo</p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl w-full text-center px-6 py-10 md:px-12 md:py-12 bg-white dark:bg-ink-800/50 border border-ink-100 dark:border-ink-700 shadow-sm">
                <h3 className="text-2xl md:text-3xl font-semibold tracking-tight italic mb-6 text-black dark:text-white">
                  "¿Por cuál de los siguientes pre candidatos a {election.region_name || "la Nación"} votaría?"
                </h3>
                <div className="rounded-lg h-1 w-20 bg-brand-600 mx-auto"></div>
              </div>
            </div>

            <div className="grid lg:grid-cols-[minmax(0,1fr)_500px] xl:grid-cols-[minmax(0,1fr)_560px] gap-8 lg:gap-10 items-start">
              {/* Dos columnas también en móvil, con separación mínima, igual que en el front */}
              <section className="grid grid-cols-2 gap-2 sm:gap-5 md:gap-6">
                {candidates?.map(c => {
                  const stats = getCandidateStats(c.id);
                  return (
                    <div key={c.id} className="rounded-xl group flex flex-col bg-white dark:bg-ink-800/50 border border-ink-100 dark:border-ink-700 overflow-hidden hover:border-brand-600 dark:hover:border-brand-500 transition-all duration-500">
                      <div className="relative h-40 sm:h-52 md:h-64 bg-ink-50 dark:bg-ink-800 overflow-hidden">
                        <img src={getImageUrl(c.image_url)} alt={c.name} className="rounded-lg w-full h-full object-cover transition-transform duration-700 transform group-hover:scale-105" />
                        <div className="absolute top-2 right-2 md:top-3 md:right-3 flex flex-col items-end gap-1">
                          <span className="rounded-xl bg-black text-white px-2 py-1 md:px-3 md:py-1.5 text-xs md:text-[13px] font-semibold tracking-tight shadow-xl">
                            {stats.percentage}%
                          </span>
                          <span className="rounded-xl bg-brand-600 text-white px-2 py-0.5 md:py-1 text-[10px] md:text-xs font-bold tracking-wide">
                            {stats.votes} Votos
                          </span>
                        </div>
                      </div>

                      <div className="p-4 md:p-5 flex flex-col flex-grow">
                        <h3 className="text-base md:text-xl font-semibold mb-2 tracking-tight text-black dark:text-white leading-tight">{c.name}</h3>
                        <div className="h-0.5 w-8 bg-brand-600 mb-3 md:mb-4"></div>
                        <p className="text-ink-600 dark:text-ink-400 text-xs md:text-sm leading-relaxed mb-4 md:mb-5 flex-grow italic">
                          "{c.description || "Comprometido con el desarrollo transparente y el servicio íntegro a la ciudadanía."}"
                        </p>

                        {c.button_text && c.button_url && (
                          <a
                            href={c.button_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-xl mb-4 inline-block w-full border border-ink-200 dark:border-ink-600 py-2.5 text-xs font-semibold tracking-wide text-center text-black dark:text-white hover:bg-black dark:hover:bg-brand-600 hover:text-white hover:border-black dark:hover:border-brand-600 transition-all"
                          >
                            {c.button_text}
                          </a>
                        )}

                        <div className="flex flex-col gap-3 mt-auto">
                          <button
                            className={`w-full rounded-xl py-3.5 text-xs font-semibold tracking-[0.1em] transition-all disabled:opacity-50 border-2 ${
                              voted
                                ? "border-ink-100 dark:border-ink-700 text-ink-300 dark:text-ink-600 cursor-not-allowed"
                                : "border-black dark:border-brand-600 bg-black dark:bg-brand-600 text-white hover:bg-brand-600 hover:border-brand-600"
                            }`}
                            disabled={voted || !election.is_active || loading}
                            onClick={() => vote(c.id)}
                          >
                            {loading ? 'Procesando...' : voted ? 'YA VOTASTE' : 'REGISTRAR MI VOTO'}
                          </button>

                          <div className="pt-4 border-t border-ink-50 dark:border-ink-700">
                            <CandidateComments candidateId={c.id} candidateName={c.name} />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </section>

              {/* En móvil, el escrutinio debajo de las tarjetas */}
              <LiveRanking results={results} isActive={election.is_active} className="order-last lg:order-none" />
            </div>
          </>
        )}
      </main>

      {/* Mismo pie que el sitio, sin la navegación por categorías */}
      <Footer withNav={false} />

      {message && (
        <Toast message={message} variant={messageType} onClose={() => setMessage("")} />
      )}
    </div>
  );
}
