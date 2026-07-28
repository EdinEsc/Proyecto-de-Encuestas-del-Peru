"use client";

import { useEffect, useRef } from "react";

/*
  Refresco periódico que solo corre mientras la pestaña está a la vista.

  Una pestaña olvidada en segundo plano seguía consultando la base cada pocos
  segundos sin que nadie mirara el resultado; eso fue lo que agotó la cuota de
  transferencia del plan. Al volver a la pestaña se refresca de inmediato, así
  que quien regresa no ve datos viejos esperando el siguiente ciclo.
*/
export function usePolling(callback: () => void, intervalMs: number, enabled = true) {
  // La referencia evita reiniciar el temporizador en cada render solo porque
  // la función cambió de identidad.
  const saved = useRef(callback);
  useEffect(() => {
    saved.current = callback;
  });

  useEffect(() => {
    if (!enabled) return;

    let timer: ReturnType<typeof setInterval> | null = null;

    const stop = () => {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    };

    const start = () => {
      if (timer) return;
      timer = setInterval(() => saved.current(), intervalMs);
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        saved.current();
        start();
      } else {
        stop();
      }
    };

    if (document.visibilityState === "visible") start();
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [intervalMs, enabled]);
}
