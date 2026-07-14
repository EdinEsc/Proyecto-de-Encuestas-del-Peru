"use client";

import { useEffect } from "react";
import Link from "next/link";

/**
 * Red de seguridad: si un componente lanza un error durante el render, React
 * desmonta toda la página. Sin esto, el usuario ve la pantalla en blanco de
 * Next ("This page couldn't load") sin ninguna salida.
 */
export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error("Error en la página:", error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-6 py-24 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400">
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      </span>

      <h1 className="mt-6 text-2xl font-semibold">No pudimos mostrar esta página</h1>
      <p className="mt-2 text-sm leading-relaxed text-ink-500 dark:text-ink-300">
        Ocurrió un problema al cargar la información. Puedes reintentar o volver al inicio.
      </p>

      <div className="mt-8 flex gap-3">
        <button onClick={reset} className="btn-primary">Reintentar</button>
        <Link href="/" className="btn-ghost">Volver al inicio</Link>
      </div>
    </div>
  );
}
