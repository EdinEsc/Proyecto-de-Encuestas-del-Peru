type LogoProps = {
  /** Muestra el lockup completo (isotipo + "Precisium" + tagline) */
  withWordmark?: boolean;
  className?: string;
};

/** Isotipo: la "P" circular con la mira de precisión. */
export function LogoMark({ className = "h-10 w-10" }: { className?: string }) {
  return (
    <img
      src="/locoicono.png"
      alt=""
      aria-hidden="true"
      className={`object-contain ${className}`}
    />
  );
}

export default function Logo({ withWordmark = true, className = "" }: LogoProps) {
  if (!withWordmark) {
    return <LogoMark className={`h-11 w-11 shrink-0 ${className}`} />;
  }

  return (
    <img
      src="/logo.png"
      alt="Precisium — Datos precisos, decisiones certeras"
      className={`h-24 w-auto object-contain md:h-36 ${className}`}
    />
  );
}
