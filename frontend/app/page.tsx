import Link from "next/link";
import { api, Election } from "@/lib/api";
import CategoryNav from "@/components/CategoryNav";

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

    // Filtro por categoría
    switch (category) {
      case "presidencial":
        return type.includes("presidencial") || title.includes("presidencial");
      case "regionales":
        return type.includes("regional") || title.includes("regional");
      case "lima":
        return title.includes("alcaldía de lima") || title.includes("lima");
      case "lima_distritos":
        return type.includes("distrital") && !title.includes("callao") && !title.includes("ventanilla") && !title.includes("perla") && !title.includes("punta") && !title.includes("bellavista") && !title.includes("carmen de la legua");
      case "callao":
        return title.includes("callao") || title.includes("ventanilla") || title.includes("perla") || title.includes("punta") || title.includes("bellavista") || title.includes("carmen de la legua");
      default:
        return true;
    }
  });

  return (
    <div className="mx-auto max-w-6xl px-6 py-14">
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

        <section className="grid gap-4">
          {filteredElections.length > 0 ? (
            filteredElections.map(e => (
              <Link
                href={`/election/${e.id}`}
                key={e.id}
                className="card-interactive group flex flex-col justify-between gap-6 p-6 md:flex-row md:items-center"
              >
                <div className="min-w-0">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium text-ink-400">{e.election_type}</span>
                    <span className={e.is_active ? "badge-live" : "badge-closed"}>
                      {e.is_active && <span className="h-1.5 w-1.5 rounded-full bg-accent-500" />}
                      {e.is_active ? "En vivo" : "Cerrado"}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold transition-colors group-hover:text-brand-600 dark:group-hover:text-brand-400">
                    {e.title}
                  </h3>
                </div>

                <div className="flex shrink-0 items-center gap-6">
                  <div className="text-right">
                    <p className="text-xs font-medium text-ink-400">Ámbito</p>
                    <p className="mt-0.5 text-sm font-semibold">{e.region_name || "Nacional"}</p>
                  </div>
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-ink-200 text-ink-500 transition-colors group-hover:border-brand-600 group-hover:bg-brand-600 group-hover:text-white dark:border-white/10 dark:text-ink-300">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                  </span>
                </div>
              </Link>
            ))
          ) : (
            <div className="card flex flex-col items-center gap-3 p-16 text-center">
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
