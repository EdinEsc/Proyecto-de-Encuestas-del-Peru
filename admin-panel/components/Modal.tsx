"use client";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDanger?: boolean;
}

export default function Modal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  isDanger = false
}: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-ink-950/40" onClick={onClose} />

      <div className="panel relative w-full max-w-md shadow-lg">
        <div className="p-6">
          <div className="flex gap-4">
            <span
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                isDanger
                  ? "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400"
                  : "bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300"
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </span>
            <div className="min-w-0">
              <h2 className="text-base font-semibold">{title}</h2>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-500 dark:text-ink-300">{message}</p>
            </div>
          </div>
        </div>

        <div className="panel-footer">
          <button onClick={onClose} className="btn-secondary">
            {cancelText}
          </button>
          <button
            onClick={() => { onConfirm(); onClose(); }}
            className={isDanger ? "btn bg-red-600 text-white hover:bg-red-700" : "btn-primary"}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
