"use client";

import { useEffect, useState, useRef, use } from "react";
import Link from "next/link";
import { api, Candidate, Election, getBrowserId, getImageUrl } from "@/lib/api";
import CandidateComments from "@/components/CandidateComments";
import LiveRanking from "@/components/LiveRanking";
import Toast from "@/components/Toast";

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
  // El tono del aviso no se puede deducir de `voted`: si el backend rechaza el
  // voto por IP repetida, `voted` sigue en falso y el mensaje es un error.
  const [messageType, setMessageType] = useState<"success" | "error">("success");
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
      setMessageType("success");
      setMessage("¡Tu participación ha sido registrada con éxito!");

      // Update results immediately after voting
      api<any>(`/results/${id}`).then(setResults).catch(err => console.error(err));
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

  // En móvil el margen lateral se reduce (px-4): son los píxeles que ganan las
  // tarjetas de candidato, que a dos columnas se quedaban muy angostas.
  return (
    <div className="max-w-[1500px] mx-auto px-4 sm:px-6 pt-8 pb-20 min-h-screen">
      <div className="mb-12">
        <Link href="/" className="text-xs font-bold tracking-wide text-ink-600 dark:text-ink-400 hover:text-black dark:hover:text-white mb-6 inline-block transition-colors">
          ← Volver al inicio
        </Link>
        <div className="flex items-center gap-6 mb-6">
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

        <h1 className="text-4xl md:text-6xl font-semibold tracking-tight mb-8 leading-[1.1] text-black dark:text-white">{election?.title}</h1>
        
        {election?.banner_url && (
          <div className="rounded-xl w-full h-[450px] bg-ink-50 dark:bg-ink-800 mb-10 overflow-hidden border border-ink-100 dark:border-ink-700 shadow-xl">
            <img src={getImageUrl(election.banner_url)} alt="Portada" className="rounded-lg w-full h-full object-cover" />
          </div>
        )}

        {/* Descripción y datos del proceso: una sola fila a todo el ancho bajo el banner. */}
        <div className="rounded-xl bg-ink-50 dark:bg-ink-800/50 border border-ink-100 dark:border-ink-700 p-6 md:p-8 mb-8 flex flex-col lg:flex-row lg:items-center gap-6 lg:gap-10">
          <p className="text-lg md:text-xl text-black dark:text-white font-medium leading-snug italic border-l-4 border-brand-600 pl-6 lg:flex-1">
            {election?.description || "Su voto es fundamental para la transparencia democrática."}
          </p>

          <div className="flex flex-wrap gap-x-10 gap-y-4 lg:border-l lg:border-ink-200 lg:dark:border-ink-700 lg:pl-10">
            <div>
              <span className="text-[10px] font-semibold tracking-[0.12em] text-brand-600 dark:text-brand-400">VIGENCIA</span>
              <p className="text-sm font-semibold text-ink-800 dark:text-ink-200 whitespace-nowrap">
                {election ? new Date(election.created_at).toLocaleDateString() : "..."} — {election ? new Date(election.end_date).toLocaleDateString() : "..."}
              </p>
            </div>
            <div>
              <span className="text-[10px] font-semibold tracking-[0.12em] text-brand-600 dark:text-brand-400">SEGURIDAD</span>
              <p className="text-sm font-semibold text-ink-800 dark:text-ink-200">1 voto por IP y dispositivo</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl w-full text-center px-6 py-10 md:px-12 md:py-12 bg-white dark:bg-ink-800/50 border border-ink-100 dark:border-ink-700 shadow-sm">
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight italic mb-6 text-black dark:text-white">
            "¿Por cuál de los siguientes pre candidatos a {election?.region_name || "la Nación"} votaría?"
          </h2>
          <div className="rounded-lg h-1 w-20 bg-brand-600 mx-auto"></div>
        </div>
      </div>

      <div className="grid lg:grid-cols-[minmax(0,1fr)_500px] xl:grid-cols-[minmax(0,1fr)_560px] gap-8 lg:gap-10 items-start">
        {/* Separación mínima en móvil: el hueco entre tarjetas es ancho perdido */}
        <section className="grid grid-cols-2 gap-2 sm:gap-5 md:gap-6">
          {candidates?.map(c => {
            const stats = getCandidateStats(c.id);
            return (
              <div key={c.id} className="rounded-xl group flex flex-col bg-white dark:bg-navy border border-mist dark:border-white/10 overflow-hidden hover:border-electric transition-all duration-500">
                {/* Filo dorado: el acento de identidad, solo al pasar el mouse */}
                <div className="h-1 w-full bg-gold opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                <div className="relative h-40 sm:h-52 md:h-64 bg-mist dark:bg-navy-dark overflow-hidden">
                  <img src={getImageUrl(c.image_url)} alt={c.name} className="rounded-lg w-full h-full object-cover transition-transform duration-700 transform group-hover:scale-105" />
                  <div className="absolute top-2 right-2 md:top-3 md:right-3 flex flex-col items-end gap-1">
                    <span className="rounded-xl bg-navy text-white px-2 py-1 md:px-3 md:py-1.5 text-xs md:text-sm font-semibold tracking-tight shadow-xl">
                      {stats.percentage}%
                    </span>
                    {/* Dorado con texto marino: el blanco sobre dorado no da contraste */}
                    <span className="rounded-xl bg-gold text-navy px-2 py-0.5 text-[10px] md:text-xs font-bold tracking-wide">
                      {stats.votes} Votos
                    </span>
                  </div>
                </div>

                <div className="p-4 md:p-5 flex flex-col flex-grow">
                  <h2 className="text-base md:text-xl font-semibold mb-2 md:mb-3 tracking-tight text-navy dark:text-white leading-tight">{c.name}</h2>
                  <div className="h-0.5 w-8 bg-gold mb-3 md:mb-4"></div>
                  <p className="text-carbon/75 dark:text-ink-300 text-xs md:text-sm leading-relaxed mb-4 md:mb-5 flex-grow italic">
                    "{c.description || "Comprometido con el desarrollo transparente y el servicio íntegro a la ciudadanía."}"
                  </p>

                  {c.button_text && c.button_url && (
                    <a
                      href={c.button_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-xl mb-3 md:mb-4 inline-block w-full border border-navy/20 dark:border-white/20 py-2.5 text-[11px] md:text-xs font-semibold tracking-wide text-center text-navy dark:text-white hover:bg-navy hover:text-white hover:border-navy dark:hover:bg-electric dark:hover:border-electric transition-all"
                    >
                      {c.button_text}
                    </a>
                  )}

                  <div className="flex flex-col gap-3 mt-auto">
                    <button
                      className={`w-full rounded-xl py-3 text-xs md:text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
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
                          ? "Ya votaste"
                          : !election?.is_active
                            ? "Votación cerrada"
                            : "Votar"}
                    </button>

                    <div className="pt-4 border-t border-mist dark:border-white/10">
                      <CandidateComments candidateId={c.id} candidateName={c.name} />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </section>

        {/*
          En móvil el escrutinio va después de las tarjetas: lo primero que se
          ve al abrir debe ser a quién se vota, no el resultado.
        */}
        <LiveRanking results={results} isActive={election?.is_active} className="order-last lg:order-none" />
      </div>

      {message && (
        <Toast message={message} variant={messageType} onClose={() => setMessage("")} />
      )}

    </div>
  );
}
