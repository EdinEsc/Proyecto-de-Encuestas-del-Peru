"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Election } from "@/lib/api";
import { useTheme } from "@/components/ThemeProvider";

type DropdownCategory = {
  id: string;
  label: string;
  hasDropdown: boolean;
  items?: Election[];
};

export default function Header({ elections }: { elections: Election[] }) {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [visible, setVisible] = useState(true);
  const [prevScrollPos, setPrevScrollPos] = useState(0);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollPos = window.pageYOffset;
      const isVisible = prevScrollPos > currentScrollPos || currentScrollPos < 10;

      setPrevScrollPos(currentScrollPos);
      setVisible(isVisible);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [prevScrollPos]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setSearch(searchParams.get("q") || "");
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/?q=${encodeURIComponent(search.trim())}`);
    } else {
      router.push("/");
    }
  };

  const regionales = elections.filter(e => (e.election_type || "").toLowerCase().includes("regional"));
  const limaDistritos = elections.filter(e => {
    const title = e.title.toLowerCase();
    const type = (e.election_type || "").toLowerCase();
    return type.includes("distrital") && 
      !title.includes("callao") && !title.includes("ventanilla") && 
      !title.includes("perla") && !title.includes("punta") && 
      !title.includes("bellavista") && !title.includes("carmen de la legua");
  });
  const callaoElections = elections.filter(e => {
    const title = e.title.toLowerCase();
    return title.includes("callao") || title.includes("ventanilla") || 
      title.includes("perla") || title.includes("punta") || 
      title.includes("bellavista") || title.includes("carmen de la legua");
  });

  const categories: DropdownCategory[] = [
    { id: "all", label: "Todos", hasDropdown: false },
    { id: "presidencial", label: "Presidencial", hasDropdown: false },
    { id: "regionales", label: "Regionales", hasDropdown: true, items: regionales },
    { id: "lima", label: "Alcaldía de Lima", hasDropdown: false },
    { id: "lima_distritos", label: "Distritos de Lima", hasDropdown: true, items: limaDistritos },
    { id: "callao", label: "Callao", hasDropdown: true, items: callaoElections },
  ];

  return (
    <header 
      className={`w-full bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 sticky top-0 z-[100] transition-all duration-500 ease-in-out ${
        visible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      {/* Hero Banner */}
      <div className="relative w-full overflow-hidden" style={{ minHeight: '220px' }}>
        <img 
          src="/banner.png" 
          alt="Encuestas Perú Banner" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80" />
        <div className="relative z-10 flex flex-col items-center text-center py-10 px-6">
          <Link href="/" className="h-20 w-20 bg-emerald-500 text-white flex items-center justify-center mb-5 text-3xl font-black hover:scale-110 transition-transform shadow-lg shadow-emerald-500/30 border-2 border-white/20">EP</Link>
          <h1 className="text-5xl md:text-6xl font-black tracking-tighter mb-2 uppercase text-white leading-none drop-shadow-lg">Encuestas Perú</h1>
          <p className="text-white/70 text-[11px] font-black uppercase tracking-[0.4em]">
            Portal Oficial de Participación Ciudadana
          </p>
        </div>
      </div>

      {/* Navigation Bar */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          <nav ref={dropdownRef} className="flex flex-wrap justify-center lg:justify-start gap-x-10 gap-y-6">
            {categories.map((c) => {
              if (!c.hasDropdown) {
                return (
                  <Link
                    key={c.id}
                    href={`/?category=${c.id}`}
                    className="text-[15px] font-black uppercase tracking-[0.2em] text-slate-800 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                  >
                    {c.label}
                  </Link>
                );
              }

              const isOpen = openDropdown === c.id;

              return (
                <div key={c.id} className="relative">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/?category=${c.id}`}
                      className="text-[15px] font-black uppercase tracking-[0.2em] text-slate-800 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                    >
                      {c.label}
                    </Link>
                    <button
                      onClick={() => setOpenDropdown(isOpen ? null : c.id)}
                      className="p-1 text-slate-300 dark:text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}><polyline points="6 9 12 15 18 9" /></svg>
                    </button>
                  </div>

                  {isOpen && c.items && c.items.length > 0 && (
                    <div className="absolute top-full left-0 mt-6 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-2xl py-6 z-[110] min-w-[320px] max-h-[450px] overflow-y-auto">
                      {c.items.map((election) => (
                        <Link
                          key={election.id}
                          href={`/election/${election.id}`}
                          onClick={() => setOpenDropdown(null)}
                          className="flex items-center justify-between px-8 py-4 text-[14px] font-black uppercase tracking-wider hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors group text-slate-800 dark:text-slate-200"
                        >
                          <span className="group-hover:text-emerald-600 dark:group-hover:text-emerald-400">{election.region_name || election.title}</span>
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="text-slate-100 dark:text-slate-600 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-all"><polyline points="9 18 15 12 9 6"/></svg>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          <div className="flex items-center gap-4 w-full lg:w-auto">
            <button
              onClick={toggleTheme}
              className="h-14 w-14 flex items-center justify-center bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 text-slate-400 hover:text-black dark:hover:text-emerald-400 hover:border-black dark:hover:border-emerald-500 transition-all rounded-none"
              aria-label={theme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
            >
              {theme === "dark" ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
              )}
            </button>

            <form onSubmit={handleSearch} className="relative flex-1 lg:w-96 group">
              <input 
                type="text" 
                placeholder="BUSCAR PROCESOS..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 px-8 py-4 text-[11px] font-black uppercase tracking-widest focus:border-black dark:focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-700 outline-none transition-all text-black dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />
              <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-black dark:group-hover:text-emerald-400 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              </button>
            </form>
          </div>
        </div>
      </div>
    </header>
  );
}
