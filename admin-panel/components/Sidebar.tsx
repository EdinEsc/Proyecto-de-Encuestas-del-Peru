"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { LogoMark } from "@/components/Logo";

type NavItem = { id: string; label: string; icon: ReactNode };

const icon = (path: ReactNode) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    {path}
  </svg>
);

const GESTION: NavItem[] = [
  { id: "dashboard", label: "Procesos", icon: icon(<><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></>) },
  { id: "elections", label: "Nueva elección", icon: icon(<><path d="M12 5v14" /><path d="M5 12h14" /></>) },
  { id: "candidates", label: "Nuevo candidato", icon: icon(<><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /></>) },
];

const CATALOGO: NavItem[] = [
  { id: "regions", label: "Ámbitos", icon: icon(<><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 1 1 18 0z" /><circle cx="12" cy="10" r="3" /></>) },
  { id: "types", label: "Categorías", icon: icon(<><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></>) },
];

const MODULOS: NavItem[] = [
  { id: "presidenciales", label: "Presidenciales", icon: icon(<><path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" /></>) },
  { id: "alcaldia_lima", label: "Alcaldía de Lima", icon: icon(<><rect x="4" y="2" width="16" height="20" rx="2" /><line x1="8" y1="6" x2="16" y2="6" /><line x1="8" y1="10" x2="16" y2="10" /><line x1="8" y1="14" x2="16" y2="14" /></>) },
  { id: "regionales", label: "Regionales", icon: icon(<><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></>) },
  { id: "lima_distritos", label: "Distritos de Lima", icon: icon(<><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></>) },
  { id: "callao", label: "Callao", icon: icon(<polygon points="3 11 22 2 13 21 11 13 3 11" />) },
];

export default function Sidebar({ onToggleMobile }: { onToggleMobile?: () => void }) {
  const searchParams = useSearchParams();
  const currentModule = searchParams.get("module") || "dashboard";

  const renderItem = (item: NavItem) => {
    const isActive = currentModule === item.id;
    return (
      <Link
        key={item.id}
        href={`/?module=${item.id}`}
        onClick={onToggleMobile}
        aria-current={isActive ? "page" : undefined}
        className={isActive ? "nav-item-active" : "nav-item-idle"}
      >
        <span className={`shrink-0 ${isActive ? "text-brand-600 dark:text-brand-300" : "text-ink-400"}`}>
          {item.icon}
        </span>
        {item.label}
      </Link>
    );
  };

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col border-r border-ink-100 bg-white dark:border-white/10 dark:bg-ink-900">
      <div className="flex items-center gap-2.5 border-b border-ink-100 px-5 py-4 dark:border-white/10">
        <LogoMark className="h-8 w-8 shrink-0" />
        <div className="leading-tight">
          <p className="text-sm font-semibold dark:text-white">Precisium</p>
          <p className="text-[12px] text-ink-400">Administración</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 pb-4">
        <p className="nav-section">Gestión</p>
        <div className="space-y-0.5">{GESTION.map(renderItem)}</div>

        <p className="nav-section">Catálogo</p>
        <div className="space-y-0.5">{CATALOGO.map(renderItem)}</div>

        <p className="nav-section">Módulos por elección</p>
        <div className="space-y-0.5">{MODULOS.map(renderItem)}</div>
      </nav>

      <div className="border-t border-ink-100 p-3 dark:border-white/10">
        <button
          onClick={() => { localStorage.removeItem("admin_token"); window.location.reload(); }}
          className="nav-item-idle w-full hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:text-red-400"
        >
          <span className="shrink-0 text-ink-400">
            {icon(<><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></>)}
          </span>
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
