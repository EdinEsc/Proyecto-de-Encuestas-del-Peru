"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { api, Comment, CommentPage } from "@/lib/api";

const PAGE_SIZE = 20;

/*
  Las opiniones no se pintan dentro de la tarjeta: en un grid, la fila entera se
  estira a la altura de la tarjeta más alta, así que un candidato con cien
  comentarios dejaba a su vecino con un hueco blanco enorme. Aquí la tarjeta
  solo muestra el contador y una línea de la opinión más reciente —altura
  constante, haya 3 o 300— y la conversación se abre en un panel: hoja inferior
  en móvil, ventana centrada en escritorio.
*/
export default function CandidateComments({
  candidateId,
  candidateName,
}: {
  candidateId: string;
  candidateName?: string;
}) {
  const [total, setTotal] = useState(0);
  const [preview, setPreview] = useState<Comment | null>(null);

  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Comment[]>([]);
  const [listLoading, setListLoading] = useState(false);

  const [newComment, setNewComment] = useState("");
  const [msg, setMsg] = useState("");
  const [posting, setPosting] = useState(false);

  // La tarjeta pide una sola opinión: la última, para la vista previa y el total.
  const loadPreview = () => {
    api<CommentPage>(`/candidates/${candidateId}/comments?limit=1`)
      .then(page => {
        setTotal(page?.total ?? 0);
        setPreview(page?.items?.[0] ?? null);
      })
      .catch(() => {});
  };

  useEffect(loadPreview, [candidateId]);

  const loadPage = async (offset: number) => {
    setListLoading(true);
    try {
      const page = await api<CommentPage>(
        `/candidates/${candidateId}/comments?limit=${PAGE_SIZE}&offset=${offset}`
      );
      setTotal(page?.total ?? 0);
      // offset 0 reemplaza la lista (primera apertura o recarga tras comentar).
      setItems(prev => (offset === 0 ? page?.items ?? [] : [...prev, ...(page?.items ?? [])]));
    } catch {
      // El panel se queda con lo que ya tenía; el aviso lo da el POST si falla.
    } finally {
      setListLoading(false);
    }
  };

  const openPanel = () => {
    setOpen(true);
    setMsg("");
    loadPage(0);
  };

  // Escape cierra, y el fondo no debe desplazarse mientras el panel está abierto.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  const postComment = async () => {
    if (!newComment.trim() || posting) return;
    setPosting(true);
    try {
      await api("/comments", {
        method: "POST",
        body: JSON.stringify({ candidate_id: candidateId, content: newComment }),
      });
      setNewComment("");
      setMsg("");
      await loadPage(0);
      loadPreview();
    } catch (e: any) {
      setMsg(e.message || "No se pudo publicar la opinión");
    } finally {
      setPosting(false);
    }
  };

  const label = total === 0 ? "Sé el primero en opinar" : `${total} ${total === 1 ? "opinión" : "opiniones"}`;

  const panel = (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={candidateName ? `Opiniones sobre ${candidateName}` : "Opiniones"}
      className="fixed inset-0 z-[300] flex items-end justify-center sm:items-center sm:p-6"
    >
      <div className="absolute inset-0 bg-navy/60 backdrop-blur-sm" onClick={() => setOpen(false)} />

      <div className="relative flex max-h-[88vh] w-full flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl dark:bg-navy sm:max-h-[80vh] sm:max-w-lg sm:rounded-2xl">
        <div className="h-1 w-full shrink-0 bg-gold" />

        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-mist px-5 py-4 dark:border-white/10">
          <div className="min-w-0">
            <h3 className="truncate text-lg font-semibold tracking-tight text-navy dark:text-white">
              {candidateName || "Opiniones"}
            </h3>
            <p className="mt-0.5 text-xs font-semibold text-carbon/60 dark:text-ink-300">
              {total} {total === 1 ? "opinión registrada" : "opiniones registradas"}
            </p>
          </div>
          <button
            onClick={() => setOpen(false)}
            aria-label="Cerrar opiniones"
            className="-mr-1 shrink-0 rounded-lg p-1.5 text-carbon/50 transition-colors hover:bg-mist hover:text-navy dark:text-ink-300 dark:hover:bg-white/10 dark:hover:text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>

        {/* Aquí el input tiene ancho de sobra: dentro de la tarjeta iba apilado */}
        <div className="shrink-0 border-b border-mist px-5 py-4 dark:border-white/10">
          <div className="flex gap-2">
            <input
              className="w-full min-w-0 flex-grow rounded-xl border border-mist bg-mist px-4 py-3 text-sm text-carbon outline-none transition-colors placeholder:text-carbon/40 focus:border-electric focus:bg-white dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-ink-300 dark:focus:border-electric"
              placeholder="Escriba su opinión..."
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") postComment(); }}
              maxLength={500}
              disabled={posting}
              autoFocus
            />
            <button
              className="shrink-0 rounded-xl bg-navy px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-navy-light disabled:opacity-50 dark:bg-electric dark:hover:bg-electric-hover"
              onClick={postComment}
              disabled={posting || !newComment.trim()}
            >
              {posting ? "…" : "Enviar"}
            </button>
          </div>
          {msg && <p className="mt-2 text-xs font-semibold text-red-500">{msg}</p>}
        </div>

        <div className="scroll-slim flex-1 overflow-y-auto px-5 py-4">
          <div className="space-y-5">
            {items.map(c => (
              <div key={c.id} className="border-l-2 border-mist pl-4 dark:border-white/10">
                <p className="text-sm leading-relaxed text-carbon dark:text-ink-200">{c.content}</p>
                <div className="mt-1.5 flex gap-4 text-[11px] font-semibold text-carbon/40 dark:text-ink-300">
                  <span>IP {c.ip_address}</span>
                  <span>{new Date(c.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>

          {items.length === 0 && !listLoading && (
            <p className="py-10 text-center text-sm font-semibold text-carbon/40 dark:text-ink-300">
              Sin opiniones registradas.
            </p>
          )}

          {items.length < total && (
            <button
              onClick={() => loadPage(items.length)}
              disabled={listLoading}
              className="mt-6 w-full rounded-xl border border-mist py-3 text-xs font-semibold text-navy transition-colors hover:bg-mist disabled:opacity-50 dark:border-white/10 dark:text-white dark:hover:bg-white/10"
            >
              {listLoading ? "Cargando…" : `Ver ${Math.min(PAGE_SIZE, total - items.length)} más`}
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Disparador: altura fija, dos líneas como mucho */}
      <button onClick={openPanel} className="w-full text-left" aria-haspopup="dialog">
        <span className="flex items-center justify-between gap-2">
          <span className="flex min-w-0 items-center gap-1.5 text-xs font-semibold text-navy dark:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-gold"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" /></svg>
            <span className="truncate">{label}</span>
          </span>
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-carbon/40 dark:text-ink-300"><polyline points="9 18 15 12 9 6" /></svg>
        </span>
        {preview && (
          <span className="mt-1.5 block truncate text-xs italic text-carbon/60 dark:text-ink-300">
            &ldquo;{preview.content}&rdquo;
          </span>
        )}
      </button>

      {/* Portal: la tarjeta tiene overflow-hidden y recortaría el panel */}
      {open && typeof document !== "undefined" && createPortal(panel, document.body)}
    </>
  );
}
