import { Results } from "@/lib/api";

export default function ResultBars({ results }: { results: Results }) {
  // La API devuelve ranking: null cuando la elección aún no tiene votos.
  const ranking = results?.ranking ?? [];
  const totalVotes = results?.total_votes ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-2xl font-bold text-ink-900">Conteo General</h3>
          <p className="text-ink-500">Basado en los votos escrutados hasta el momento.</p>
        </div>
        <div className="text-right">
          <div className="text-4xl font-semibold text-black">{totalVotes}</div>
          <div className="text-xs tracking-wide font-bold text-ink-400">Votos Totales</div>
        </div>
      </div>

      <div className="grid gap-4">
        {ranking.map((r, i) => {
          const pct = totalVotes === 0 ? 0 : Math.round((r.votes / totalVotes) * 100);
          const isWinner = i === 0 && r.votes > 0;
          
          return (
            <div 
              className={`border border-ink-100 p-6 transition-all ${isWinner ? 'border-black bg-ink-50' : ''}`} 
              key={r.candidate_id}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-4">
                  <div className={`flex h-10 w-10 items-center justify-center text-sm font-bold ${isWinner ? 'bg-black text-white' : 'bg-ink-100 text-ink-500'}`}>
                    {i + 1}
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-ink-900 flex items-center gap-2">
                      {r.name}
                      {isWinner && (
                        <span className="rounded-xl inline-flex items-center bg-black px-2 py-0.5 text-xs font-bold tracking-wide text-white">
                          Líder
                        </span>
                      )}
                    </h4>
                  </div>
                </div>
                <div className="flex items-end flex-col">
                  <span className="text-xl font-semibold text-ink-900">{pct}%</span>
                  <span className="text-xs font-bold tracking-wide text-ink-400">{r.votes.toLocaleString()} votos</span>
                </div>
              </div>
              
              <div className="relative h-1 w-full overflow-hidden bg-ink-100">
                <div 
                  className={`h-full transition-all duration-1000 ease-out ${isWinner ? 'bg-black' : 'bg-ink-300'}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
      
      {ranking.length === 0 && (
        <div className="rounded-xl text-center py-12 border border-dashed border-ink-200">
          <p className="text-ink-400 text-xs tracking-wide font-bold">Sin participaciones registradas.</p>
        </div>
      )}
    </div>
  );
}


