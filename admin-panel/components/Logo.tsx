type LogoProps = {
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

export default function Logo({ className = "" }: LogoProps) {
  return <LogoMark className={`h-11 w-11 shrink-0 ${className}`} />;
}
