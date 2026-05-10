import { Results } from "@/lib/api";

export default function ResultBars({ results }: { results: Results }) {
  const maxVotes = Math.max(...results.ranking.map(r => r.votes), 1);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-2xl font-bold text-slate-900">Conteo General</h3>
          <p className="text-slate-500">Basado en los votos escrutados hasta el momento.</p>
        </div>
        <div className="text-right">
          <div className="text-4xl font-black text-black">{results.total_votes}</div>
          <div className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Votos Totales</div>
        </div>
      </div>

      <div className="grid gap-4">
        {results.ranking.map((r, i) => {
          const pct = results.total_votes === 0 ? 0 : Math.round((r.votes / results.total_votes) * 100);
          const isWinner = i === 0 && r.votes > 0;
          
          return (
            <div 
              className={`border border-slate-100 p-6 transition-all ${isWinner ? 'border-black bg-slate-50' : ''}`} 
              key={r.candidate_id}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-4">
                  <div className={`flex h-10 w-10 items-center justify-center text-sm font-bold ${isWinner ? 'bg-black text-white' : 'bg-slate-100 text-slate-500'}`}>
                    {i + 1}
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      {r.name}
                      {isWinner && (
                        <span className="inline-flex items-center bg-black px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-white">
                          Líder
                        </span>
                      )}
                    </h4>
                  </div>
                </div>
                <div className="flex items-end flex-col">
                  <span className="text-xl font-black text-slate-900">{pct}%</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{r.votes.toLocaleString()} votos</span>
                </div>
              </div>
              
              <div className="relative h-1 w-full overflow-hidden bg-slate-100">
                <div 
                  className={`h-full transition-all duration-1000 ease-out ${isWinner ? 'bg-black' : 'bg-slate-300'}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
      
      {results.ranking.length === 0 && (
        <div className="text-center py-12 border border-dashed border-slate-200">
          <p className="text-slate-400 text-xs uppercase tracking-widest font-bold">Sin participaciones registradas.</p>
        </div>
      )}
    </div>
  );
}


