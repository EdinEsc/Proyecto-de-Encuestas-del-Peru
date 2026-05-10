import Link from "next/link";
import { api, Election } from "@/lib/api";
import CategoryNav from "@/components/CategoryNav";

export const dynamic = "force-dynamic";

export default async function Home({ searchParams }: { searchParams: Promise<{ category?: string, q?: string }> }) {
  const params = await searchParams;
  const category = params.category || "presidencial";
  const query = (params.q || "").toLowerCase();
  
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
    <div className="max-w-6xl mx-auto px-6 py-20">
      <main>
        <section className="grid gap-1 px-1">
          {filteredElections.length > 0 ? (
            filteredElections.map(e => (
              <Link 
                href={`/election/${e.id}`} 
                key={e.id}
                className="group flex flex-col md:flex-row md:items-center justify-between py-10 border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors px-4"
              >
                <div>
                  <div className="flex items-center gap-4 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">{e.election_type}</span>
                    {e.is_active && <span className="px-1.5 py-0.5 bg-black dark:bg-emerald-600 text-white text-[7px] font-bold uppercase tracking-widest">Activo</span>}
                  </div>
                  <h3 className="text-2xl font-bold group-hover:translate-x-2 transition-transform duration-300 text-black dark:text-white">
                    {e.title}
                  </h3>
                </div>
                
                <div className="mt-6 md:mt-0 flex items-center gap-8">
                  <div className="text-right">
                    <p className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 tracking-widest mb-1">Ámbito</p>
                    <p className="text-sm font-bold text-black dark:text-white">{e.region_name || "Nacional"}</p>
                  </div>
                  <div className="h-12 w-12 border border-black dark:border-slate-600 text-black dark:text-white flex items-center justify-center group-hover:bg-black dark:group-hover:bg-emerald-600 group-hover:text-white group-hover:border-black dark:group-hover:border-emerald-600 transition-all">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="py-20 text-slate-500 dark:text-slate-400 text-sm italic">
              No se encontraron procesos activos en esta categoría.
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
