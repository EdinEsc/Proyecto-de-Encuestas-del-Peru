"use client";

import { Results, getImageUrl } from "@/lib/api";

/*
  Tarjeta lateral de resultados. Sustituye al botón "Ver Escrutinio Detallado":
  el escrutinio se lee junto a las tarjetas, sin salir de la página.
*/
export default function LiveRanking({
  results,
  isActive,
  className = "",
}: {
  results: Results | null;
  isActive?: boolean;
  className?: string;
}) {
  const ranking = results?.ranking ?? [];
  const totalVotes = results?.total_votes ?? 0;
  // La barra se mide contra el puntero: la distancia con el líder se lee de un vistazo.
  const topVotes = ranking.reduce((max, r) => Math.max(max, r.votes), 0);

  return (
    <aside className={`rounded-xl border border-mist dark:border-white/10 bg-white dark:bg-navy overflow-hidden lg:sticky lg:top-6 ${className}`}>
      <div className="h-1 w-full bg-gold" />

      <div className="p-6 md:p-7 border-b border-mist dark:border-white/10">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            {isActive && <span className="h-3 w-3 rounded-full bg-gold animate-pulse" />}
            <h3 className="text-xl md:text-2xl font-semibold tracking-tight text-navy dark:text-white">
              {isActive ? "Resultados en vivo" : "Resultado final"}
            </h3>
          </div>
          <div className="text-right leading-none">
            <p className="text-4xl font-semibold tabular-nums text-navy dark:text-white">
              {totalVotes.toLocaleString()}
            </p>
            <p className="mt-1.5 text-xs font-semibold tracking-[0.1em] text-carbon/60 dark:text-ink-300">
              VOTOS
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 md:p-7 space-y-6">
        {ranking.map((r, i) => {
          const isLeader = i === 0 && r.votes > 0;
          const fill = topVotes > 0 ? (r.votes / topVotes) * 100 : 0;
          const share = totalVotes > 0 ? (r.votes / totalVotes) * 100 : 0;

          return (
            <div key={r.candidate_id}>
              <div className="flex items-center gap-3.5 mb-3">
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold ${
                    isLeader
                      ? "bg-gold text-navy"
                      : "bg-mist text-carbon/70 dark:bg-white/10 dark:text-ink-200"
                  }`}
                >
                  {i + 1}
                </span>
                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-mist dark:bg-navy-dark">
                  <img
                    src={getImageUrl(r.image_url)}
                    alt={r.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <p className="min-w-0 flex-grow truncate text-base font-semibold text-navy dark:text-white">
                  {r.name}
                </p>
                <div className="shrink-0 text-right leading-none">
                  <span className="text-2xl font-semibold tabular-nums text-navy dark:text-white">
                    {share.toFixed(1)}%
                  </span>
                  <p className="mt-1.5 text-sm font-semibold text-carbon/60 dark:text-ink-300">
                    {r.votes.toLocaleString()} votos
                  </p>
                </div>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-mist dark:bg-white/10">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ease-out ${
                    isLeader ? "bg-gold" : "bg-navy/40 dark:bg-electric/50"
                  }`}
                  style={{ width: `${fill}%` }}
                />
              </div>
            </div>
          );
        })}

        {ranking.length === 0 && (
          <p className="py-8 text-center text-base font-semibold text-carbon/50 dark:text-ink-300">
            Aún no hay votos registrados.
          </p>
        )}
      </div>

      {isActive && ranking.length > 0 && (
        <p className="px-7 pb-6 text-xs font-semibold tracking-[0.08em] text-carbon/50 dark:text-ink-300">
          Actualización automática
        </p>
      )}
    </aside>
  );
}
