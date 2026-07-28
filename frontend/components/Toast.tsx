"use client";

/*
  Aviso flotante de voto. Marino de marca con un filo lateral de color: dorado
  cuando el voto entró, rojo cuando el backend lo rechazó. El color va en el
  filo y en el icono, no en el fondo, para que el aviso siga leyéndose como
  parte de la página y no como una alerta genérica del navegador.
*/
export default function Toast({
  message,
  variant = "error",
  onClose,
}: {
  message: string;
  variant?: "success" | "error";
  onClose?: () => void;
}) {
  const isError = variant === "error";

  return (
    // En móvil ocupa el ancho con márgenes; en escritorio se ancla abajo a la derecha.
    <div className="fixed inset-x-4 bottom-6 z-[200] sm:inset-x-auto sm:bottom-8 sm:right-8 sm:max-w-sm">
      <div
        role="status"
        aria-live="polite"
        className={`flex items-start gap-3.5 rounded-xl border-l-[5px] bg-navy py-4 pl-4 pr-4 text-white shadow-2xl ${
          isError ? "border-red-500" : "border-gold"
        }`}
      >
        <span className={`mt-0.5 shrink-0 ${isError ? "text-red-500" : "text-gold"}`}>
          {isError ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
          )}
        </span>

        <p className="flex-1 text-sm font-semibold leading-snug">{message}</p>

        {onClose && (
          <button
            onClick={onClose}
            aria-label="Cerrar aviso"
            className="mt-0.5 shrink-0 text-white/50 transition-colors hover:text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        )}
      </div>
    </div>
  );
}
