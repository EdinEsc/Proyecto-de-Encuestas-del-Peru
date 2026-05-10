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
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-white/80 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      {/* Content */}
      <div className="relative w-full max-w-md bg-white border border-black p-8 shadow-[0_20px_50px_rgba(0,0,0,0.1)] transition-all">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            {isDanger && (
              <div className="h-2 w-2 bg-red-500 rounded-full animate-pulse" />
            )}
            <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-black">
              {title}
            </h2>
          </div>
          <p className="text-sm font-medium leading-relaxed text-slate-600">
            {message}
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`
              w-full py-4 text-[10px] font-bold uppercase tracking-widest transition-all
              ${isDanger 
                ? "bg-red-600 text-white hover:bg-red-700" 
                : "bg-black text-white hover:bg-slate-800"}
            `}
          >
            {confirmText}
          </button>
          <button
            onClick={onClose}
            className="w-full py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-black transition-colors"
          >
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  );
}
