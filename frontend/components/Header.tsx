"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Election } from "@/lib/api";
import { useTheme } from "@/components/ThemeProvider";
import Logo from "@/components/Logo";

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
  // Mismo criterio que la home: buscando sin categoría explícita, el activo es "Todos".
  const activeCategory = searchParams.get("category") || (searchParams.get("q") ? "all" : "presidencial");

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

  // La categoría y la búsqueda deben convivir en la URL: si se pierde una, la
  // otra deja de tener sentido (buscar volvía a "presidencial" y no encontraba nada).
  const urlFor = (categoryId: string, q: string) => {
    const params = new URLSearchParams();
    params.set("category", categoryId);
    if (q.trim()) params.set("q", q.trim());
    return `/?${params.toString()}`;
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Al buscar desde una categoría concreta se respeta; si no, se busca en todos.
    const target = searchParams.get("category") || "all";
    router.push(urlFor(target, search));
  };

  const clearSearch = () => {
    setSearch("");
    router.push(urlFor(searchParams.get("category") || "all", ""));
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

  const linkClass = (id: string) =>
    `text-[15px] font-medium transition-colors ${
      activeCategory === id
        ? "text-brand-600 dark:text-brand-400"
        : "text-ink-600 hover:text-ink-900 dark:text-ink-300 dark:hover:text-white"
    }`;

  return (
    <header
      className={`sticky top-0 z-[100] w-full border-b border-ink-100 bg-white/90 backdrop-blur-md transition-transform duration-500 ease-in-out dark:border-white/10 dark:bg-ink-950/90 ${
        visible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      {/* Hero */}
      <div className="relative overflow-hidden">
        <img
          src="/banner.png"
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-ink-950/95 via-ink-900/85 to-brand-800/80" />
        <div className="relative z-10 mx-auto flex max-w-7xl flex-col items-center px-6 py-12 text-center">
          <Link href="/" className="transition-opacity hover:opacity-90">
            <Logo onDark />
          </Link>
          <h1 className="mt-8 text-4xl font-semibold tracking-tight text-white md:text-5xl">
            Encuestas del Perú
          </h1>
          <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-white/70">
            Participación ciudadana medida con rigor. Consulta procesos electorales,
            emite tu voto y sigue los resultados en tiempo real.
          </p>
        </div>
      </div>

      {/* Navegación */}
      <div className="mx-auto max-w-7xl px-6 py-4">
        <div className="flex flex-col items-center justify-between gap-4 lg:flex-row">
          <nav ref={dropdownRef} className="flex flex-wrap justify-center gap-x-7 gap-y-3 lg:justify-start">
            {categories.map((c) => {
              if (!c.hasDropdown) {
                return (
                  <Link key={c.id} href={urlFor(c.id, search)} className={linkClass(c.id)}>
                    {c.label}
                  </Link>
                );
              }

              const isOpen = openDropdown === c.id;

              return (
                <div key={c.id} className="relative">
                  <div className="flex items-center gap-1">
                    <Link href={urlFor(c.id, search)} className={linkClass(c.id)}>
                      {c.label}
                    </Link>
                    <button
                      onClick={() => setOpenDropdown(isOpen ? null : c.id)}
                      aria-label={`Ver ${c.label}`}
                      aria-expanded={isOpen}
                      className="rounded-md p-1 text-ink-400 transition-colors hover:text-brand-600 dark:hover:text-brand-400"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}><polyline points="6 9 12 15 18 9" /></svg>
                    </button>
                  </div>

                  {isOpen && c.items && c.items.length > 0 && (
                    <div className="absolute left-0 top-full z-[110] mt-3 max-h-[420px] min-w-[300px] overflow-y-auto rounded-2xl border border-ink-100 bg-white p-2 shadow-card-hover dark:border-white/10 dark:bg-ink-900">
                      {c.items.map((election) => (
                        <Link
                          key={election.id}
                          href={`/election/${election.id}`}
                          onClick={() => setOpenDropdown(null)}
                          className="group flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium text-ink-700 transition-colors hover:bg-brand-50 hover:text-brand-700 dark:text-ink-200 dark:hover:bg-white/5 dark:hover:text-white"
                        >
                          <span>{election.region_name || election.title}</span>
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-ink-300 transition-transform group-hover:translate-x-0.5 group-hover:text-brand-600"><polyline points="9 18 15 12 9 6"/></svg>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          <div className="flex w-full items-center gap-3 lg:w-auto">
            <form onSubmit={handleSearch} className="relative flex-1 lg:w-80">
              <input
                type="search"
                placeholder="Buscar procesos..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input py-2.5 pr-20"
              />
              {search && (
                <button
                  type="button"
                  onClick={clearSearch}
                  aria-label="Limpiar búsqueda"
                  className="absolute right-10 top-1/2 -translate-y-1/2 text-ink-400 transition-colors hover:text-ink-700 dark:hover:text-white"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              )}
              <button
                type="submit"
                aria-label="Buscar"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 transition-colors hover:text-brand-600"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              </button>
            </form>

            <button
              onClick={toggleTheme}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-ink-200 text-ink-500 transition-colors hover:border-brand-600 hover:text-brand-600 dark:border-white/10 dark:text-ink-300 dark:hover:border-brand-400 dark:hover:text-brand-400"
              aria-label={theme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
            >
              {theme === "dark" ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
