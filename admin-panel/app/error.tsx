"use client";

import { useEffect } from "react";

/**
 * Red de seguridad del panel: evita que un error de render deje al admin ante
 * la pantalla en blanco de Next sin ninguna acción posible.
 */
export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error("Error en el panel:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="panel w-full max-w-md p-8 text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </span>

        <h1 className="mt-6 text-xl font-semibold">Algo salió mal</h1>
        <p className="mt-2 text-sm leading-relaxed text-ink-500 dark:text-ink-300">
          No se pudo mostrar esta sección. Reintenta; si el problema persiste, revisa que el
          servidor esté activo.
        </p>

        <div className="mt-8 flex justify-center gap-3">
          <button onClick={reset} className="btn-primary">Reintentar</button>
          <a href="/" className="btn-secondary">Ir al inicio</a>
        </div>
      </div>
    </div>
  );
}
