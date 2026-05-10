"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function Sidebar({ onToggleMobile }: { onToggleMobile?: () => void }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [modulosOpen, setModulosOpen] = useState(true);
  const searchParams = useSearchParams();
  const currentModule = searchParams.get("module") || "dashboard";

  const mainItems = [
    { id: "dashboard", label: "Dashboard", href: "/?module=dashboard", icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg> },
    { id: "elections", label: "Elecciones", href: "/?module=elections", icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
    { id: "candidates", label: "Candidatos", href: "/?module=candidates", icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
    { id: "regions", label: "Regiones", href: "/?module=regions", icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 1 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg> },
    { id: "types", label: "Categorías", href: "/?module=types", icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg> },
  ];

  const moduloItems = [
    { id: "presidenciales", label: "Presidenciales", href: "/?module=presidenciales", icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg> },
    { id: "alcaldia_lima", label: "Alcaldía de Lima", href: "/?module=alcaldia_lima", icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="8" y1="10" x2="16" y2="10"/><line x1="8" y1="14" x2="16" y2="14"/></svg> },
    { id: "regionales", label: "Regionales", href: "/?module=regionales", icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg> },
    { id: "lima_distritos", label: "Distritos Lima", href: "/?module=lima_distritos", icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> },
    { id: "callao", label: "Callao", href: "/?module=callao", icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg> },
  ];

  const renderItem = (item: any) => {
    const isActive = currentModule === item.id;
    return (
      <Link
        key={item.id}
        href={item.href}
        onClick={onToggleMobile}
        className={`flex items-center gap-4 p-4 transition-all group ${
          isActive
            ? "bg-emerald-600 text-white"
            : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-black dark:hover:text-white"
        } ${isCollapsed ? "justify-center" : ""}`}
      >
        <span className={`shrink-0 ${isActive ? "text-white" : "text-slate-500 dark:text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400"}`}>
          {item.icon}
        </span>
        {!isCollapsed && (
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">{item.label}</span>
        )}
      </Link>
    );
  };

  return (
    <aside className={`${isCollapsed ? "w-24" : "w-72"} bg-white dark:bg-slate-800 border-r border-slate-100 dark:border-slate-700 h-screen sticky top-0 transition-all duration-300 flex flex-col z-50 shrink-0`}>
      <div className={`p-8 mb-4 flex items-center ${isCollapsed ? "justify-center" : "justify-between"}`}>
        {!isCollapsed && (
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-emerald-600 text-white flex items-center justify-center font-black text-xl">A</div>
            <div>
              <span className="text-xs font-black tracking-[0.3em] uppercase block dark:text-white">Admin</span>
              <span className="text-[9px] font-bold tracking-widest uppercase text-emerald-600 dark:text-emerald-400 block">Digital</span>
            </div>
          </div>
        )}
        {isCollapsed && <div className="h-10 w-10 bg-emerald-600 text-white flex items-center justify-center font-black text-xl">A</div>}

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`absolute ${isCollapsed ? "left-1/2 -translate-x-1/2 top-[100px]" : "right-8 top-10"} p-2 text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors hidden lg:block`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {isCollapsed ? <path d="m9 18 6-6-6-6"/> : <path d="m15 18-6-6 6-6"/>}
          </svg>
        </button>
      </div>

      <nav className="flex-grow px-4 space-y-1 mt-4 overflow-y-auto">
        {mainItems.map(renderItem)}

        {/* Módulos section */}
        <div className="py-4">
          <div className="border-t border-slate-100 dark:border-slate-700"></div>
          {!isCollapsed && (
            <button
              onClick={() => setModulosOpen(!modulosOpen)}
              className="flex items-center justify-between w-full mt-4 px-4 group"
            >
              <span className="text-[8px] font-black uppercase tracking-[0.4em] text-slate-300 dark:text-slate-500">Módulos</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`text-slate-300 dark:text-slate-500 transition-transform ${modulosOpen ? "rotate-180" : ""}`}>
                <path d="m6 9 6 6 6-6"/>
              </svg>
            </button>
          )}
        </div>

        {modulosOpen && moduloItems.map(renderItem)}
      </nav>

      <div className="p-8 border-t border-slate-100 dark:border-slate-700 mt-auto">
        <button
          onClick={() => { localStorage.removeItem("admin_token"); window.location.reload(); }}
          className={`flex items-center gap-4 w-full text-slate-500 hover:text-red-500 dark:hover:text-red-400 transition-colors ${isCollapsed ? "justify-center" : ""}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          {!isCollapsed && (
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Cerrar Sesión</span>
          )}
        </button>
      </div>
    </aside>
  );
}
