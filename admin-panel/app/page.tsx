"use client";

import { useEffect, useState, Suspense, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { api, authHeaders, uploadImage, getImageUrl, Election, Candidate, Region, ElectionType } from "@/lib/api";
import Sidebar from "@/components/Sidebar";
import ToastContainer, { ToastMessage, ToastType } from "@/components/Toast";
import Modal from "@/components/Modal";

export default function AdminPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center text-[10px] font-black uppercase tracking-widest text-slate-300">Cargando Sistema...</div>}>
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
      addToast("Conexión segura establecida", "success");
    } catch (e: any) {
      addToast("Credenciales de acceso inválidas", "error");
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
      addToast("Registro guardado con éxito", "success");
      setRefreshTrigger(prev => prev + 1);
    } catch (e: any) {
      addToast(e.message, "error");
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-900 px-4">
        <ToastContainer toasts={toasts} onRemove={removeToast} />
        <button onClick={toggleTheme} className="fixed top-6 right-6 p-3 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors z-10">
          {darkMode ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
          )}
        </button>
        <div className="w-full max-w-sm">
          <div className="mb-16 text-center">
            <div className="h-16 w-16 bg-emerald-600 text-white flex items-center justify-center mx-auto mb-8 text-2xl font-black">A</div>
            <h1 className="text-xs font-black uppercase tracking-[0.4em] dark:text-white">Panel de Control <span className="text-emerald-600 dark:text-emerald-400">Admin</span></h1>
            <p className="text-slate-600 dark:text-slate-400 text-[9px] font-bold uppercase tracking-[0.2em] mt-6">Acceso Restringido • Seguridad Nivel 1</p>
          </div>
          <div className="space-y-6">
            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 ml-1">Identificador</label>
              <input className="w-full px-5 py-5 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-none text-[11px] font-bold uppercase tracking-widest outline-none focus:border-emerald-600 focus:bg-white dark:focus:bg-slate-700 transition-all dark:text-white" placeholder="Email Corporativo" onChange={e => setEmail(e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 ml-1">Clave de Acceso</label>
              <input className="w-full px-5 py-5 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-none text-[11px] font-bold uppercase tracking-widest outline-none focus:border-emerald-600 focus:bg-white dark:focus:bg-slate-700 transition-all dark:text-white" type="password" placeholder="••••••••" onChange={e => setPassword(e.target.value)} />
            </div>
            <button className="w-full bg-black dark:bg-emerald-600 text-white px-4 py-5 text-[11px] font-black uppercase tracking-[0.3em] hover:bg-emerald-600 dark:hover:bg-emerald-500 transition-all disabled:opacity-50 mt-8" onClick={login} disabled={loading}>
              {loading ? "Verificando..." : "Autorizar Acceso"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-white dark:bg-slate-900 transition-colors">
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}
      <div className={`fixed lg:relative z-50 lg:z-auto transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        <Sidebar onToggleMobile={() => setSidebarOpen(false)} />
      </div>
      <div className="flex-grow flex flex-col min-w-0">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-100 dark:border-slate-700/50 px-4 sm:px-6 lg:px-12 py-4 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 text-slate-500 hover:text-black dark:hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>
          <div className="flex items-center gap-6 ml-auto">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black text-xs rounded-full uppercase">{loggedEmail ? loggedEmail[0] : "A"}</div>
              <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 hidden sm:inline">{loggedEmail}</span>
            </div>
            <button onClick={toggleTheme} className="p-2 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors" title={darkMode ? "Modo Claro" : "Modo Oscuro"}>
              {darkMode ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
              )}
            </button>
          </div>
        </header>
        <div className="flex-grow p-4 sm:p-8 lg:p-24 overflow-auto relative">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8 lg:mb-20">
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tighter capitalize mb-4 text-black dark:text-white">
                {module === 'dashboard' ? 'Dashboard' : 
                 module === 'elections' ? 'Elecciones' :
                 module === 'candidates' ? 'Candidatos' :
                 module === 'regions' ? 'Ámbitos' :
                 module === 'types' ? 'Categorías' :
                 module === 'presidenciales' ? 'Presidenciales' :
                 module === 'alcaldia_lima' ? 'Alcaldía de Lima' :
                 module === 'regionales' ? 'Regionales' :
                 module === 'lima_distritos' ? 'Distritos de Lima' :
                 module === 'callao' ? 'Callao' :
                 'Panel'}
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-[11px] font-bold uppercase tracking-[0.3em]">Gestión centralizada del sistema electoral.</p>
            </div>

          <div className="grid gap-16">
            {module === 'dashboard' && (
               <ElectionManagement 
                refreshKey={refreshTrigger}
                onClose={(id) => api(`/admin/election/${id}/close`, { method: "PUT", headers: authHeaders() }).then(() => { addToast("Proceso electoral finalizado", "info"); setRefreshTrigger(prev => prev + 1); })} 
                onDeleteElection={(id) => api(`/admin/election/${id}`, { method: "DELETE", headers: authHeaders() }).then(() => { addToast("Proceso eliminado definitivamente", "success"); setRefreshTrigger(prev => prev + 1); })}
                onDeleteCandidate={(id) => api(`/admin/candidate/${id}`, { method: "DELETE", headers: authHeaders() }).then(() => { addToast("Candidato removido", "success"); setRefreshTrigger(prev => prev + 1); })}
              />
            )}
            {module === 'types' && <CreateElectionType onSave={(name) => post("/admin/election-type", { name })} onDelete={(id) => api(`/admin/election-type/${id}`, { method: "DELETE", headers: authHeaders() }).then(() => { addToast("Categoría eliminada", "success"); setRefreshTrigger(prev => prev + 1); })} refreshKey={refreshTrigger} />}
            {module === 'regions' && <CreateRegion onSave={(data) => post("/admin/region", data)} onDelete={(id) => api(`/admin/region/${id}`, { method: "DELETE", headers: authHeaders() }).then(() => { addToast("Ámbito eliminado", "success"); setRefreshTrigger(prev => prev + 1); })} refreshKey={refreshTrigger} />}
            {module === 'elections' && <CreateElection onSave={(data) => post("/admin/election", data)} />}
            {module === 'candidates' && <CreateCandidate onSave={(data) => post("/admin/candidate", data)} />}
            {module === 'presidenciales' && (
              <CategoryElectionManager
                categoryId="presidenciales"
                categoryLabel="Presidenciales"
                filterFn={(e: any) => (e.election_type || '').toLowerCase().includes('presidencial') || e.title.toLowerCase().includes('presidencial')}
                refreshKey={refreshTrigger}
                onSave={(data: any) => post("/admin/election", data)}
                onDeleteElection={(id: string) => api(`/admin/election/${id}`, { method: "DELETE", headers: authHeaders() }).then(() => { addToast("Proceso eliminado", "success"); setRefreshTrigger(prev => prev + 1); })}
                onClose={(id: string) => api(`/admin/election/${id}/close`, { method: "PUT", headers: authHeaders() }).then(() => { addToast("Proceso finalizado", "info"); setRefreshTrigger(prev => prev + 1); })}
              />
            )}
            {module === 'alcaldia_lima' && (
              <CategoryElectionManager
                categoryId="alcaldia_lima"
                categoryLabel="Alcaldía de Lima"
                filterFn={(e: any) => {
                  const title = e.title.toLowerCase();
                  return title.includes('alcaldía de lima') || title.includes('alcaldia de lima') || title.includes('lima metropolitana');
                }}
                refreshKey={refreshTrigger}
                onSave={(data: any) => post("/admin/election", data)}
                onDeleteElection={(id: string) => api(`/admin/election/${id}`, { method: "DELETE", headers: authHeaders() }).then(() => { addToast("Proceso eliminado", "success"); setRefreshTrigger(prev => prev + 1); })}
                onClose={(id: string) => api(`/admin/election/${id}/close`, { method: "PUT", headers: authHeaders() }).then(() => { addToast("Proceso finalizado", "info"); setRefreshTrigger(prev => prev + 1); })}
              />
            )}
            {module === 'regionales' && (
              <CategoryElectionManager
                categoryId="regionales"
                categoryLabel="Regionales"
                filterFn={(e: any) => (e.election_type || '').toLowerCase().includes('regional')}
                refreshKey={refreshTrigger}
                onSave={(data: any) => post("/admin/election", data)}
                onDeleteElection={(id: string) => api(`/admin/election/${id}`, { method: "DELETE", headers: authHeaders() }).then(() => { addToast("Proceso eliminado", "success"); setRefreshTrigger(prev => prev + 1); })}
                onClose={(id: string) => api(`/admin/election/${id}/close`, { method: "PUT", headers: authHeaders() }).then(() => { addToast("Proceso finalizado", "info"); setRefreshTrigger(prev => prev + 1); })}
              />
            )}
            {module === 'lima_distritos' && (
              <CategoryElectionManager
                categoryId="lima_distritos"
                categoryLabel="Distritos de Lima"
                filterFn={(e: any) => {
                  const title = e.title.toLowerCase();
                  const type = (e.election_type || '').toLowerCase();
                  return type.includes('distrital') && !title.includes('callao') && !title.includes('ventanilla') && !title.includes('perla') && !title.includes('punta') && !title.includes('bellavista') && !title.includes('carmen de la legua');
                }}
                refreshKey={refreshTrigger}
                onSave={(data: any) => post("/admin/election", data)}
                onDeleteElection={(id: string) => api(`/admin/election/${id}`, { method: "DELETE", headers: authHeaders() }).then(() => { addToast("Proceso eliminado", "success"); setRefreshTrigger(prev => prev + 1); })}
                onClose={(id: string) => api(`/admin/election/${id}/close`, { method: "PUT", headers: authHeaders() }).then(() => { addToast("Proceso finalizado", "info"); setRefreshTrigger(prev => prev + 1); })}
              />
            )}
            {module === 'callao' && (
              <CategoryElectionManager
                categoryId="callao"
                categoryLabel="Callao"
                filterFn={(e: any) => {
                  const title = e.title.toLowerCase();
                  return title.includes('callao') || title.includes('ventanilla') || title.includes('perla') || title.includes('punta') || title.includes('bellavista') || title.includes('carmen de la legua');
                }}
                refreshKey={refreshTrigger}
                onSave={(data: any) => post("/admin/election", data)}
                onDeleteElection={(id: string) => api(`/admin/election/${id}`, { method: "DELETE", headers: authHeaders() }).then(() => { addToast("Proceso eliminado", "success"); setRefreshTrigger(prev => prev + 1); })}
                onClose={(id: string) => api(`/admin/election/${id}/close`, { method: "PUT", headers: authHeaders() }).then(() => { addToast("Proceso finalizado", "info"); setRefreshTrigger(prev => prev + 1); })}
              />
            )}
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}

function ElectionManagement({ onClose, onDeleteElection, onDeleteCandidate, refreshKey }: { 
  onClose: (id: string) => void, 
  onDeleteElection: (id: string) => void,
  onDeleteCandidate: (id: string) => void, 
  refreshKey: number 
}) {
  const [allElections, setAllElections] = useState<any[]>([]);
  const [candidatesMap, setCandidatesMap] = useState<Record<string, any[]>>({});
  const [winnersMap, setWinnersMap] = useState<Record<string, any>>({});
  const [category, setCategory] = useState("all");
  const [editElection, setEditElection] = useState<any>(null);
  const [editCandidate, setEditCandidate] = useState<any>(null);

  const [modal, setModal] = useState<{ isOpen: boolean, type: 'election' | 'candidate' | 'comment' | 'vote', id: string, extraId?: string } | null>(null);

  const refresh = () => {
    api<any[]>("/admin/elections", { headers: authHeaders() }).then(setAllElections).catch(() => {});
  };

  useEffect(() => {
    refresh();
  }, [refreshKey]);

  useEffect(() => {
    if (allElections.length > 0) {
      allElections.forEach(e => {
        api<any>(`/results/${e.id}`).then(res => {
          if (res.ranking && res.ranking.length > 0) {
            setWinnersMap(prev => ({ ...prev, [e.id]: res.ranking[0] }));
          }
        }).catch(() => {});
      });
    }
  }, [allElections]);

  const loadCandidates = (id: string) => {
    api<Candidate[]>(`/elections/${id}/candidates`).then(list => {
      setCandidatesMap(prev => ({ ...prev, [id]: list }));
    });
  };

  const filteredElections = allElections.filter(e => {
    const title = e.title.toLowerCase();
    const type = (e.election_type || "").toLowerCase();
    switch (category) {
      case "presidencial": return type.includes("presidencial") || title.includes("presidencial");
      case "regionales": return type.includes("regional") || title.includes("regional");
      case "lima": return title.includes("alcaldía de lima") || title.includes("lima");
      case "lima_distritos": return type.includes("distrital") && !title.includes("callao") && !title.includes("ventanilla");
      case "callao": return title.includes("callao") || title.includes("ventanilla") || title.includes("perla") || title.includes("punta");
      default: return true;
    }
  });

  const categories = [
    { id: "all", label: "Todos" },
    { id: "presidencial", label: "Presidencial" },
    { id: "regionales", label: "Regionales" },
    { id: "lima", label: "Alcaldía de Lima" },
    { id: "lima_distritos", label: "Distritos de Lima" },
    { id: "callao", label: "Callao" },
  ];

  return (
    <div className="space-y-12">
      <Modal 
        isOpen={!!modal}
        onClose={() => setModal(null)}
        isDanger={true}
        title={modal?.type === 'election' ? "¿ELIMINAR PROCESO ELECTORAL?" : "¿REMOVER CANDIDATO?"}
        message={modal?.type === 'election' 
          ? "¿ESTÁ COMPLETAMENTE SEGURO? Esta acción eliminará la elección, todos sus candidatos y todos los votos registrados de forma permanente."
          : "¿Desea remover a este candidato de la contienda electoral? Los votos asociados también serán eliminados."}
        confirmText={modal?.type === 'election' ? "Eliminar Todo" : "Remover Candidato"}
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

      <div className="flex flex-wrap gap-4 border-b border-slate-100 pb-10">
        {categories.map(c => (
          <button 
            key={c.id} 
            onClick={() => setCategory(c.id)}
            className={`text-[10px] font-black uppercase tracking-[0.2em] px-6 py-3 transition-all ${
              category === c.id ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:text-black hover:bg-white'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="grid gap-8">
        {filteredElections.map(e => (
          <div key={e.id} className="bg-white p-10 transition-all border border-slate-100 group">
            <div className="flex justify-between items-start">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <h3 className="font-black text-2xl text-black tracking-tighter uppercase">{e.title}</h3>
                  <span className={`px-2 py-1 text-[8px] font-black uppercase tracking-[0.2em] ${e.is_active ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-50 text-slate-400 border border-slate-100'}`}>
                    {e.is_active ? 'EN VIVO' : 'CERRADO'}
                  </span>
                </div>
                <div className="flex gap-8 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">
                  <span>ÁMBITO: <span className="text-black">{e.region_name || "NACIONAL"}</span></span>
                  <span>CATEGORÍA: <span className="text-black">{e.election_type}</span></span>
                </div>
                {winnersMap[e.id] && (
                  <div className="flex items-center gap-4 bg-emerald-50/30 p-4 border-l-4 border-emerald-600">
                    <div className="h-1.5 w-1.5 bg-emerald-600 rounded-full"></div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700">Líder:</span>
                    <span className="text-[12px] font-black uppercase text-black tracking-tight">{winnersMap[e.id].name}</span>
                    <span className="text-[11px] font-mono font-bold text-emerald-600">{winnersMap[e.id].votes} VOTOS</span>
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-3">
                <button className="px-6 py-3 bg-slate-100 text-black text-[10px] font-black uppercase tracking-[0.2em] hover:bg-black hover:text-white transition-all" onClick={() => setEditElection(e)}>Editar Proceso</button>
                <button className="px-6 py-3 bg-black text-white text-[10px] font-black uppercase tracking-[0.2em] hover:bg-emerald-600 transition-all" onClick={() => loadCandidates(e.id)}>Gestión Candidatos</button>
                {e.slug && (
                  <button 
                    className="px-6 py-3 bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-emerald-600 hover:text-white transition-all border border-emerald-100"
                    onClick={() => { navigator.clipboard.writeText(`${window.location.origin.replace(':3001', ':3000')}/vote/${e.slug}`); }}
                  >
                    📋 Copiar Link Único
                  </button>
                )}
                {e.is_active && (
                  <button className="px-6 py-3 border border-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-[0.2em] hover:border-red-500 hover:text-red-500 transition-colors" onClick={() => onClose(e.id)}>Finalizar Proceso</button>
                )}
                <button className="px-6 py-3 border border-red-100 text-red-500 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-red-600 hover:text-white transition-all" onClick={() => setModal({ isOpen: true, type: 'election', id: e.id })}>Eliminar Permanente</button>
              </div>
            </div>
            {candidatesMap[e.id] && (
              <div className="mt-12 grid gap-3 border-t border-slate-50 pt-10 animate-in fade-in slide-in-from-top-4 duration-500">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 mb-4">Registro de Candidatos</p>
                {candidatesMap[e.id].map(c => (
                  <div key={c.id} className="flex justify-between items-center bg-slate-50/50 p-5 transition-colors border border-transparent">
                    <div className="flex items-center gap-6">
                      {c.image_url && <img src={getImageUrl(c.image_url)} className="w-12 h-12 object-cover grayscale group-hover:grayscale-0 transition-all" alt="" />}
                      <div className="flex flex-col">
                        <span className="text-xs font-black uppercase tracking-tight text-black">{c.name}</span>
                        {c.description && <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest truncate max-w-[200px]">{c.description}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <button className="text-emerald-700 hover:text-black text-[9px] font-black uppercase tracking-widest transition-colors bg-emerald-50 px-2 py-1 border border-emerald-100" onClick={() => setModal({ isOpen: true, type: 'vote', id: c.id, extraId: e.id })}>+ Votos</button>
                      <button className="text-emerald-600 hover:text-black text-[9px] font-black uppercase tracking-widest transition-colors" onClick={() => setModal({ isOpen: true, type: 'comment', id: c.id })}>+ Comentar</button>
                      <button className="text-blue-600 hover:text-black text-[9px] font-black uppercase tracking-widest transition-colors" onClick={() => setEditCandidate(c)}>Editar</button>
                      <button className="text-slate-300 hover:text-red-600 text-[9px] font-black uppercase tracking-widest transition-colors" onClick={() => setModal({ isOpen: true, type: 'candidate', id: c.id, extraId: e.id })}>Remover</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {editElection && (
        <div className="absolute inset-0 bg-white z-40 overflow-auto p-12 lg:p-24 border-l border-slate-100">
          <button className="mb-12 text-[10px] font-black uppercase tracking-widest" onClick={() => setEditElection(null)}>← Volver al Dashboard</button>
          <div className="max-w-4xl mx-auto">
            <CreateElection 
              isEdit={true} 
              initialData={editElection} 
              onSave={(data) => api(`/admin/election/${editElection.id}`, { method: "PUT", headers: authHeaders(), body: JSON.stringify(data) }).then(() => { setEditElection(null); refresh(); })} 
            />
          </div>
        </div>
      )}

      {editCandidate && (
        <div className="absolute inset-0 bg-white z-40 overflow-auto p-12 lg:p-24 border-l border-slate-100">
          <button className="mb-12 text-[10px] font-black uppercase tracking-widest" onClick={() => setEditCandidate(null)}>← Volver al Dashboard</button>
          <div className="max-w-4xl mx-auto">
            <CreateCandidate 
              isEdit={true} 
              initialData={editCandidate} 
              onSave={(data) => api(`/admin/candidate/${editCandidate.id}`, { method: "PUT", headers: authHeaders(), body: JSON.stringify(data) }).then(() => { setEditCandidate(null); refresh(); })} 
            />
          </div>
        </div>
      )}

      {modal?.type === 'vote' && (
        <div className="fixed inset-0 bg-black/50 z-[300] flex items-center justify-center p-6 backdrop-blur-sm">
          <div className="bg-white w-full max-w-sm p-12 border border-slate-100 shadow-2xl">
            <h3 className="text-xl font-black mb-2 tracking-tighter uppercase">Inyectar Votos</h3>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-8">Operación de sobreescritura administrativa</p>
            <div className="space-y-6 mb-8">
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Cantidad de Votos</label>
                <input 
                  type="number"
                  className="w-full border border-slate-100 bg-slate-50 px-6 py-5 text-[14px] font-black tracking-widest outline-none focus:border-emerald-600 focus:bg-white transition-all" 
                  placeholder="Ej: 100" 
                  id="admin-vote-count"
                  defaultValue="1"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <button 
                className="flex-grow bg-emerald-600 text-white py-5 text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all"
                onClick={() => {
                  const count = parseInt((document.getElementById('admin-vote-count') as HTMLInputElement).value);
                  if (isNaN(count) || count < 1) return;
                  api(`/admin/add-vote`, { 
                    method: "POST", 
                    headers: authHeaders(),
                    body: JSON.stringify({ election_id: modal.extraId, candidate_id: modal.id, count }) 
                  })
                  .then(() => { setModal(null); refresh(); })
                  .catch(e => console.error(e));
                }}
              >
                Confirmar Adición
              </button>
              <button className="px-8 py-5 border border-slate-100 text-[10px] font-black uppercase tracking-widest" onClick={() => setModal(null)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {modal?.type === 'comment' && (
        <div className="fixed inset-0 bg-black/50 z-[300] flex items-center justify-center p-6 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg p-12 border border-slate-100 shadow-2xl">
            <h3 className="text-xl font-black mb-8 tracking-tighter uppercase">Nuevo Comentario Oficial</h3>
            <textarea 
              className="w-full border border-slate-100 bg-slate-50 px-6 py-5 text-[11px] font-bold uppercase tracking-widest outline-none focus:border-emerald-600 focus:bg-white transition-all min-h-[150px] mb-8" 
              placeholder="Escriba el comentario aquí..." 
              id="admin-comment-content"
            />
            <div className="flex gap-4">
              <button 
                className="flex-grow bg-black text-white py-5 text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all"
                onClick={() => {
                  const content = (document.getElementById('admin-comment-content') as HTMLTextAreaElement).value;
                  api(`/comments`, { method: "POST", body: JSON.stringify({ candidate_id: modal.id, content }) })
                    .then(() => { setModal(null); })
                    .catch(e => console.error(e));
                }}
              >
                Publicar Comentario
              </button>
              <button className="px-8 py-5 border border-slate-100 text-[10px] font-black uppercase tracking-widest" onClick={() => setModal(null)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CreateElectionType({ onSave, onDelete, refreshKey }: { onSave: (name: string) => void, onDelete?: (id: string) => void, refreshKey?: number }) {
  const [name, setName] = useState("");
  const [list, setList] = useState<any[]>([]);
  const loadList = () => { api<any[]>("/election-types").then(setList).catch(() => {}); };
  useEffect(() => { loadList(); }, [refreshKey]);
  return (
    <div className="space-y-16">
      <section className="bg-white p-12 border border-slate-100">
        <h2 className="text-2xl font-black mb-10 tracking-tighter uppercase">Nuevo Tipo de Elección</h2>
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500">Definición de Categoría</label>
            <input className="w-full border border-slate-100 bg-slate-50 px-6 py-5 text-[11px] font-bold uppercase tracking-widest outline-none focus:border-emerald-600 focus:bg-white transition-all" placeholder="Ej: Presidencial, Legislativa, Municipal" onChange={e => setName(e.target.value)} />
          </div>
          <button className="w-full bg-black text-white px-4 py-6 text-[11px] font-black uppercase tracking-[0.4em] hover:bg-emerald-600 transition-all" onClick={() => onSave(name)}>Registrar en Sistema</button>
        </div>
      </section>
      <section>
        <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-500 mb-10">Categorías Disponibles</h3>
        <div className="grid gap-3">
          {list.map(t => (
            <div key={t.id} className="flex justify-between items-center p-6 bg-white border border-slate-100 text-[11px] font-black uppercase tracking-widest">
              <span className="text-black">{t.name}</span>
              <div className="flex items-center gap-4">
                {onDelete && (
                  <button 
                    className="bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all text-[9px] font-black uppercase tracking-widest px-4 py-2 border border-red-100"
                    onClick={() => onDelete(t.id)}
                  >
                    Eliminar
                  </button>
                )}
                <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full"></span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function CreateRegion({ onSave, onDelete, refreshKey }: { onSave: (d: any) => void, onDelete?: (id: string) => void, refreshKey?: number }) {
  const [d, setD] = useState<any>({ level: "region" });
  const [list, setList] = useState<any[]>([]);
  const loadList = () => { api<any[]>("/regions").then(setList).catch(() => {}); };
  useEffect(() => { loadList(); }, [refreshKey]);
  return (
    <div className="space-y-16">
      <section className="bg-white p-12 border border-slate-200">
        <h2 className="text-2xl font-black mb-10 tracking-tighter uppercase">Geolocalización Electoral</h2>
        <div className="space-y-8">
          <div className="space-y-2">
            <label className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500">Nombre del Ámbito</label>
            <input className="w-full border border-slate-100 bg-slate-50 px-6 py-5 text-[11px] font-bold uppercase tracking-widest outline-none focus:border-emerald-600 focus:bg-white transition-all" placeholder="Nombre de la Región/Distrito" onChange={e => setD({ ...d, name: e.target.value })} />
          </div>
          <div className="space-y-2">
            <label className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500">Nivel de Jurisdicción</label>
            <select className="w-full border border-slate-100 bg-slate-50 px-6 py-5 text-[11px] font-bold uppercase tracking-widest outline-none focus:border-emerald-600 focus:bg-white transition-all appearance-none" onChange={e => setD({ ...d, level: e.target.value })} value={d.level}>
              <option value="country">Nacional</option>
              <option value="region">Regional</option>
              <option value="province">Provincial</option>
              <option value="district">Distrital</option>
            </select>
          </div>
          <button className="w-full bg-black text-white px-4 py-6 text-[11px] font-black uppercase tracking-[0.4em] hover:bg-emerald-600 transition-all" onClick={() => onSave(d)}>Guardar Ámbito Oficial</button>
        </div>
      </section>
      <section>
        <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-500 mb-10">Ámbitos Operativos</h3>
        <div className="grid gap-3 text-[10px] font-black uppercase tracking-widest">
          {list.map(r => (
            <div key={r.id} className="flex justify-between items-center p-6 bg-white border border-slate-100">
              <div className="flex gap-6 items-center">
                <span className="text-emerald-600 bg-emerald-50 px-2 py-1 text-[8px]">{r.level}</span>
                <span className="text-black">{r.name}</span>
              </div>
              {onDelete && (
                <button 
                  className="text-slate-300 hover:text-red-600 transition-colors text-[9px] font-black uppercase tracking-widest"
                  onClick={() => onDelete(r.id)}
                >
                  Eliminar
                </button>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function CreateElection({ onSave, isEdit, initialData }: { onSave: (d: any) => void, isEdit?: boolean, initialData?: any }) {
  const [d, setD] = useState<any>(initialData || { 
    is_active: true,
    banner_url: "",
    description: ""
  });
  const [file, setFile] = useState<File | null>(null);
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
  return (
    <div className="space-y-16">
      <section className="bg-white p-12 border border-slate-100">
        <h2 className="text-2xl font-black mb-12 tracking-tighter uppercase">
          {isEdit ? `Editando: ${initialData?.title}` : 'Aperturar Nuevo Proceso'}
        </h2>
        <div className="space-y-10">
          <div className="space-y-2">
            <label className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500">Nombre Oficial del Proceso</label>
            <input className="w-full border border-slate-100 bg-slate-50 px-6 py-5 text-[11px] font-bold uppercase tracking-widest outline-none focus:border-emerald-600 focus:bg-white transition-all" placeholder="Ej: Elecciones Regionales 2026" value={d.title || ""} onChange={e => setD({ ...d, title: e.target.value })} />            <label className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500">Descripción / Resumen del Proceso</label>
            <textarea 
              className="w-full border border-slate-100 bg-slate-50 px-6 py-5 text-[11px] font-bold uppercase tracking-widest outline-none focus:border-emerald-600 focus:bg-white transition-all min-h-[120px]" 
              placeholder="Describa el propósito y contexto de esta elección..." 
              value={d.description || ""}
              onChange={e => setD({ ...d, description: e.target.value })}
            />
          </div>

          <div className="flex items-center gap-6 bg-slate-50 p-6 border border-slate-100">
            <input 
              type="checkbox" 
              checked={d.is_active} 
              onChange={e => setD({ ...d, is_active: e.target.checked })}
              className="h-5 w-5 accent-emerald-600"
            />
            <span className="text-[10px] font-black uppercase tracking-widest text-black">Proceso Activo (Visible al público)</span>
          </div>

          <div className="bg-slate-50 border-2 border-dashed border-slate-200 p-12 transition-all hover:border-emerald-500 group">
            <div className="flex flex-col md:flex-row items-center gap-12">
              <div className="h-64 w-full md:w-96 bg-white border border-slate-100 flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                {(file || d.banner_url) ? (
                  <img src={file ? URL.createObjectURL(file) : getImageUrl(d.banner_url)} className="w-full h-full object-contain bg-slate-50" alt="Preview" />
                ) : (
                  <div className="flex flex-col items-center gap-4 text-slate-300">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                    <span className="text-[9px] font-black uppercase tracking-[0.2em]">Sin Imagen de Portada</span>
                  </div>
                )}
              </div>
              <div className="flex-grow space-y-6">
                <div>
                  <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-black mb-2">Imagen de Portada (Banner)</h3>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500 leading-relaxed">
                    Esta imagen aparecerá debajo del título principal en la página del proceso. Se recomienda un formato panorámico (16:9).
                  </p>
                </div>
                <input 
                  type="file" 
                  accept="image/*"
                  className="block w-full text-[10px] text-slate-500 font-bold uppercase file:mr-6 file:py-3 file:px-6 file:border-0 file:text-[10px] file:font-black file:uppercase file:bg-black file:text-white hover:file:bg-emerald-600 transition-all cursor-pointer" 
                  onChange={e => setFile(e.target.files?.[0] || null)} 
                />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500">Tipo de Proceso</label>
              <select className="w-full border border-slate-100 bg-slate-50 px-6 py-5 text-[11px] font-bold uppercase tracking-widest outline-none focus:border-emerald-600 focus:bg-white transition-all appearance-none" onChange={e => setD({ ...d, election_type_id: e.target.value, region_id: null })} value={d.election_type_id || d.election_type || ""}>
                <option value="">Seleccione Categoría</option>
                {types.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            {showRegionSelect && (
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500">Ámbito de Aplicación</label>
                <select className="w-full border border-slate-100 bg-slate-50 px-6 py-5 text-[11px] font-bold uppercase tracking-widest outline-none focus:border-emerald-600 focus:bg-white transition-all appearance-none" onChange={e => setD({ ...d, region_id: e.target.value || null })} value={d.region_id || d.region_name || ""}>
                  <option value="">Seleccione Ámbito</option>
                  {filteredRegions.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
              </div>
            )}
          </div>
          <div className="space-y-2">
            <label className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500">Fecha y Hora de Clausura</label>
            <input className="w-full border border-slate-100 bg-slate-50 px-6 py-5 text-[11px] font-bold uppercase tracking-widest outline-none focus:border-emerald-600 focus:bg-white transition-all" type="datetime-local" value={d.end_date ? new Date(d.end_date).toISOString().slice(0, 16) : ""} onChange={e => setD({ ...d, end_date: new Date(e.target.value).toISOString() })} />
          </div>
          <button 
            className="w-full bg-black text-white px-4 py-6 text-[11px] font-black uppercase tracking-[0.4em] hover:bg-emerald-600 transition-all" 
            onClick={async () => {
              let bannerUrl = d.banner_url;
              if (file) {
                try {
                  bannerUrl = await uploadImage(file);
                } catch (e: any) {
                  alert("Error al subir banner: " + e.message);
                  return;
                }
              }
              const payload = { ...d, banner_url: bannerUrl };
              onSave(payload);
            }}
          >
            {isEdit ? 'Guardar Cambios Oficiales' : 'Lanzar Proceso Oficial'}
          </button>
        </div>
      </section>
    </div>
  );
}

function CreateCandidate({ onSave, isEdit, initialData }: { onSave: (d: any) => void, isEdit?: boolean, initialData?: any }) {
  const [d, setD] = useState<any>(initialData || {});
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [elections, setElections] = useState<any[]>([]);
  useEffect(() => { api<Election[]>("/admin/elections", { headers: authHeaders() }).then(setElections).catch(() => {}); }, []);
  const handleSave = async () => {
    if (!file && !d.image_url) { alert("Por favor seleccione una foto"); return; }
    if (!d.election_id && !isEdit) { alert("Por favor seleccione una elección"); return; }
    try {
      setUploading(true);
      let url = d.image_url;
      if (file) {
        url = await uploadImage(file);
      }
      onSave({ ...d, image_url: url });
      setFile(null);
    } catch (e: any) { alert("Error al subir foto: " + e.message); } finally { setUploading(false); }
  };
  return (
    <div className="space-y-16">
      <section className="bg-white p-12 border border-slate-100">
        <h2 className="text-2xl font-black mb-12 tracking-tighter uppercase">
          {isEdit ? `Editando: ${initialData?.name}` : 'Inscripción de Candidato'}
        </h2>
        <div className="space-y-10">
          <div className="space-y-2">
            <label className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500">Nombre del Candidato / Organización</label>
            <input className="w-full border border-slate-100 bg-slate-50 px-6 py-5 text-[11px] font-bold uppercase tracking-widest outline-none focus:border-emerald-600 focus:bg-white transition-all" placeholder="Nombre Completo" value={d.name || ""} onChange={e => setD({ ...d, name: e.target.value })} />
          </div>

          <div className="space-y-2">
            <label className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500">Eslogan / Breve Descripción</label>
            <textarea 
              className="w-full border border-slate-100 bg-slate-50 px-6 py-5 text-[11px] font-bold uppercase tracking-widest outline-none focus:border-emerald-600 focus:bg-white transition-all min-h-[100px]" 
              placeholder="Ej: Por un futuro mejor..." 
              value={d.description || ""}
              onChange={e => setD({ ...d, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500">Texto del Botón (Opcional)</label>
              <input className="w-full border border-slate-100 bg-slate-50 px-6 py-5 text-[11px] font-bold uppercase tracking-widest outline-none focus:border-emerald-600 focus:bg-white transition-all" placeholder="Ej: Ver Propuestas" value={d.button_text || ""} onChange={e => setD({ ...d, button_text: e.target.value })} />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500">Enlace del Botón (Opcional)</label>
              <input className="w-full border border-slate-100 bg-slate-50 px-6 py-5 text-[11px] font-bold uppercase tracking-widest outline-none focus:border-emerald-600 focus:bg-white transition-all" placeholder="https://..." value={d.button_url || ""} onChange={e => setD({ ...d, button_url: e.target.value })} />
            </div>
          </div>

          <div className="bg-slate-50/50 p-8 border border-dashed border-slate-100">
            <label className="block text-[9px] font-black uppercase tracking-[0.3em] text-slate-500 mb-6">Fotografía Oficial</label>
            <div className="flex items-center gap-10">
              <div className="h-24 w-24 bg-white border border-slate-100 flex items-center justify-center overflow-hidden shrink-0">
                {(file || d.image_url) ? <img src={file ? URL.createObjectURL(file) : getImageUrl(d.image_url)} className="w-full h-full object-cover" alt="Preview" /> : <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-100"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>}
              </div>
              <input type="file" accept="image/*" className="w-full text-[10px] font-bold tracking-widest outline-none transition-all file:mr-6 file:py-3 file:px-6 file:border-0 file:text-[10px] file:font-black file:uppercase file:bg-black file:text-white hover:file:bg-emerald-600 transition-all cursor-pointer" onChange={e => setFile(e.target.files?.[0] || null)} />
            </div>
          </div>
          {!isEdit && (
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500">Vincular a Proceso Electoral</label>
              <select className="w-full border border-slate-100 bg-slate-50 px-6 py-5 text-[11px] font-bold uppercase tracking-widest outline-none focus:border-emerald-600 focus:bg-white transition-all appearance-none" onChange={e => setD({ ...d, election_id: e.target.value })} value={d.election_id || ""}>
                <option value="">Seleccione Proceso</option>
                {elections.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
              </select>
            </div>
          )}
          <button className="w-full bg-black text-white px-4 py-6 text-[11px] font-black uppercase tracking-[0.4em] hover:bg-emerald-600 transition-all shadow-xl" onClick={handleSave} disabled={uploading}>
            {uploading ? "Transmitiendo Datos..." : (isEdit ? "Guardar Cambios Oficiales" : "Finalizar Inscripción")}
          </button>
        </div>
      </section>
    </div>
  );
}

function CategoryElectionManager({ categoryId, categoryLabel, filterFn, refreshKey, onSave, onDeleteElection, onClose }: {
  categoryId: string;
  categoryLabel: string;
  filterFn: (e: any) => boolean;
  refreshKey: number;
  onSave: (data: any) => void;
  onDeleteElection: (id: string) => void;
  onClose: (id: string) => void;
}) {
  const [allElections, setAllElections] = useState<any[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    api<any[]>("/admin/elections", { headers: authHeaders() }).then(setAllElections).catch(() => {});
  }, [refreshKey]);

  const filtered = allElections.filter(filterFn);

  const copyLink = (slug: string) => {
    const frontendOrigin = typeof window !== 'undefined' ? window.location.origin.replace(':3001', ':3000') : 'http://localhost:3000';
    navigator.clipboard.writeText(`${frontendOrigin}/vote/${slug}`);
    setCopied(slug);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="space-y-12">
      <div className="flex justify-between items-center">
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">
          {filtered.length} proceso(s) en {categoryLabel}
        </p>
        <button
          className="px-8 py-4 bg-black text-white text-[10px] font-black uppercase tracking-[0.3em] hover:bg-emerald-600 transition-all"
          onClick={() => setShowCreate(!showCreate)}
        >
          {showCreate ? "Cerrar Formulario" : `+ Nuevo Proceso ${categoryLabel}`}
        </button>
      </div>

      {showCreate && (
        <CreateElection onSave={(data) => { onSave(data); setShowCreate(false); }} />
      )}

      <div className="grid gap-6">
        {filtered.map(e => (
          <div key={e.id} className="bg-white p-8 border border-slate-100 hover:border-emerald-200 transition-all">
            <div className="flex justify-between items-start">
              <div className="space-y-4 flex-grow">
                <div className="flex items-center gap-4">
                  <h3 className="font-black text-xl text-black tracking-tighter uppercase">{e.title}</h3>
                  <span className={`px-2 py-1 text-[8px] font-black uppercase tracking-[0.2em] ${e.is_active ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-50 text-slate-400 border border-slate-100'}`}>
                    {e.is_active ? 'EN VIVO' : 'CERRADO'}
                  </span>
                </div>
                <div className="flex gap-8 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">
                  <span>ÁMBITO: <span className="text-black">{e.region_name || "NACIONAL"}</span></span>
                  <span>CATEGORÍA: <span className="text-black">{e.election_type}</span></span>
                </div>

                {e.slug && (
                  <div className="flex items-center gap-3 bg-slate-50 p-4 border border-slate-100 mt-4">
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">LINK ÚNICO:</span>
                    <code className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-3 py-1 border border-emerald-100 flex-grow truncate">
                      {typeof window !== 'undefined' ? window.location.origin.replace(':3001', ':3000') : 'http://localhost:3000'}/vote/{e.slug}
                    </code>
                    <button 
                      className={`px-4 py-2 text-[9px] font-black uppercase tracking-widest transition-all ${copied === e.slug ? 'bg-emerald-600 text-white' : 'bg-black text-white hover:bg-emerald-600'}`}
                      onClick={() => copyLink(e.slug)}
                    >
                      {copied === e.slug ? '✓ COPIADO' : '📋 COPIAR'}
                    </button>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-3 ml-8 shrink-0">
                {e.is_active && (
                  <button className="px-6 py-3 border border-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-[0.2em] hover:border-red-500 hover:text-red-500 transition-colors" onClick={() => onClose(e.id)}>Finalizar</button>
                )}
                <button className="px-6 py-3 border border-red-100 text-red-500 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-red-600 hover:text-white transition-all" onClick={() => onDeleteElection(e.id)}>Eliminar Permanente</button>
              </div>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-20 text-slate-400 text-[11px] font-bold uppercase tracking-widest italic">
            No hay procesos registrados en {categoryLabel}. Cree uno nuevo con el botón de arriba.
          </div>
        )}
      </div>
    </div>
  );
}
