"use client";

import { useEffect, useState } from "react";
import { api, Comment } from "@/lib/api";

export default function CandidateComments({ candidateId }: { candidateId: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const loadComments = () => {
    api<Comment[]>(`/candidates/${candidateId}/comments`).then(data => setComments(data || [])).catch(() => {});
  };

  useEffect(() => {
    loadComments();
  }, [candidateId]);

  const postComment = async () => {
    if (!newComment.trim()) return;
    setLoading(true);
    try {
      await api("/comments", {
        method: "POST",
        body: JSON.stringify({ candidate_id: candidateId, content: newComment })
      });
      setNewComment("");
      setMsg("Comentario publicado");
      loadComments();
    } catch (e: any) {
      setMsg(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-1">
        <input 
          className="rounded-xl flex-grow border border-ink-100 dark:border-ink-700 bg-ink-50 dark:bg-ink-800 px-4 py-3 text-xs text-black dark:text-white outline-none focus:bg-white dark:focus:bg-ink-700 focus:border-black dark:focus:border-brand-500 transition-all placeholder:text-ink-400 dark:placeholder:text-ink-500" 
          placeholder="Escriba su opinión..." 
          value={newComment}
          onChange={e => setNewComment(e.target.value)}
          disabled={loading}
        />
        <button 
          className="rounded-xl bg-black dark:bg-brand-600 text-white px-6 py-3 text-xs font-bold tracking-wide hover:bg-ink-800 dark:hover:bg-brand-500 transition-colors disabled:opacity-50" 
          onClick={postComment}
          disabled={loading}
        >
          {loading ? "..." : "Enviar"}
        </button>
      </div>
      {msg && <p className="text-xs font-bold tracking-wide text-ink-400 dark:text-ink-500">{msg}</p>}
      
      <div className="space-y-6">
        {comments?.map(c => (
          <div key={c.id} className="border-l-2 border-ink-100 dark:border-ink-700 pl-4 py-1">
            <p className="text-sm text-ink-600 dark:text-ink-300 leading-relaxed">{c.content}</p>
            <div className="mt-2 flex gap-4 text-xs font-bold tracking-wide text-ink-300 dark:text-ink-600">
              <span>IP {c.ip_address}</span>
              <span>{new Date(c.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
        {comments.length === 0 && <p className="text-xs tracking-wide text-ink-300 dark:text-ink-600 py-2">Sin opiniones registradas.</p>}
      </div>
    </div>
  );
}
