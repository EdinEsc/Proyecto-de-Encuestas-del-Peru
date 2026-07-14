"use client";

import { useEffect, useState, Suspense, useMemo, Fragment } from "react";
import { useSearchParams } from "next/navigation";
import { api, authHeaders, uploadImage, getImageUrl, Election, Candidate } from "@/lib/api";
import Sidebar from "@/components/Sidebar";
import { LogoMark } from "@/components/Logo";
import ToastContainer, { ToastMessage, ToastType } from "@/components/Toast";
import Modal from "@/components/Modal";

/** URL pública del frontend, para armar el link de votación de cada proceso. */
function frontendUrl(): string {
  if (process.env.NEXT_PUBLIC_FRONTEND_URL) return process.env.NEXT_PUBLIC_FRONTEND_URL;
  if (typeof window === "undefined") return "";
  return window.location.origin
    .replace(":3001", ":3000")
    .replace("encuestaadmin", "encuestasperu");
}

/**
 * El endpoint público (/elections) solo devuelve procesos activos y con fecha de
 * cierre futura. Replicamos esa regla para avisar en el panel cuándo un proceso
 * NO se está viendo en el portal, que antes no daba ninguna pista.
 */
function portalVisibility(e: any): { visible: boolean; reason: string } {
  if (!e.is_active) return { visible: false, reason: "El proceso está cerrado; no aparece en el portal." };
  if (!e.end_date || new Date(e.end_date) <= new Date()) {
    return { visible: false, reason: "La fecha de cierre ya pasó; no aparece en el portal. Edítala para reactivarlo." };
  }
  return { visible: true, reason: "Publicado y abierto a votación en el portal." };
}

function PortalBadge({ election }: { election: any }) {
  const { visible, reason } = portalVisibility(election);
  return (
    <span className={visible ? "badge-active" : "badge-closed"} title={reason}>
      {visible && <span className="h-1.5 w-1.5 rounded-full bg-accent-500" />}
      {visible ? "Visible" : "Oculto"}
    </span>
  );
}

/** Paginación simple para las tablas del panel. */
function usePagination<T>(items: T[], perPage = 10) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(items.length / perPage));
  const current = Math.min(page, totalPages);

  useEffect(() => { setPage(1); }, [items.length]);

  return {
    pageItems: items.slice((current - 1) * perPage, current * perPage),
    page: current,
    totalPages,
    setPage,
    from: items.length === 0 ? 0 : (current - 1) * perPage + 1,
    to: Math.min(current * perPage, items.length),
    total: items.length,
  };
}

function Pagination({ page, totalPages, setPage, from, to, total }: {
  page: number; totalPages: number; setPage: (p: number) => void;
  from: number; to: number; total: number;
}) {
  if (total === 0) return null;
  return (
    <div className="flex items-center justify-between border-t border-ink-100 px-6 py-3 dark:border-white/10">
      <p className="text-[13px] text-ink-500 dark:text-ink-400">
        Mostrando <span className="tabular-nums">{from}–{to}</span> de <span className="tabular-nums">{total}</span>
      </p>
      <div className="flex items-center gap-2">
        <button className="btn-secondary btn-sm" onClick={() => setPage(page - 1)} disabled={page <= 1}>Anterior</button>
        <span className="text-[13px] tabular-nums text-ink-500 dark:text-ink-400">{page} / {totalPages}</span>
        <button className="btn-secondary btn-sm" onClick={() => setPage(page + 1)} disabled={page >= totalPages}>Siguiente</button>
      </div>
    </div>
  );
}

const MODULE_TITLES: Record<string, { title: string; subtitle: string }> = {
  dashboard: { title: "Procesos electorales", subtitle: "Consulta, edita y publica los procesos de la plataforma." },
  elections: { title: "Nueva elección", subtitle: "Registra un proceso electoral y publícalo en el portal." },
  candidates: { title: "Nuevo candidato", subtitle: "Inscribe un candidato y vincúlalo a un proceso." },
  regions: { title: "Ámbitos", subtitle: "Regiones, provincias y distritos disponibles." },
  types: { title: "Categorías", subtitle: "Tipos de elección que puedes asignar a un proceso." },
  presidenciales: { title: "Presidenciales", subtitle: "Procesos de alcance nacional." },
  alcaldia_lima: { title: "Alcaldía de Lima", subtitle: "Procesos de Lima Metropolitana." },
  regionales: { title: "Regionales", subtitle: "Procesos de gobierno regional." },
  lima_distritos: { title: "Distritos de Lima", subtitle: "Procesos distritales de Lima." },
  callao: { title: "Callao", subtitle: "Procesos de la Provincia Constitucional del Callao." },
};

export default function AdminPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center text-sm text-ink-400">Cargando…</div>}>
      <AdminContent />
    </Suspense>
  );
}

