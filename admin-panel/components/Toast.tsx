"use client";

import { ReactNode, useEffect, useState } from "react";

export type ToastType = "success" | "error" | "info";

export interface ToastMessage {
  id: string;
  text: string;
  type: ToastType;
}

export default function ToastContainer({ toasts, onRemove }: { toasts: ToastMessage[], onRemove: (id: string) => void }) {
  return (
    <div className="pointer-events-none fixed bottom-6 right-6 z-[100] flex flex-col gap-2">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={() => onRemove(toast.id)} />
      ))}
    </div>
  );
}

const ICONS: Record<ToastType, ReactNode> = {
  success: <><circle cx="12" cy="12" r="10" /><path d="m9 12 2 2 4-4" /></>,
  error: <><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></>,
  info: <><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></>,
};

function ToastItem({ toast, onRemove }: { toast: ToastMessage, onRemove: () => void }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 10);
    const removeTimer = setTimeout(() => {
      setVisible(false);
      setTimeout(onRemove, 200);
    }, 4000);

    return () => {
      clearTimeout(timer);
      clearTimeout(removeTimer);
    };
  }, [onRemove]);

  const tone = {
    success: "text-accent-600",
    error: "text-red-600",
    info: "text-brand-600",
  }[toast.type];

  return (
    <div
      role="status"
      className={`pointer-events-auto flex w-[340px] items-start gap-3 rounded-lg border border-ink-200 bg-white px-4 py-3
                  shadow-sm transition-all duration-200 ease-out dark:border-white/10 dark:bg-ink-900
                  ${visible ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0"}`}
    >
      <span className={`mt-0.5 shrink-0 ${tone}`}>
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          {ICONS[toast.type]}
        </svg>
      </span>
      <p className="flex-1 text-sm text-ink-700 dark:text-ink-100">{toast.text}</p>
      <button
        onClick={() => { setVisible(false); setTimeout(onRemove, 200); }}
        aria-label="Cerrar notificación"
        className="shrink-0 text-ink-400 transition-colors hover:text-ink-700 dark:hover:text-white"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
      </button>
    </div>
  );
}
