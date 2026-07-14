type LogoProps = {
  /** Muestra el texto "Precisium" y el tagline junto al isotipo */
  withWordmark?: boolean;
  /** Fuerza el wordmark en blanco (para fondos oscuros como el hero) */
  onDark?: boolean;
  className?: string;
};

/** Isotipo: la "P" circular con la mira de precisión. */
export function LogoMark({ className = "h-10 w-10" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" fill="none" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="precisium-arc" x1="18" y1="100" x2="96" y2="20" gradientUnits="userSpaceOnUse">
          <stop stopColor="#2563EB" />
          <stop offset="1" stopColor="#00C9A7" />
        </linearGradient>
      </defs>

      {/* Cuerpo de la P: arco grueso abierto abajo a la izquierda */}
      <path
        d="M 32 61 A 30 30 0 1 1 43 72"
        stroke="url(#precisium-arc)"
        strokeWidth="21"
        strokeLinecap="round"
        fill="none"
      />

      {/* Asta descendente en azul noche */}
      <path d="M 31 59 L 47 71 L 40 114 L 20 114 Z" className="fill-ink-900 dark:fill-white" />

      {/* Mira de precisión */}
      <circle cx="58" cy="46" r="14" className="stroke-ink-900 dark:stroke-white" strokeWidth="4.5" fill="none" />
      <g className="stroke-ink-900 dark:stroke-white" strokeWidth="4.5" strokeLinecap="round">
        <line x1="58" y1="25" x2="58" y2="36" />
        <line x1="58" y1="56" x2="58" y2="67" />
        <line x1="37" y1="46" x2="48" y2="46" />
        <line x1="68" y1="46" x2="79" y2="46" />
      </g>
      <circle cx="58" cy="46" r="4.5" fill="#00C9A7" />
    </svg>
  );
}

export default function Logo({ withWordmark = true, onDark = false, className = "" }: LogoProps) {
  return (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      <LogoMark className="h-11 w-11 shrink-0" />
      {withWordmark && (
        <span className="flex flex-col leading-none">
          <span
            className={`text-xl font-bold tracking-tight ${
              onDark ? "text-white" : "text-ink-900 dark:text-white"
            }`}
          >
            Precisium
          </span>
          <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-accent-500">
            Datos precisos, decisiones certeras
          </span>
        </span>
      )}
    </span>
  );
}
