"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { api, Candidate, Election, getBrowserId } from "@/lib/api";
import CandidateComments from "@/components/CandidateComments";

declare global {
  interface Window {
    grecaptcha: any;
  }
}

export default function ElectionPage({ params }: { params: Promise<{ id: string }> }) {
  const [id, setId] = useState("");
  const [election, setElection] = useState<Election | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [voted, setVoted] = useState(false);
  const recaptchaRef = useRef<HTMLDivElement>(null);

  useEffect(() => { params.then(p => setId(p.id)); }, [params]);
  
  useEffect(() => {
    if (!id) return;
    setVoted(localStorage.getItem(`voted:election:${id}`) === "true");
    api<Election>(`/elections/${id}`).then(setElection);
    api<Candidate[]>(`/elections/${id}/candidates`).then(data => setCandidates(data || []));
  }, [id]);

  async function vote(candidate_id: string) {
    if (voted || !election?.is_active) return;
    
    // Get Recaptcha Token (optional)
    let token = "";
    if (window.grecaptcha) {
      try {
        token = window.grecaptcha.getResponse() || "";
      } catch (e) {
        console.warn("reCAPTCHA error:", e);
      }
    }

    setLoading(true);
    try {
      await api(`/vote`, { 
        method: "POST", 
        body: JSON.stringify({ 
          election_id: id, 
          candidate_id, 
          browser_id: getBrowserId(), 
          recaptcha_token: token 
        }) 
      });
      localStorage.setItem(`voted:election:${id}`, "true");
      setVoted(true);
      setMessage("¡Tu voto ha sido registrado con éxito!");
      if (window.grecaptcha) window.grecaptcha.reset();
    } catch (e: any) { 
      setMessage(e.message || "Error al registrar el voto"); 
      if (window.grecaptcha) window.grecaptcha.reset();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="py-12 bg-slate-50 dark:bg-slate-950 min-h-screen">
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center text-sm font-medium text-slate-600 hover:text-primary transition-colors dark:text-slate-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
            Volver al listado
          </Link>
          
          <Link href={`/results/${id}`} className="text-sm font-semibold text-primary hover:underline underline-offset-4">
            Ver resultados en tiempo real →
          </Link>
        </div>

        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex-grow">
            <div className="flex items-center gap-2 mb-4">
              <span className="bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                {election?.election_type || "Proceso Oficial"}
              </span>
              <span className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider ${election?.is_active ? 'text-green-600' : 'text-slate-400'}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${election?.is_active ? 'bg-green-600' : 'bg-slate-400'}`}></span>
                {election?.is_active ? 'Fase de Votación' : 'Cerrada'}
              </span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
              {election?.title || "Cargando proceso..."}
            </h1>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-400 max-w-3xl">
              {election?.description || "Portal oficial para la emisión de voto digital. Su participación es fundamental para el fortalecimiento de la democracia."}
            </p>
          </div>

          <div className="hidden lg:flex flex-col items-center p-4 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="h-12 w-12 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center text-green-600 mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Conexión Segura</span>
          </div>
        </div>

        <div className="mb-8 p-4 bg-slate-900 text-white rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded bg-white/10 flex items-center justify-center text-blue-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
            </div>
            <p className="text-sm font-medium">
              Aviso: Se aplicará validación por IP y firma digital de navegador para garantizar un voto único por ciudadano.
            </p>
          </div>
          <Link href={`/results/${id}`} className="text-xs font-bold uppercase tracking-widest text-blue-400 hover:text-blue-300 transition-colors">
            Ver estadísticas →
          </Link>
        </div>

        {message && (
          <div className={`mb-8 rounded-lg border-l-4 p-4 flex items-center gap-3 ${message.includes('éxito') ? 'border-green-600 bg-green-50 text-green-800 dark:bg-green-900/10' : 'border-red-600 bg-red-50 text-red-800 dark:bg-red-900/10'}`}>
            <p className="text-sm font-bold">{message}</p>
          </div>
        )}

        {!voted && election?.is_active && (
          <div className="mb-12 flex flex-col items-center gap-4">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Validación de Seguridad Humana</p>
            <div className="g-recaptcha" data-sitekey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"></div>
          </div>
        )}

        <section className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {candidates?.map(c => (
            <div key={c.id} className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col transition-all ${voted ? 'opacity-70 grayscale-[0.5]' : 'hover:border-primary/50 hover:shadow-xl'}`}>
              <div className="relative aspect-[4/5] w-full overflow-hidden grayscale-[0.2] hover:grayscale-0 transition-all duration-700">
                <img 
                  src={c.image_url || 'https://images.unsplash.com/photo-1521791136064-7986c2959d43?q=80&w=2069&auto=format&fit=crop'} 
                  alt={c.name} 
                  className="h-full w-full object-cover" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4">
                  <h2 className="text-2xl font-bold text-white mb-1">{c.name}</h2>
                  <p className="text-xs text-slate-300 uppercase tracking-widest font-semibold">Candidato Oficial</p>
                </div>
              </div>
              <div className="p-6 flex flex-col flex-grow">
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-8 leading-relaxed italic">
                  "{c.description || "Comprometido con el desarrollo y la transparencia institucional para el periodo correspondiente."}"
                </p>
                
                <div className="mt-auto space-y-8">
                  <button 
                    className={`w-full btn-primary !rounded-none py-4 uppercase tracking-widest text-xs ${loading ? 'opacity-50 cursor-not-allowed' : ''}`} 
                    disabled={voted || !election?.is_active || loading} 
                    onClick={() => vote(c.id)}
                  >
                    {loading ? 'Procesando...' : voted ? 'Voto Registrado' : 'Emitir Voto'}
                  </button>

                  <div className="pt-6">
                    <h4 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mb-4 uppercase tracking-[0.2em] flex items-center gap-2">
                      <div className="h-px flex-grow bg-slate-100 dark:bg-slate-800"></div>
                      Opiniones Ciudadanas
                      <div className="h-px flex-grow bg-slate-100 dark:bg-slate-800"></div>
                    </h4>
                    <CandidateComments candidateId={c.id} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </section>

        
        <div className="mt-12 flex justify-center">
          <Link href={`/results/${id}`} className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-8 py-4 text-sm font-semibold text-slate-900 shadow-sm transition-all hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-white dark:hover:bg-slate-800">
            Ir a Resultados Finales
          </Link>
        </div>
      </main>
    </div>
  );
}

