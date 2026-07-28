import { Results, sortRanking } from "@/lib/api";

export default function ResultBars({ results }: { results: Results }) {
  // La API devuelve ranking: null cuando la elección aún no tiene votos.
  // `sortRanking` además ancla "No sabe / No opina" al último lugar.
  const ranking = sortRanking(results?.ranking);
  const totalVotes = results?.total_votes ?? 0;

  // La barra se mide contra el puntero, no contra el total: así la diferencia
  // entre el primero y el resto se lee de un golpe de vista.
  const topVotes = ranking.reduce((max, r) => Math.max(max, r.votes), 0);

  return (
    <div className="space-y-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-ink-900 dark:text-white">Conteo General</h3>
          <p className="text-steel-500 dark:text-steel-400">
            Basado en los votos escrutados hasta el momento.
          </p>
        </div>
        <div className="text-right">
          <div className="text-4xl font-semibold text-ink-900 dark:text-white">
            {totalVotes.toLocaleString()}
          </div>
          <div className="text-xs font-bold tracking-wide text-steel-400">Votos Totales</div>
        </div>
      </div>

      <div className="grid gap-4">
        {ranking.map((r, i) => {
          const isWinner = i === 0 && r.votes > 0 && !r.is_undecided;
          const fill = topVotes === 0 ? 0 : (r.votes / topVotes) * 100;
          // La opción neutral no ocupa puesto: se marca con un guion.
          const position = ranking.slice(0, i + 1).filter(x => !x.is_undecided).length;

          return (
            <div
              className={`rounded-2xl border p-6 transition-all ${
                isWinner
                  ? "border-accent-300 bg-accent-50/60 dark:border-accent-500/40 dark:bg-accent-500/10"
                  : "border-steel-200 dark:border-white/10"
              }`}
              key={r.candidate_id}
            >
              <div className="mb-4 flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div className="flex items-center gap-4">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold ${
                      isWinner
                        ? "bg-accent-500 text-ink-900"
                        : "bg-steel-100 text-steel-500 dark:bg-white/10 dark:text-steel-300"
                    }`}
                  >
                    {r.is_undecided ? "–" : position}
                  </div>
                  <h4 className="flex items-center gap-2 text-lg font-bold text-ink-900 dark:text-white">
                    {r.name}
                    {isWinner && (
                      <span className="badge-up">
                        <span className="h-1.5 w-1.5 rounded-full bg-gold" />
                        Líder
                      </span>
                    )}
                  </h4>
                </div>

                <div className="flex flex-col items-end leading-tight">
                  <span className="text-2xl font-semibold tabular-nums text-ink-900 dark:text-white">
                    {r.votes.toLocaleString()}
                  </span>
                  <span className="text-xs font-bold tracking-wide text-steel-400">
                    {r.votes === 1 ? "voto" : "votos"}
                  </span>
                </div>
              </div>

              <div className="relative h-2 w-full overflow-hidden rounded-full bg-steel-100 dark:bg-white/10">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ease-out ${
                    isWinner
                      ? "bg-gradient-to-r from-brand-600 to-accent-500"
                      : "bg-brand-600/40 dark:bg-brand-400/40"
                  }`}
                  style={{ width: `${fill}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {ranking.length === 0 && (
        <div className="rounded-xl border border-dashed border-steel-300 py-12 text-center dark:border-white/15">
          <p className="text-xs font-bold tracking-wide text-steel-400">
            Sin participaciones registradas.
          </p>
        </div>
      )}
    </div>
  );
}
