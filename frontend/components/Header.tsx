"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Election } from "@/lib/api";
import { matchesCategory } from "@/lib/categories";
import { useTheme } from "@/components/ThemeProvider";
import HeaderHero from "@/components/HeaderHero";

type DropdownCategory = {
  id: string;
  label: string;
  hasDropdown: boolean;
  items?: Election[];
};

export default function Header({ elections }: { elections: Election[] }) {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);
  // En móvil la barra de categorías se desliza, pero sin barra de scroll no hay
  // forma de saberlo: estos dos flags encienden la flecha del lado que aún tiene
  // contenido oculto.
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { theme, toggleTheme } = useTheme();
  // Mismo criterio que la home: buscando sin categoría explícita, el activo es "Todos".
  const activeCategory = searchParams.get("category") || (searchParams.get("q") ? "all" : "presidencial");

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

  useEffect(() => {
    const el = navRef.current;
    if (!el) return;

    // 4px de holgura: el scroll fraccionario nunca llega al extremo exacto.
    const update = () => {
      setCanScrollLeft(el.scrollLeft > 4);
      setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
    };

    update();
    el.addEventListener("scroll", update, { passive: true });
    // El ancho útil cambia al girar el móvil y al terminar de cargar la fuente.
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => {
      el.removeEventListener("scroll", update);
      observer.disconnect();
    };
  }, [elections]);

  const scrollNav = (direction: 1 | -1) => {
    navRef.current?.scrollBy({ left: direction * 180, behavior: "smooth" });
  };

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

  const regionales = elections.filter(e => matchesCategory(e, "regionales"));
  const limaDistritos = elections.filter(e => matchesCategory(e, "lima_distritos"));
  const callaoElections = elections.filter(e => matchesCategory(e, "callao"));

  const categories: DropdownCategory[] = [
    { id: "all", label: "Todos", hasDropdown: false },
    { id: "presidencial", label: "Presidencial", hasDropdown: false },
    { id: "regionales", label: "Regionales", hasDropdown: true, items: regionales },
    { id: "lima", label: "Alcaldía de Lima", hasDropdown: false },
    { id: "lima_distritos", label: "Distritos de Lima", hasDropdown: true, items: limaDistritos },
    { id: "callao", label: "Callao", hasDropdown: true, items: callaoElections },
  ];

  // Pastillas de navegación: el estado activo se lee por el relleno, no por el
  // color del texto, que a esta escala se perdía entre las demás categorías.
  const pillBase = "flex items-center justify-center rounded-xl text-[15px] font-semibold transition-colors";
  const pillState = (id: string) =>
    activeCategory === id
      ? "bg-navy text-white shadow-card dark:bg-electric"
      : "border border-mist text-carbon hover:border-navy/30 hover:bg-mist hover:text-navy dark:border-white/10 dark:text-ink-300 dark:hover:bg-white/10 dark:hover:text-white";

  /*
    Las filas del desplegable se pintan en dos sitios: anclado bajo la pastilla
    en escritorio, y como bloque bajo la barra en móvil (allí la barra tiene
    scroll horizontal, y un contenedor con overflow recortaría el panel).
  */
  const dropdownItems = (c: DropdownCategory) => (
    <>
      {/* El filtro por categoría se conserva desde aquí */}
      <Link
        href={urlFor(c.id, search)}
        onClick={() => setOpenDropdown(null)}
        className="flex items-center justify-between gap-6 border-b border-mist py-3 pl-4 pr-6 text-[15px] font-semibold text-electric transition-colors hover:bg-mist dark:border-white/10 dark:hover:bg-white/10"
      >
        <span>Ver todos</span>
        <span className="text-xs font-medium text-carbon/50 dark:text-white/50">{c.items!.length}</span>
      </Link>
      {/*
        Los nombres largos envuelven en dos líneas: el panel ya no puede crecer
        a lo ancho, así que recortarlos sería perder el nombre.
      */}
      {c.items!.map((election) => (
        <Link
          key={election.id}
          href={`/election/${election.id}`}
          onClick={() => setOpenDropdown(null)}
          className="block py-3 pl-4 pr-6 text-[15px] leading-snug text-carbon transition-colors hover:bg-mist hover:text-navy dark:text-ink-200 dark:hover:bg-white/10 dark:hover:text-white"
        >
          {election.region_name || election.title}
        </Link>
      ))}
    </>
  );

  const openCategory = categories.find((c) => c.id === openDropdown);

  return (
    <header className="relative z-40 w-full border-b border-ink-100 bg-white dark:border-white/10 dark:bg-ink-950">
      {/* Hero */}
      <HeaderHero />

      {/* Navegación */}
      <div className="mx-auto max-w-[1500px] px-6 py-5">
        {/*
          La búsqueda va en su propia fila: compartiendo línea con las categorías,
          las seis pastillas quedaban apretadas en dos filas de tres.
        */}
        <div className="mb-5 flex items-center gap-3 lg:justify-end">
          <form onSubmit={handleSearch} className="relative flex-1 lg:w-80 lg:flex-none">
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

        {/*
          Móvil: una sola línea con scroll horizontal. Escritorio: seis columnas
          iguales a todo el ancho, que es lo que permite que cada panel calce
          exacto bajo su pastilla.
        */}
        <div ref={dropdownRef} className="w-full">
          <div className="relative lg:static">
          <nav ref={navRef} className="scrollbar-none -mx-1 flex flex-nowrap items-center gap-3 overflow-x-auto px-1 pb-1 lg:mx-0 lg:grid lg:grid-cols-6 lg:gap-4 lg:overflow-x-visible lg:px-0 lg:pb-0">
            {categories.map((c) => {
              if (!c.hasDropdown) {
                return (
                  <Link
                    key={c.id}
                    href={urlFor(c.id, search)}
                    className={`${pillBase} ${pillState(c.id)} shrink-0 whitespace-nowrap px-6 py-3.5 lg:w-full`}
                  >
                    {c.label}
                  </Link>
                );
              }

              const isOpen = openDropdown === c.id;

              return (
                <div key={c.id} className="relative shrink-0 lg:w-full">
                  {/*
                    Toda la pastilla abre el desplegable. Abierto, pierde el
                    redondeo inferior para que la lista se lea como una sola
                    pieza, igual que un <select>.
                  */}
                  <button
                    onClick={() => setOpenDropdown(isOpen ? null : c.id)}
                    aria-expanded={isOpen}
                    className={`${pillBase} ${pillState(c.id)} gap-2 whitespace-nowrap px-6 py-3.5 lg:w-full lg:justify-between ${isOpen ? "lg:rounded-b-none" : ""}`}
                  >
                    {c.label}
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={`shrink-0 opacity-60 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}><polyline points="6 9 12 15 18 9" /></svg>
                  </button>

                  {isOpen && c.items && c.items.length > 0 && (
                    <div className="scroll-slim absolute left-0 top-full z-[110] hidden max-h-[420px] w-full overflow-y-auto overflow-x-hidden rounded-b-lg border border-navy/15 bg-white shadow-lg dark:border-white/15 dark:bg-navy lg:block">
                      {dropdownItems(c)}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/*
            Señales de deslizamiento. El degradado corta la pastilla a mitad
            para que se lea "hay más" aunque no se mire la flecha; la flecha
            además desplaza al tocarla. Solo en móvil: en escritorio caben las
            seis columnas.
          */}
          {canScrollLeft && (
            <>
              <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-14 bg-gradient-to-r from-white via-white/85 to-transparent dark:from-ink-950 dark:via-ink-950/85 lg:hidden" />
              <button
                type="button"
                onClick={() => scrollNav(-1)}
                aria-label="Ver categorías anteriores"
                className="absolute left-0 top-1/2 z-20 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-mist bg-white text-navy shadow-card transition-colors hover:bg-mist dark:border-white/15 dark:bg-navy dark:text-white dark:hover:bg-white/10 lg:hidden"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
              </button>
            </>
          )}

          {canScrollRight && (
            <>
              <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-14 bg-gradient-to-l from-white via-white/85 to-transparent dark:from-ink-950 dark:via-ink-950/85 lg:hidden" />
              <button
                type="button"
                onClick={() => scrollNav(1)}
                aria-label="Ver más categorías"
                className="absolute right-0 top-1/2 z-20 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-mist bg-white text-navy shadow-card transition-colors hover:bg-mist dark:border-white/15 dark:bg-navy dark:text-white dark:hover:bg-white/10 lg:hidden"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
              </button>
            </>
          )}
          </div>

          {/*
            Panel en móvil: va fuera del carrusel porque overflow-x recorta
            cualquier hijo posicionado en absoluto.
          */}
          {openCategory?.items && openCategory.items.length > 0 && (
            <div className="scroll-slim mt-2 max-h-[320px] overflow-y-auto rounded-lg border border-navy/15 bg-white shadow-lg dark:border-white/15 dark:bg-navy lg:hidden">
              {dropdownItems(openCategory)}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
