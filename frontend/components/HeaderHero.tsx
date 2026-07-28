import Link from "next/link";
import Logo from "@/components/Logo";

/*
  Portada del header. Vive aparte porque se pinta en dos sitios: el header
  completo del sitio y las páginas de enlace compartido (/vote/[slug]), que no
  llevan navegación. Ambas deben verse idénticas, así que el marcado es uno solo.
*/
export default function HeaderHero() {
  return (
    <div className="relative overflow-hidden">
      <img
        src="/banner.png"
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-br from-ink-950/95 via-ink-900/85 to-brand-800/80" />
      <div className="relative z-10 mx-auto flex max-w-[1500px] flex-col items-center px-6 py-12 text-center">
        <Link href="/" className="transition-opacity hover:opacity-90">
          <Logo />
        </Link>
        <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-white/70">
          Participación ciudadana medida con rigor. Consulta procesos electorales,
          emite tu voto y sigue los resultados en tiempo real.
        </p>
      </div>
    </div>
  );
}