function AdminContent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");
  const [loggedEmail, setLoggedEmail] = useState("");
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const searchParams = useSearchParams();
  const module = searchParams.get("module") || "dashboard";

  const addToast = (text: string, type: ToastType = "success") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, text, type }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  useEffect(() => {
    const savedToken = localStorage.getItem("admin_token");
    if (savedToken) {
      setToken(savedToken);
      try {
        const payload = JSON.parse(atob(savedToken.split('.')[1]));
        setLoggedEmail(payload.email || "admin");
      } catch { setLoggedEmail("admin"); }
    }
    const savedTheme = localStorage.getItem("admin_theme");
    const isDark = savedTheme === "dark" || (!savedTheme && window.matchMedia("(prefers-color-scheme: dark)").matches);
    setDarkMode(isDark);
    if (isDark) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, []);

  const toggleTheme = () => {
    const newDark = !darkMode;
    setDarkMode(newDark);
    localStorage.setItem("admin_theme", newDark ? "dark" : "light");
    if (newDark) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  };

  async function login() {
    setLoading(true);
    try {
      const r = await api<{ token: string }>("/admin/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      localStorage.setItem("admin_token", r.token);
      setToken(r.token);
      try {
        const payload = JSON.parse(atob(r.token.split('.')[1]));
        setLoggedEmail(payload.email || email);
      } catch { setLoggedEmail(email); }
      addToast("Sesión iniciada", "success");
    } catch (e: any) {
      // Distinguir un rechazo del servidor de un fallo de red/CORS: el mensaje
      // genérico "credenciales inválidas" ocultaba caídas del backend.
      const isNetworkError = e instanceof TypeError;
      addToast(
        isNetworkError
          ? "No se pudo contactar al servidor. Verifica que el backend esté activo."
          : e.message || "Credenciales inválidas",
        "error"
      );
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const [refreshTrigger, setRefreshTrigger] = useState(0);

  async function post(path: string, data: any) {
    setLoading(true);
    try {
      await api(path, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(data),
      });
      addToast("Guardado correctamente", "success");
      setRefreshTrigger(prev => prev + 1);
    } catch (e: any) {
      addToast(e.message, "error");
    } finally {
      setLoading(false);
    }
  }

  const ThemeButton = () => (
    <button
      onClick={toggleTheme}
      className="btn-ghost h-9 w-9 p-0"
      title={darkMode ? "Modo claro" : "Modo oscuro"}
      aria-label={darkMode ? "Modo claro" : "Modo oscuro"}
    >
      {darkMode ? (
        <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>
      )}
    </button>
  );

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <ToastContainer toasts={toasts} onRemove={removeToast} />
        <div className="fixed right-6 top-6"><ThemeButton /></div>

        <div className="w-full max-w-sm">
          <div className="mb-8 flex flex-col items-center text-center">
            <LogoMark className="h-12 w-12" />
            <h1 className="mt-5 text-xl">Panel de administración</h1>
            <p className="mt-1.5 text-sm text-ink-500 dark:text-ink-300">
              Ingresa con tu cuenta de administrador.
            </p>
          </div>

          <form className="panel" onSubmit={e => { e.preventDefault(); login(); }}>
            <div className="space-y-4 p-6">
              <div className="field">
                <label htmlFor="admin-email" className="label">Correo electrónico</label>
                <input
                  id="admin-email"
                  type="email"
                  autoComplete="username"
                  className="input"
                  placeholder="admin@votaciones.local"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
              <div className="field">
                <label htmlFor="admin-password" className="label">Contraseña</label>
                <input
                  id="admin-password"
                  type="password"
                  autoComplete="current-password"
                  className="input"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
              </div>
              <button type="submit" className="btn-primary w-full" disabled={loading}>
                {loading ? "Verificando…" : "Ingresar"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  const header = MODULE_TITLES[module] || { title: "Panel", subtitle: "" };

  const deleteElection = (id: string) =>
    api(`/admin/election/${id}`, { method: "DELETE", headers: authHeaders() })
      .then(() => { addToast("Proceso eliminado", "success"); setRefreshTrigger(p => p + 1); })
      .catch((e: any) => addToast(e.message, "error"));

  const closeElection = (id: string) =>
    api(`/admin/election/${id}/close`, { method: "PUT", headers: authHeaders() })
      .then(() => { addToast("Proceso finalizado", "info"); setRefreshTrigger(p => p + 1); })
      .catch((e: any) => addToast(e.message, "error"));

  return (
    <div className="flex min-h-screen">
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* Sidebar: fijo en escritorio, deslizable en móvil */}
      {sidebarOpen && <div className="fixed inset-0 z-40 bg-ink-950/40 lg:hidden" onClick={() => setSidebarOpen(false)} />}
      <div className={`fixed z-50 transition-transform duration-200 lg:sticky lg:top-0 lg:z-auto lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <Sidebar onToggleMobile={() => setSidebarOpen(false)} />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center gap-4 border-b border-ink-100 bg-white/95 px-6 py-3 backdrop-blur dark:border-white/10 dark:bg-ink-900/95">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="btn-ghost h-9 w-9 p-0 lg:hidden"
            aria-label="Abrir menú"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
          </button>

          <div className="min-w-0 flex-1">
            <h1 className="truncate text-[15px] font-semibold">{header.title}</h1>
          </div>

          <div className="flex items-center gap-2">
            <ThemeButton />
            <div className="flex items-center gap-2 border-l border-ink-100 pl-3 dark:border-white/10">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-50 text-[13px] font-semibold uppercase text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">
                {loggedEmail ? loggedEmail[0] : "A"}
              </span>
              <span className="hidden text-sm text-ink-600 dark:text-ink-300 sm:inline">{loggedEmail}</span>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 lg:p-8">
          <div className="mx-auto w-full max-w-[1400px]">
            <div className="mb-6">
              <h2 className="text-2xl">{header.title}</h2>
              {header.subtitle && <p className="mt-1 text-sm text-ink-500 dark:text-ink-300">{header.subtitle}</p>}
            </div>

            {module === 'dashboard' && (
              <ElectionManagement
                refreshKey={refreshTrigger}
                onClose={closeElection}
                onDeleteElection={deleteElection}
                onDeleteCandidate={(id) => api(`/admin/candidate/${id}`, { method: "DELETE", headers: authHeaders() })
                  .then(() => { addToast("Candidato removido", "success"); setRefreshTrigger(p => p + 1); })
                  .catch((e: any) => addToast(e.message, "error"))}
                notify={addToast}
              />
            )}
            {module === 'types' && (
              <CreateElectionType
                onSave={(name) => post("/admin/election-type", { name })}
                onDelete={(id) => api(`/admin/election-type/${id}`, { method: "DELETE", headers: authHeaders() })
                  .then(() => { addToast("Categoría eliminada", "success"); setRefreshTrigger(p => p + 1); })
                  .catch((e: any) => addToast(e.message, "error"))}
                refreshKey={refreshTrigger}
              />
            )}
            {module === 'regions' && (
              <CreateRegion
                onSave={(data) => post("/admin/region", data)}
                onDelete={(id) => api(`/admin/region/${id}`, { method: "DELETE", headers: authHeaders() })
                  .then(() => { addToast("Ámbito eliminado", "success"); setRefreshTrigger(p => p + 1); })
                  .catch((e: any) => addToast(e.message, "error"))}
                refreshKey={refreshTrigger}
              />
            )}
            {module === 'elections' && <CreateElection onSave={(data) => post("/admin/election", data)} />}
            {module === 'candidates' && <CreateCandidate onSave={(data) => post("/admin/candidate", data)} />}

            {module === 'presidenciales' && (
              <CategoryElectionManager
                categoryLabel="Presidenciales"
                filterFn={(e: any) => (e.election_type || '').toLowerCase().includes('presidencial') || e.title.toLowerCase().includes('presidencial')}
                refreshKey={refreshTrigger}
                onSave={(data: any) => post("/admin/election", data)}
                onDeleteElection={deleteElection}
                onClose={closeElection}
                notify={addToast}
              />
            )}
            {module === 'alcaldia_lima' && (
              <CategoryElectionManager
                categoryLabel="Alcaldía de Lima"
                filterFn={(e: any) => {
                  const title = e.title.toLowerCase();
                  return title.includes('alcaldía de lima') || title.includes('alcaldia de lima') || title.includes('lima metropolitana');
                }}
                refreshKey={refreshTrigger}
                onSave={(data: any) => post("/admin/election", data)}
                onDeleteElection={deleteElection}
                onClose={closeElection}
                notify={addToast}
              />
            )}
            {module === 'regionales' && (
              <CategoryElectionManager
                categoryLabel="Regionales"
                filterFn={(e: any) => (e.election_type || '').toLowerCase().includes('regional')}
                refreshKey={refreshTrigger}
                onSave={(data: any) => post("/admin/election", data)}
                onDeleteElection={deleteElection}
                onClose={closeElection}
                notify={addToast}
              />
            )}
            {module === 'lima_distritos' && (
              <CategoryElectionManager
                categoryLabel="Distritos de Lima"
                filterFn={(e: any) => {
                  const title = e.title.toLowerCase();
                  const type = (e.election_type || '').toLowerCase();
                  return type.includes('distrital') && !title.includes('callao') && !title.includes('ventanilla') && !title.includes('perla') && !title.includes('punta') && !title.includes('bellavista') && !title.includes('carmen de la legua');
                }}
                refreshKey={refreshTrigger}
                onSave={(data: any) => post("/admin/election", data)}
                onDeleteElection={deleteElection}
                onClose={closeElection}
                notify={addToast}
              />
            )}
            {module === 'callao' && (
              <CategoryElectionManager
                categoryLabel="Callao"
                filterFn={(e: any) => {
                  const title = e.title.toLowerCase();
                  return title.includes('callao') || title.includes('ventanilla') || title.includes('perla') || title.includes('punta') || title.includes('bellavista') || title.includes('carmen de la legua');
                }}
                refreshKey={refreshTrigger}
                onSave={(data: any) => post("/admin/election", data)}
                onDeleteElection={deleteElection}
                onClose={closeElection}
                notify={addToast}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* Piezas reutilizables                                              */
/* ---------------------------------------------------------------- */

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="panel px-5 py-4">
      <p className="text-[13px] text-ink-500 dark:text-ink-400">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums">{value}</p>
    </div>
  );
}

/** Mensaje de error bajo un campo del formulario. */
function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="flex items-center gap-1.5 text-[13px] text-red-600 dark:text-red-400">
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
      {message}
    </p>
  );
}

/** Clase del campo: borde rojo cuando hay error. */
const fieldClass = (base: string, hasError?: string) =>
  hasError ? `${base} border-red-400 focus:border-red-500 focus:ring-red-500` : base;

function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="px-6 py-16 text-center">
      <p className="text-sm font-medium">{title}</p>
      {hint && <p className="mt-1 text-sm text-ink-400">{hint}</p>}
    </div>
  );
}

function CopyLinkButton({ slug, notify }: { slug: string; notify: (t: string, k?: ToastType) => void }) {
  const [copied, setCopied] = useState(false);
  const url = `${frontendUrl()}/vote/${slug}`;

  return (
    <button
      className="btn-secondary btn-sm"
      title={url}
      onClick={() => {
        navigator.clipboard.writeText(url);
        setCopied(true);
        notify("Link copiado al portapapeles", "info");
        setTimeout(() => setCopied(false), 2000);
      }}
    >
      {copied ? "Copiado" : "Copiar link"}
    </button>
  );
}

/* ---------------------------------------------------------------- */
/* Dashboard: tabla de procesos                                      */
/* ---------------------------------------------------------------- */

function ElectionManagement({ onClose, onDeleteElection, onDeleteCandidate, refreshKey, notify }: {
  onClose: (id: string) => void,
  onDeleteElection: (id: string) => void,
  onDeleteCandidate: (id: string) => void,
  refreshKey: number,
  notify: (text: string, type?: ToastType) => void,
}) {
  const [allElections, setAllElections] = useState<any[]>([]);
  const [candidatesMap, setCandidatesMap] = useState<Record<string, any[]>>({});
  const [resultsMap, setResultsMap] = useState<Record<string, any>>({});
  const [expanded, setExpanded] = useState<string | null>(null);
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [editElection, setEditElection] = useState<any>(null);
  const [editCandidate, setEditCandidate] = useState<any>(null);

  const [modal, setModal] = useState<{ isOpen: boolean, type: 'election' | 'candidate' | 'comment' | 'vote', id: string, extraId?: string } | null>(null);

  const refresh = () => {
    api<any[]>("/admin/elections", { headers: authHeaders() }).then(setAllElections).catch(() => {});
  };

  useEffect(() => { refresh(); }, [refreshKey]);

  useEffect(() => {
    (allElections || []).forEach(e => {
      api<any>(`/results/${e.id}`)
        .then(res => setResultsMap(prev => ({ ...prev, [e.id]: res })))
        .catch(() => {});
    });
  }, [allElections]);

  const loadCandidates = (id: string) => {
    api<Candidate[]>(`/elections/${id}/candidates`).then(list => {
      setCandidatesMap(prev => ({ ...prev, [id]: list }));
    });
  };

  const toggleRow = (id: string) => {
    if (expanded === id) { setExpanded(null); return; }
    setExpanded(id);
    if (!candidatesMap[id]) loadCandidates(id);
  };

  const categories = [
    { id: "all", label: "Todos" },
    { id: "presidencial", label: "Presidencial" },
    { id: "regionales", label: "Regionales" },
    { id: "lima", label: "Alcaldía de Lima" },
    { id: "lima_distritos", label: "Distritos de Lima" },
    { id: "callao", label: "Callao" },
  ];

  const filteredElections = (allElections || []).filter(e => {
    const title = e.title.toLowerCase();
    const type = (e.election_type || "").toLowerCase();

    if (search && !title.includes(search.toLowerCase()) && !(e.region_name || "").toLowerCase().includes(search.toLowerCase())) {
      return false;
    }

    switch (category) {
      case "presidencial": return type.includes("presidencial") || title.includes("presidencial");
      case "regionales": return type.includes("regional") || title.includes("regional");
      case "lima": return title.includes("alcaldía de lima") || title.includes("lima");
      case "lima_distritos": return type.includes("distrital") && !title.includes("callao") && !title.includes("ventanilla");
      case "callao": return title.includes("callao") || title.includes("ventanilla") || title.includes("perla") || title.includes("punta");
      default: return true;
    }
  });

  const activos = (allElections || []).filter(e => e.is_active).length;
  const totalVotos = Object.values(resultsMap).reduce((sum: number, r: any) => sum + (r?.total_votes || 0), 0);
  const ocultos = (allElections || []).filter(e => !portalVisibility(e).visible).length;
  const pager = usePagination<any>(filteredElections, 10);

  if (editElection) {
    return (
      <div className="space-y-4">
        <button className="btn-ghost btn-sm -ml-2" onClick={() => setEditElection(null)}>← Volver a procesos</button>
        <CreateElection
          isEdit
          initialData={editElection}
          onSave={(data) => api(`/admin/election/${editElection.id}`, { method: "PUT", headers: authHeaders(), body: JSON.stringify(data) })
            .then(() => { notify("Proceso actualizado", "success"); setEditElection(null); refresh(); })
            .catch((e: any) => notify(e.message, "error"))}
        />
      </div>
    );
  }

  if (editCandidate) {
    return (
      <div className="space-y-4">
        <button className="btn-ghost btn-sm -ml-2" onClick={() => setEditCandidate(null)}>← Volver a procesos</button>
        <CreateCandidate
          isEdit
          initialData={editCandidate}
          onSave={(data) => api(`/admin/candidate/${editCandidate.id}`, { method: "PUT", headers: authHeaders(), body: JSON.stringify(data) })
            .then(() => { notify("Candidato actualizado", "success"); setEditCandidate(null); refresh(); })
            .catch((e: any) => notify(e.message, "error"))}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Modal
        isOpen={!!modal && (modal.type === 'election' || modal.type === 'candidate')}
        onClose={() => setModal(null)}
        isDanger
        title={modal?.type === 'election' ? "Eliminar proceso electoral" : "Remover candidato"}
        message={modal?.type === 'election'
          ? "Se eliminarán la elección, todos sus candidatos y todos los votos registrados. Esta acción no se puede deshacer."
          : "Se removerá al candidato y se eliminarán los votos asociados. Esta acción no se puede deshacer."}
        confirmText={modal?.type === 'election' ? "Eliminar proceso" : "Remover candidato"}
        onConfirm={() => {
          if (!modal) return;
          if (modal.type === 'election') {
            onDeleteElection(modal.id);
          } else if (modal.type === 'candidate' && modal.extraId) {
            onDeleteCandidate(modal.id);
            const eid = modal.extraId;
            setTimeout(() => loadCandidates(eid), 500);
          }
        }}
      />

      {/* Resumen */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Procesos" value={(allElections || []).length} />
        <Stat label="Activos" value={activos} />
        <Stat label="Ocultos en el portal" value={ocultos} />
        <Stat label="Votos registrados" value={totalVotos.toLocaleString("es-PE")} />
      </div>

      {ocultos > 0 && (
        <div className="flex items-start gap-3 rounded-lg border border-ink-200 bg-white px-4 py-3 dark:border-white/10 dark:bg-ink-900">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0 text-ink-400"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>
          <p className="text-sm text-ink-600 dark:text-ink-300">
            <span className="font-medium">{ocultos} proceso(s) no se ven en el portal público.</span>{" "}
            El portal solo muestra procesos activos y con fecha de cierre futura. Revisa la columna
            <span className="mx-1 font-medium">Portal</span>y edita el proceso para corregirlo.
          </p>
        </div>
      )}

      {/* Filtros + tabla */}
      <div className="panel">
        <div className="panel-header flex-col items-stretch gap-3 sm:flex-row sm:items-center">
          <div className="flex flex-wrap gap-1">
            {categories.map(c => (
              <button
                key={c.id}
                onClick={() => setCategory(c.id)}
                className={category === c.id ? "btn-sm rounded-lg bg-brand-50 font-medium text-brand-700 dark:bg-brand-500/10 dark:text-brand-300" : "btn-ghost btn-sm"}
              >
                {c.label}
              </button>
            ))}
          </div>
          <div className="relative sm:w-64">
            <input
              className="input py-1.5 pl-9"
              placeholder="Buscar proceso…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th className="w-10" />
                <th>Proceso</th>
                <th>Ámbito</th>
                <th>Estado</th>
                <th>Portal</th>
                <th>Líder</th>
                <th className="text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {pager.pageItems.map(e => {
                const leader = resultsMap[e.id]?.ranking?.[0];
                const isOpen = expanded === e.id;
                return (
                  <Fragment key={e.id}>
                    <tr>
                      <td>
                        <button
                          onClick={() => toggleRow(e.id)}
                          className="btn-ghost h-7 w-7 p-0"
                          aria-label={isOpen ? "Ocultar candidatos" : "Ver candidatos"}
                          aria-expanded={isOpen}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform ${isOpen ? "rotate-90" : ""}`}><polyline points="9 18 15 12 9 6" /></svg>
                        </button>
                      </td>
                      <td>
                        <p className="font-medium">{e.title}</p>
                        <p className="text-[13px] text-ink-400">{e.election_type}</p>
                      </td>
                      <td className="text-ink-600 dark:text-ink-300">{e.region_name || "Nacional"}</td>
                      <td>
                        <span className={e.is_active ? "badge-active" : "badge-closed"}>
                          {e.is_active && <span className="h-1.5 w-1.5 rounded-full bg-accent-500" />}
                          {e.is_active ? "Activo" : "Cerrado"}
                        </span>
                      </td>
                      <td><PortalBadge election={e} /></td>
                      <td>
                        {leader ? (
                          <span className="text-ink-600 dark:text-ink-300">
                            {leader.name} <span className="tabular-nums text-ink-400">· {leader.votes} votos</span>
                          </span>
                        ) : (
                          <span className="text-ink-400">Sin votos</span>
                        )}
                      </td>
                      <td>
                        <div className="flex items-center justify-end gap-1.5">
                          {e.slug && <CopyLinkButton slug={e.slug} notify={notify} />}
                          <button className="btn-secondary btn-sm" onClick={() => setEditElection(e)}>Editar</button>
                          {e.is_active && (
                            <button className="btn-secondary btn-sm" onClick={() => onClose(e.id)}>Finalizar</button>
                          )}
                          <button className="btn-danger btn-sm" onClick={() => setModal({ isOpen: true, type: 'election', id: e.id })}>Eliminar</button>
                        </div>
                      </td>
                    </tr>

                    {isOpen && (
                      <tr className="hover:bg-transparent">
                        <td colSpan={7} className="bg-ink-50/60 p-0 dark:bg-white/5">
                          <div className="px-6 py-4">
                            <p className="mb-3 text-[13px] font-medium text-ink-500 dark:text-ink-300">
                              Candidatos {candidatesMap[e.id] ? `(${candidatesMap[e.id].length})` : ""}
                            </p>
                            {!candidatesMap[e.id] ? (
                              <p className="text-sm text-ink-400">Cargando…</p>
                            ) : candidatesMap[e.id].length === 0 ? (
                              <p className="text-sm text-ink-400">Este proceso aún no tiene candidatos inscritos.</p>
                            ) : (
                              <div className="space-y-2">
                                {candidatesMap[e.id].map(c => (
                                  <div key={c.id} className="flex items-center justify-between gap-4 rounded-lg border border-ink-100 bg-white px-4 py-2.5 dark:border-white/10 dark:bg-ink-900">
                                    <div className="flex min-w-0 items-center gap-3">
                                      {c.image_url
                                        ? <img src={getImageUrl(c.image_url)} className="h-9 w-9 shrink-0 rounded-full object-cover" alt="" />
                                        : <span className="h-9 w-9 shrink-0 rounded-full bg-ink-100 dark:bg-white/10" />}
                                      <div className="min-w-0">
                                        <p className="truncate text-sm font-medium">{c.name}</p>
                                        {c.description && <p className="truncate text-[13px] text-ink-400">{c.description}</p>}
                                      </div>
                                    </div>
                                    <div className="flex shrink-0 items-center gap-1.5">
                                      <button className="btn-ghost btn-sm" onClick={() => setModal({ isOpen: true, type: 'vote', id: c.id, extraId: e.id })}>Añadir votos</button>
                                      <button className="btn-ghost btn-sm" onClick={() => setModal({ isOpen: true, type: 'comment', id: c.id })}>Comentar</button>
                                      <button className="btn-secondary btn-sm" onClick={() => setEditCandidate(c)}>Editar</button>
                                      <button className="btn-danger btn-sm" onClick={() => setModal({ isOpen: true, type: 'candidate', id: c.id, extraId: e.id })}>Remover</button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>

          {filteredElections.length === 0 && (
            <EmptyState
              title="No hay procesos que coincidan"
              hint="Cambia la categoría o ajusta la búsqueda."
            />
          )}
        </div>

        <Pagination {...pager} />
      </div>

      {/* Añadir votos */}
      {modal?.type === 'vote' && (
        <VoteModal
          onCancel={() => setModal(null)}
          onConfirm={(count) => {
            api(`/admin/add-vote`, {
              method: "POST",
              headers: authHeaders(),
              body: JSON.stringify({ election_id: modal.extraId, candidate_id: modal.id, count }),
            })
              .then(() => { notify(`${count} voto(s) añadidos`, "success"); setModal(null); refresh(); })
              .catch((e: any) => notify(e.message, "error"));
          }}
        />
      )}

      {/* Comentario */}
      {modal?.type === 'comment' && (
        <CommentModal
          onCancel={() => setModal(null)}
          onConfirm={(content) => {
            api(`/comments`, { method: "POST", body: JSON.stringify({ candidate_id: modal.id, content }) })
              .then(() => { notify("Comentario publicado", "success"); setModal(null); })
              .catch((e: any) => notify(e.message, "error"));
          }}
        />
      )}
    </div>
  );
}

function VoteModal({ onCancel, onConfirm }: { onCancel: () => void; onConfirm: (count: number) => void }) {
  const [count, setCount] = useState("1");

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-ink-950/40" onClick={onCancel} />
      <form
        className="panel relative w-full max-w-sm shadow-lg"
        onSubmit={e => {
          e.preventDefault();
          const n = parseInt(count, 10);
          if (isNaN(n) || n < 1) return;
          onConfirm(n);
        }}
      >
        <div className="panel-header">
          <div>
            <h3 className="panel-title">Añadir votos</h3>
            <p className="panel-subtitle">Ajuste administrativo del conteo.</p>
          </div>
        </div>
        <div className="panel-body">
          <div className="field">
            <label htmlFor="vote-count" className="label">Cantidad de votos</label>
            <input
              id="vote-count"
              type="number"
              min={1}
              className="input"
              value={count}
              onChange={e => setCount(e.target.value)}
              autoFocus
            />
          </div>
        </div>
        <div className="panel-footer">
          <button type="button" className="btn-secondary" onClick={onCancel}>Cancelar</button>
          <button type="submit" className="btn-primary">Añadir</button>
        </div>
      </form>
    </div>
  );
}

function CommentModal({ onCancel, onConfirm }: { onCancel: () => void; onConfirm: (content: string) => void }) {
  const [content, setContent] = useState("");

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-ink-950/40" onClick={onCancel} />
      <form
        className="panel relative w-full max-w-lg shadow-lg"
        onSubmit={e => { e.preventDefault(); if (content.trim()) onConfirm(content.trim()); }}
      >
        <div className="panel-header">
          <h3 className="panel-title">Nuevo comentario</h3>
        </div>
        <div className="panel-body">
          <div className="field">
            <label htmlFor="comment-content" className="label">Comentario</label>
            <textarea
              id="comment-content"
              className="textarea"
              placeholder="Escribe el comentario…"
              value={content}
              onChange={e => setContent(e.target.value)}
              autoFocus
            />
          </div>
        </div>
        <div className="panel-footer">
          <button type="button" className="btn-secondary" onClick={onCancel}>Cancelar</button>
          <button type="submit" className="btn-primary" disabled={!content.trim()}>Publicar</button>
        </div>
      </form>
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* Catálogo: categorías y ámbitos                                    */
/* ---------------------------------------------------------------- */

function CreateElectionType({ onSave, onDelete, refreshKey }: { onSave: (name: string) => void, onDelete?: (id: string) => void, refreshKey?: number }) {
  const [name, setName] = useState("");
  const [list, setList] = useState<any[]>([]);

  useEffect(() => { api<any[]>("/election-types").then(setList).catch(() => {}); }, [refreshKey]);

  return (
    <div className="space-y-6">
      <form
        className="panel"
        onSubmit={e => { e.preventDefault(); if (name.trim()) { onSave(name.trim()); setName(""); } }}
      >
        <div className="panel-header">
          <div>
            <h3 className="panel-title">Nueva categoría</h3>
            <p className="panel-subtitle">El tipo de elección que luego asignas a cada proceso.</p>
          </div>
        </div>
        <div className="panel-body">
          <div className="field max-w-md">
            <label htmlFor="type-name" className="label">Nombre</label>
            <input
              id="type-name"
              className="input"
              placeholder="Ej. Presidencial, Municipal, Regional"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>
        </div>
        <div className="panel-footer">
          <button type="submit" className="btn-primary" disabled={!name.trim()}>Crear categoría</button>
        </div>
      </form>

      <div className="panel">
        <div className="panel-header">
          <h3 className="panel-title">Categorías registradas</h3>
          <span className="text-sm text-ink-400">{(list || []).length}</span>
        </div>
        {(list || []).length === 0 ? (
          <EmptyState title="Aún no hay categorías" hint="Crea la primera con el formulario de arriba." />
        ) : (
          <table className="table">
            <thead>
              <tr><th>Nombre</th><th className="text-right">Acciones</th></tr>
            </thead>
            <tbody>
              {list.map(t => (
                <tr key={t.id}>
                  <td className="font-medium">{t.name}</td>
                  <td className="text-right">
                    {onDelete && <button className="btn-danger btn-sm" onClick={() => onDelete(t.id)}>Eliminar</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

const LEVEL_LABELS: Record<string, string> = {
  country: "Nacional",
  region: "Regional",
  province: "Provincial",
  district: "Distrital",
};

function CreateRegion({ onSave, onDelete, refreshKey }: { onSave: (d: any) => void, onDelete?: (id: string) => void, refreshKey?: number }) {
  const [d, setD] = useState<any>({ level: "region" });
  const [list, setList] = useState<any[]>([]);
  const pager = usePagination<any>(list, 10);

  useEffect(() => { api<any[]>("/regions").then(setList).catch(() => {}); }, [refreshKey]);

  return (
    <div className="space-y-6">
      <form
        className="panel"
        onSubmit={e => { e.preventDefault(); if (d.name?.trim()) onSave(d); }}
      >
        <div className="panel-header">
          <div>
            <h3 className="panel-title">Nuevo ámbito</h3>
            <p className="panel-subtitle">La jurisdicción geográfica a la que pertenece un proceso.</p>
          </div>
        </div>
        <div className="panel-body grid gap-4 sm:grid-cols-2">
          <div className="field">
            <label htmlFor="region-name" className="label">Nombre</label>
            <input
              id="region-name"
              className="input"
              placeholder="Ej. Arequipa, Miraflores"
              value={d.name || ""}
              onChange={e => setD({ ...d, name: e.target.value })}
            />
          </div>
          <div className="field">
            <label htmlFor="region-level" className="label">Nivel</label>
            <select id="region-level" className="select" onChange={e => setD({ ...d, level: e.target.value })} value={d.level}>
              <option value="country">Nacional</option>
              <option value="region">Regional</option>
              <option value="province">Provincial</option>
              <option value="district">Distrital</option>
            </select>
          </div>
        </div>
        <div className="panel-footer">
          <button type="submit" className="btn-primary" disabled={!d.name?.trim()}>Crear ámbito</button>
        </div>
      </form>

      <div className="panel">
        <div className="panel-header">
          <h3 className="panel-title">Ámbitos registrados</h3>
          <span className="text-sm text-ink-400">{(list || []).length}</span>
        </div>
        {(list || []).length === 0 ? (
          <EmptyState title="Aún no hay ámbitos" hint="Crea el primero con el formulario de arriba." />
        ) : (
          <div>
            <table className="table">
              <thead>
                <tr><th>Nombre</th><th>Nivel</th><th className="text-right">Acciones</th></tr>
              </thead>
              <tbody>
                {pager.pageItems.map(r => (
                  <tr key={r.id}>
                    <td className="font-medium">{r.name}</td>
                    <td><span className="badge-neutral">{LEVEL_LABELS[r.level] || r.level}</span></td>
                    <td className="text-right">
                      {onDelete && <button className="btn-danger btn-sm" onClick={() => onDelete(r.id)}>Eliminar</button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination {...pager} />
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* Formularios: elección y candidato                                 */
/* ---------------------------------------------------------------- */

function CreateElection({ onSave, isEdit, initialData }: { onSave: (d: any) => void, isEdit?: boolean, initialData?: any }) {
  const [d, setD] = useState<any>(initialData || { is_active: true, banner_url: "", description: "" });
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [types, setTypes] = useState<any[]>([]);
  const [regions, setRegions] = useState<any[]>([]);

  useEffect(() => {
    api<any[]>("/election-types").then(setTypes).catch(() => {});
    api<any[]>("/regions").then(setRegions).catch(() => {});
  }, []);

  const filteredRegions = useMemo(() => {
    const selectedType = types.find(t => t.id === d.election_type_id || t.name === d.election_type);
    if (!selectedType) return [];
    const typeName = selectedType.name.toLowerCase();
    if (typeName.includes("presidencial")) return [];
    if (typeName.includes("regional")) return regions.filter(r => r.level === 'region');
    if (typeName.includes("provincial")) return regions.filter(r => r.level === 'province');
    if (typeName.includes("distrital")) return regions.filter(r => r.level === 'district');
    return regions;
  }, [d.election_type_id, d.election_type, types, regions]);

  const showRegionSelect = useMemo(() => {
    const selectedType = types.find(t => t.id === d.election_type_id || t.name === d.election_type);
    if (!selectedType) return true;
    return !selectedType.name.toLowerCase().includes("presidencial");
  }, [d.election_type_id, d.election_type, types]);

  const validate = () => {
    const next: Record<string, string> = {};

    if (!d.title?.trim()) next.title = "Escribe el nombre del proceso.";
    else if (d.title.trim().length < 5) next.title = "El nombre debe tener al menos 5 caracteres.";

    if (!d.election_type_id && !d.election_type) next.election_type_id = "Selecciona una categoría.";

    if (showRegionSelect && !d.region_id && !d.region_name) {
      next.region_id = "Selecciona el ámbito al que pertenece el proceso.";
    }

    if (!d.end_date) {
      next.end_date = "Indica la fecha y hora de cierre.";
    } else if (new Date(d.end_date) <= new Date()) {
      next.end_date = "La fecha debe ser futura: el portal oculta los procesos ya vencidos.";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      let bannerUrl = d.banner_url;
      if (file) bannerUrl = await uploadImage(file);
      onSave({ ...d, banner_url: bannerUrl });
    } catch (e: any) {
      setErrors({ form: "No se pudo subir la imagen: " + e.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="panel" onSubmit={e => { e.preventDefault(); handleSave(); }}>
      <div className="panel-header">
        <div>
          <h3 className="panel-title">{isEdit ? `Editar: ${initialData?.title}` : "Datos del proceso"}</h3>
          <p className="panel-subtitle">Define el nombre, la categoría y la fecha de cierre.</p>
        </div>
      </div>

      <div className="form-section">
        <div>
          <p className="text-sm font-medium">Identificación</p>
          <p className="hint mt-1">Nombre con el que el proceso aparecerá en el portal público.</p>
        </div>
        <div className="form-section-fields">
          <div className="field">
            <label htmlFor="election-title" className="label">Título <span className="text-red-500">*</span></label>
            <input
              id="election-title"
              className={fieldClass("input", errors.title)}
              placeholder="Ej. Elecciones Regionales 2026"
              value={d.title || ""}
              onChange={e => setD({ ...d, title: e.target.value })}
              aria-invalid={!!errors.title}
            />
            <FieldError message={errors.title} />
          </div>
          <div className="field">
            <label htmlFor="election-desc" className="label">Descripción</label>
            <textarea
              id="election-desc"
              className="textarea"
              placeholder="Contexto y propósito de esta elección."
              value={d.description || ""}
              onChange={e => setD({ ...d, description: e.target.value })}
            />
          </div>
        </div>
      </div>

      <div className="form-section">
        <div>
          <p className="text-sm font-medium">Clasificación</p>
          <p className="hint mt-1">La categoría determina qué ámbitos puedes elegir.</p>
        </div>
        <div className="form-section-fields">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="field">
              <label htmlFor="election-type" className="label">Categoría <span className="text-red-500">*</span></label>
              <select
                id="election-type"
                className={fieldClass("select", errors.election_type_id)}
                onChange={e => setD({ ...d, election_type_id: e.target.value, region_id: null })}
                value={d.election_type_id || d.election_type || ""}
                aria-invalid={!!errors.election_type_id}
              >
                <option value="">Selecciona una categoría</option>
                {types.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
              <FieldError message={errors.election_type_id} />
            </div>
            {showRegionSelect && (
              <div className="field">
                <label htmlFor="election-region" className="label">Ámbito <span className="text-red-500">*</span></label>
                <select
                  id="election-region"
                  className={fieldClass("select", errors.region_id)}
                  onChange={e => setD({ ...d, region_id: e.target.value || null })}
                  value={d.region_id || d.region_name || ""}
                  aria-invalid={!!errors.region_id}
                >
                  <option value="">Selecciona un ámbito</option>
                  {filteredRegions.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
                <FieldError message={errors.region_id} />
                {filteredRegions.length === 0 && (d.election_type_id || d.election_type) && (
                  <p className="hint">No hay ámbitos de este nivel. Créalos primero en la sección Ámbitos.</p>
                )}
              </div>
            )}
          </div>
          <div className="field">
            <label htmlFor="election-end" className="label">Fecha y hora de cierre <span className="text-red-500">*</span></label>
            <input
              id="election-end"
              type="datetime-local"
              className={fieldClass("input", errors.end_date)}
              value={d.end_date ? new Date(d.end_date).toISOString().slice(0, 16) : ""}
              onChange={e => setD({ ...d, end_date: e.target.value ? new Date(e.target.value).toISOString() : "" })}
              aria-invalid={!!errors.end_date}
            />
            {errors.end_date
              ? <FieldError message={errors.end_date} />
              : <p className="hint">Debe ser una fecha futura: el portal público oculta los procesos cuyo cierre ya pasó.</p>}
          </div>
          <label className="flex items-center gap-3 rounded-lg border border-ink-200 px-4 py-3 dark:border-white/10">
            <input
              type="checkbox"
              checked={!!d.is_active}
              onChange={e => setD({ ...d, is_active: e.target.checked })}
              className="h-4 w-4 accent-brand-600"
            />
            <span className="text-sm">
              <span className="font-medium">Proceso activo</span>
              <span className="ml-2 text-ink-400">Visible y abierto a votación en el portal público.</span>
            </span>
          </label>
        </div>
      </div>

      <div className="form-section">
        <div>
          <p className="text-sm font-medium">Imagen de portada</p>
          <p className="hint mt-1">Se muestra bajo el título del proceso. Formato panorámico (16:9).</p>
        </div>
        <div className="form-section-fields">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <div className="flex h-32 w-full shrink-0 items-center justify-center overflow-hidden rounded-lg border border-ink-200 bg-ink-50 sm:w-56 dark:border-white/10 dark:bg-ink-950">
              {(file || d.banner_url) ? (
                <img src={file ? URL.createObjectURL(file) : getImageUrl(d.banner_url)} className="h-full w-full object-contain" alt="Vista previa" />
              ) : (
                <span className="text-[13px] text-ink-400">Sin imagen</span>
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={e => setFile(e.target.files?.[0] || null)}
              className="block w-full text-sm text-ink-500 file:mr-4 file:cursor-pointer file:rounded-lg file:border-0 file:bg-brand-600 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-brand-700"
            />
          </div>
        </div>
      </div>

      <div className="panel-footer">
        {(errors.form || Object.keys(errors).length > 0) && (
          <p className="mr-auto text-sm text-red-600 dark:text-red-400">
            {errors.form || "Revisa los campos marcados."}
          </p>
        )}
        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? "Guardando…" : isEdit ? "Guardar cambios" : "Crear proceso"}
        </button>
      </div>
    </form>
  );
}

function CreateCandidate({ onSave, isEdit, initialData }: { onSave: (d: any) => void, isEdit?: boolean, initialData?: any }) {
  const [d, setD] = useState<any>(initialData || {});
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [elections, setElections] = useState<any[]>([]);

  useEffect(() => { api<Election[]>("/admin/elections", { headers: authHeaders() }).then(setElections).catch(() => {}); }, []);

  const validate = () => {
    const next: Record<string, string> = {};

    if (!d.name?.trim()) next.name = "Escribe el nombre del candidato.";
    else if (d.name.trim().length < 3) next.name = "El nombre debe tener al menos 3 caracteres.";

    if (!file && !d.image_url) next.image = "Selecciona una fotografía.";

    if (d.button_url?.trim() && !/^https?:\/\/.+/i.test(d.button_url.trim())) {
      next.button_url = "El enlace debe empezar por http:// o https://";
    }
    if (d.button_url?.trim() && !d.button_text?.trim()) {
      next.button_text = "Si defines un enlace, ponle un texto al botón.";
    }

    if (!d.election_id && !isEdit) next.election_id = "Selecciona el proceso al que pertenece.";

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    try {
      setUploading(true);
      let url = d.image_url;
      if (file) url = await uploadImage(file);
      onSave({ ...d, image_url: url });
      setFile(null);
    } catch (e: any) {
      setErrors({ form: "No se pudo subir la foto: " + e.message });
    } finally {
      setUploading(false);
    }
  };

  return (
    <form className="panel" onSubmit={e => { e.preventDefault(); handleSave(); }}>
      <div className="panel-header">
        <div>
          <h3 className="panel-title">{isEdit ? `Editar: ${initialData?.name}` : "Datos del candidato"}</h3>
          <p className="panel-subtitle">Nombre, foto y proceso al que se presenta.</p>
        </div>
      </div>

      <div className="form-section">
        <div>
          <p className="text-sm font-medium">Identificación</p>
          <p className="hint mt-1">Nombre y eslogan que verán los votantes.</p>
        </div>
        <div className="form-section-fields">
          <div className="field">
            <label htmlFor="cand-name" className="label">Nombre completo u organización <span className="text-red-500">*</span></label>
            <input
              id="cand-name"
              className={fieldClass("input", errors.name)}
              placeholder="Ej. María Fernández"
              value={d.name || ""}
              onChange={e => setD({ ...d, name: e.target.value })}
              aria-invalid={!!errors.name}
            />
            <FieldError message={errors.name} />
          </div>
          <div className="field">
            <label htmlFor="cand-desc" className="label">Eslogan o descripción</label>
            <textarea
              id="cand-desc"
              className="textarea"
              placeholder="Ej. Por un futuro mejor"
              value={d.description || ""}
              onChange={e => setD({ ...d, description: e.target.value })}
            />
          </div>
        </div>
      </div>

      <div className="form-section">
        <div>
          <p className="text-sm font-medium">Fotografía</p>
          <p className="hint mt-1">Se muestra en la tarjeta del candidato. Preferible cuadrada.</p>
        </div>
        <div className="form-section-fields">
          <div className="flex items-center gap-4">
            <div className={`flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border bg-ink-50 dark:bg-ink-950 ${errors.image ? "border-red-400" : "border-ink-200 dark:border-white/10"}`}>
              {(file || d.image_url) ? (
                <img src={file ? URL.createObjectURL(file) : getImageUrl(d.image_url)} className="h-full w-full object-cover" alt="Vista previa" />
              ) : (
                <span className="text-[13px] text-ink-400">Foto</span>
              )}
            </div>
            <div className="w-full space-y-1.5">
              <input
                type="file"
                accept="image/*"
                onChange={e => setFile(e.target.files?.[0] || null)}
                className="block w-full text-sm text-ink-500 file:mr-4 file:cursor-pointer file:rounded-lg file:border-0 file:bg-brand-600 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-brand-700"
              />
              <FieldError message={errors.image} />
            </div>
          </div>
        </div>
      </div>

      <div className="form-section">
        <div>
          <p className="text-sm font-medium">Enlace y proceso</p>
          <p className="hint mt-1">El botón es opcional; el proceso es obligatorio al inscribir.</p>
        </div>
        <div className="form-section-fields">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="field">
              <label htmlFor="cand-btn-text" className="label">Texto del botón <span className="text-ink-400">(opcional)</span></label>
              <input
                id="cand-btn-text"
                className={fieldClass("input", errors.button_text)}
                placeholder="Ej. Ver propuestas"
                value={d.button_text || ""}
                onChange={e => setD({ ...d, button_text: e.target.value })}
                aria-invalid={!!errors.button_text}
              />
              <FieldError message={errors.button_text} />
            </div>
            <div className="field">
              <label htmlFor="cand-btn-url" className="label">Enlace del botón <span className="text-ink-400">(opcional)</span></label>
              <input
                id="cand-btn-url"
                type="url"
                className={fieldClass("input", errors.button_url)}
                placeholder="https://…"
                value={d.button_url || ""}
                onChange={e => setD({ ...d, button_url: e.target.value })}
                aria-invalid={!!errors.button_url}
              />
              <FieldError message={errors.button_url} />
            </div>
          </div>
          {!isEdit && (
            <div className="field">
              <label htmlFor="cand-election" className="label">Proceso electoral <span className="text-red-500">*</span></label>
              <select
                id="cand-election"
                className={fieldClass("select", errors.election_id)}
                onChange={e => setD({ ...d, election_id: e.target.value })}
                value={d.election_id || ""}
                aria-invalid={!!errors.election_id}
              >
                <option value="">Selecciona un proceso</option>
                {(elections || []).map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
              </select>
              <FieldError message={errors.election_id} />
            </div>
          )}
        </div>
      </div>

      <div className="panel-footer">
        {Object.keys(errors).length > 0 && (
          <p className="mr-auto text-sm text-red-600 dark:text-red-400">
            {errors.form || "Revisa los campos marcados."}
          </p>
        )}
        <button type="submit" className="btn-primary" disabled={uploading}>
          {uploading ? "Guardando…" : isEdit ? "Guardar cambios" : "Inscribir candidato"}
        </button>
      </div>
    </form>
  );
}

/* ---------------------------------------------------------------- */
/* Módulos por categoría                                             */
/* ---------------------------------------------------------------- */

function CategoryElectionManager({ categoryLabel, filterFn, refreshKey, onSave, onDeleteElection, onClose, notify }: {
  categoryLabel: string;
  filterFn: (e: any) => boolean;
  refreshKey: number;
  onSave: (data: any) => void;
  onDeleteElection: (id: string) => void;
  onClose: (id: string) => void;
  notify: (text: string, type?: ToastType) => void;
}) {
  const [allElections, setAllElections] = useState<any[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  useEffect(() => {
    api<any[]>("/admin/elections", { headers: authHeaders() }).then(setAllElections).catch(() => {});
  }, [refreshKey]);

  const filtered = (allElections || []).filter(filterFn);
  const pager = usePagination<any>(filtered, 10);

  return (
    <div className="space-y-6">
      <Modal
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        isDanger
        title="Eliminar proceso electoral"
        message="Se eliminarán la elección, todos sus candidatos y todos los votos registrados. Esta acción no se puede deshacer."
        confirmText="Eliminar proceso"
        onConfirm={() => { if (confirmDelete) onDeleteElection(confirmDelete); }}
      />

      {showCreate && (
        <CreateElection onSave={(data) => { onSave(data); setShowCreate(false); }} />
      )}

      <div className="panel">
        <div className="panel-header">
          <div>
            <h3 className="panel-title">{categoryLabel}</h3>
            <p className="panel-subtitle">{filtered.length} proceso(s) registrados</p>
          </div>
          <button className="btn-primary" onClick={() => setShowCreate(!showCreate)}>
            {showCreate ? "Cerrar formulario" : "Nuevo proceso"}
          </button>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            title={`No hay procesos en ${categoryLabel}`}
            hint="Crea uno nuevo con el botón de arriba."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Proceso</th>
                  <th>Ámbito</th>
                  <th>Estado</th>
                  <th>Portal</th>
                  <th>Link público</th>
                  <th className="text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {pager.pageItems.map(e => (
                  <tr key={e.id}>
                    <td>
                      <p className="font-medium">{e.title}</p>
                      <p className="text-[13px] text-ink-400">{e.election_type}</p>
                    </td>
                    <td className="text-ink-600 dark:text-ink-300">{e.region_name || "Nacional"}</td>
                    <td>
                      <span className={e.is_active ? "badge-active" : "badge-closed"}>
                        {e.is_active && <span className="h-1.5 w-1.5 rounded-full bg-accent-500" />}
                        {e.is_active ? "Activo" : "Cerrado"}
                      </span>
                    </td>
                    <td><PortalBadge election={e} /></td>
                    <td>
                      {e.slug ? (
                        <code className="rounded-md bg-ink-50 px-2 py-1 text-[12px] text-ink-600 dark:bg-white/5 dark:text-ink-300">
                          /vote/{e.slug}
                        </code>
                      ) : (
                        <span className="text-ink-400">—</span>
                      )}
                    </td>
                    <td>
                      <div className="flex items-center justify-end gap-1.5">
                        {e.slug && <CopyLinkButton slug={e.slug} notify={notify} />}
                        {e.is_active && <button className="btn-secondary btn-sm" onClick={() => onClose(e.id)}>Finalizar</button>}
                        <button className="btn-danger btn-sm" onClick={() => setConfirmDelete(e.id)}>Eliminar</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination {...pager} />
          </div>
        )}
      </div>
    </div>
  );
}
