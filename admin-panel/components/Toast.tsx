"use client";

import { useEffect, useState } from "react";

export type ToastType = "success" | "error" | "info";

export interface ToastMessage {
  id: string;
  text: string;
  type: ToastType;
}

export default function ToastContainer({ toasts, onRemove }: { toasts: ToastMessage[], onRemove: (id: string) => void }) {
  return (
    <div className="fixed bottom-8 right-8 z-[100] flex flex-col gap-3 pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={() => onRemove(toast.id)} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onRemove }: { toast: ToastMessage, onRemove: () => void }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Entrance animation
    const timer = setTimeout(() => setVisible(true), 10);
    
    // Auto-remove after 4 seconds
    const removeTimer = setTimeout(() => {
      setVisible(false);
      setTimeout(onRemove, 300); // Wait for exit animation
    }, 4000);

    return () => {
      clearTimeout(timer);
      clearTimeout(removeTimer);
    };
  }, [onRemove]);

  const bgColor = {
    success: "bg-black border-black",
    error: "bg-red-600 border-red-600",
    info: "bg-slate-800 border-slate-800",
  }[toast.type];

  return (
    <div
      className={`
        pointer-events-auto
        flex items-center gap-4 px-6 py-4 border text-white shadow-2xl transition-all duration-300 ease-out
        ${visible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"}
        ${bgColor}
      `}
      style={{ minWidth: "300px" }}
    >
      <div className="flex-grow">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-1 opacity-50">
          {toast.type === "success" ? "Operación Exitosa" : toast.type === "error" ? "Error de Sistema" : "Notificación"}
        </p>
        <p className="text-xs font-bold uppercase tracking-widest">{toast.text}</p>
      </div>
      <button 
        onClick={() => {
          setVisible(false);
          setTimeout(onRemove, 300);
        }}
        className="text-white hover:opacity-50 transition-opacity"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>
  );
}
