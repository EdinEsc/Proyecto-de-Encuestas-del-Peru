import Link from "next/link";
import { api, Election } from "@/lib/api";
import { matchesCategory } from "@/lib/categories";
import { electionTone, toneBar, toneText, toneButton, toneChip } from "@/lib/electionStyle";

export const dynamic = "force-dynamic";

export default async function Home({ searchParams }: { searchParams: Promise<{ category?: string, q?: string }> }) {
  const params = await searchParams;
  const query = (params.q || "").toLowerCase();
  // Al buscar sin categoría explícita se busca en TODOS los procesos: antes caía
  // en "presidencial" por defecto y cualquier búsqueda fuera de esa categoría
  // devolvía cero resultados.
  const category = params.category || (query ? "all" : "presidencial");
  
  const allElections = await api<Election[]>(`/elections`).catch(() => []) || [];

  // Filtros para la lista principal
  const filteredElections = allElections.filter(e => {
    const title = e.title.toLowerCase();
    const type = (e.election_type || "").toLowerCase();
    const region = (e.region_name || "").toLowerCase();

    // Filtro por búsqueda
    if (query && !title.includes(query) && !type.includes(query) && !region.includes(query)) {
      return false;
    }

    return matchesCategory(e, category);
  });

  return (
    <div className="mx-auto max-w-[1500px] px-6 py-14">
      <main>
        <div className="mb-8 flex items-baseline justify-between gap-4">
          <div>
            <p className="eyebrow">Procesos electorales</p>
            <h2 className="mt-1 text-2xl font-semibold">
              {query ? `Resultados para "${params.q}"` : "Elige un proceso para participar"}
            </h2>
          </div>
          <span className="shrink-0 text-sm text-ink-400">
            {filteredElections.length} {filteredElections.length === 1 ? "proceso" : "procesos"}
          </span>
        </div>

        <section className="grid gap-4 sm:grid-cols-2">
          {filteredElections.length > 0 ? (
            filteredElections.map(e => {
              const tone = electionTone(e.election_type);
              return (
                <Link
                  href={`/election/${e.id}`}
                  key={e.id}
                  className="card-interactive group relative flex h-full flex-col gap-6 overflow-hidden p-6 pl-7"
                >
                  {/* Franja de color según el tipo de proceso */}
                  <span
                    className={`absolute inset-y-0 left-0 w-1.5 transition-all duration-200 group-hover:w-2 ${toneBar[tone]}`}
                    aria-hidden="true"
                  />

                  <div className="min-w-0">
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      <span className={toneChip[tone]}>{e.election_type}</span>
                      <span className={e.is_active ? "badge-live" : "badge-closed"}>
                        {e.is_active && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent-500" />}
                        {e.is_active ? "En vivo" : "Cerrado"}
                      </span>
                    </div>
                    <h3 className={`text-xl font-semibold transition-colors ${toneText[tone]}`}>
                      {e.title}
                    </h3>
                  </div>

                  {/*
                    mt-auto ancla el pie abajo: en una fila las tarjetas se
                    estiran a la misma altura y los ámbitos quedan alineados
                    aunque un título ocupe dos líneas y el otro una.
                  */}
                  <div className="mt-auto flex items-end justify-between gap-4 border-t border-ink-100 pt-4 dark:border-white/10">
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-steel-400">Ámbito</p>
                      <p className="mt-0.5 truncate text-sm font-semibold">{e.region_name || "Nacional"}</p>
                    </div>
                    <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-steel-200 text-steel-500 transition-colors dark:border-white/10 dark:text-steel-300 ${toneButton[tone]}`}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                    </span>
                  </div>
                </Link>
              );
            })
          ) : (
            <div className="card flex flex-col items-center gap-3 p-16 text-center sm:col-span-2">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-ink-100 text-ink-400 dark:bg-white/5">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              </span>
              <p className="font-medium">
                {query
                  ? `Ningún proceso coincide con "${params.q}".`
                  : "No hay procesos en esta categoría."}
              </p>
              <p className="text-sm text-ink-400">
                {query ? "Revisa la escritura o mira todos los procesos disponibles." : "Consulta el resto de categorías."}
              </p>
              <Link href="/?category=all" className="btn-primary mt-2">
                Ver todos los procesos
              </Link>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
