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
          className="flex-grow border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3 text-xs text-black dark:text-white outline-none focus:bg-white dark:focus:bg-slate-700 focus:border-black dark:focus:border-emerald-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500" 
          placeholder="Escriba su opinión..." 
          value={newComment}
          onChange={e => setNewComment(e.target.value)}
          disabled={loading}
        />
        <button 
          className="bg-black dark:bg-emerald-600 text-white px-6 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-slate-800 dark:hover:bg-emerald-500 transition-colors disabled:opacity-50" 
          onClick={postComment}
          disabled={loading}
        >
          {loading ? "..." : "Enviar"}
        </button>
      </div>
      {msg && <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">{msg}</p>}
      
      <div className="space-y-6">
        {comments?.map(c => (
          <div key={c.id} className="border-l-2 border-slate-100 dark:border-slate-700 pl-4 py-1">
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{c.content}</p>
            <div className="mt-2 flex gap-4 text-[9px] font-bold uppercase tracking-widest text-slate-300 dark:text-slate-600">
              <span>IP {c.ip_address}</span>
              <span>{new Date(c.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
        {comments.length === 0 && <p className="text-[10px] uppercase tracking-widest text-slate-300 dark:text-slate-600 py-2">Sin opiniones registradas.</p>}
      </div>
    </div>
  );
}
