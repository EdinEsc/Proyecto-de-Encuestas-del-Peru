"use client";

import { useEffect, useState } from "react";
import { api, Comment } from "@/lib/api";

export default function CandidateComments({ candidateId }: { candidateId: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const loadComments = () => {
    api<Comment[]>(`/candidates/${candidateId}/comments`).then(setComments).catch(() => {});
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
    <div className="mt-6 space-y-4">
      <div className="flex gap-2">
        <input 
          className="flex-grow rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white" 
          placeholder="Escribe un comentario..." 
          value={newComment}
          onChange={e => setNewComment(e.target.value)}
          disabled={loading}
        />
        <button 
          className="btn-primary py-2 px-4 text-xs" 
          onClick={postComment}
          disabled={loading}
        >
          {loading ? "..." : "Enviar"}
        </button>
      </div>
      {msg && <p className="text-[10px] text-slate-500">{msg}</p>}
      
      <div className="space-y-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
        {comments.map(c => (
          <div key={c.id} className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800/50">
            <p className="text-xs text-slate-700 dark:text-slate-300">{c.content}</p>
            <div className="mt-1 flex justify-between text-[10px] text-slate-400">
              <span>IP: {c.ip_address}</span>
              <span>{new Date(c.created_at).toLocaleString()}</span>
            </div>
          </div>
        ))}
        {comments.length === 0 && <p className="text-center text-xs text-slate-400 py-2">Sin comentarios aún.</p>}
      </div>
    </div>
  );
}
