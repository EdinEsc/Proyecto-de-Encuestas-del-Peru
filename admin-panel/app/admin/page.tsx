"use client";

import { useEffect, useState } from "react";
import { api, authHeaders } from "@/lib/api";

export default function AdminPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState(typeof window !== "undefined" ? localStorage.getItem("admin_token") || "" : "");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  async function login() {
    setLoading(true);
    try {
      const r = await api<{ token: string }>("/admin/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      localStorage.setItem("admin_token", r.token);
      setToken(r.token);
      setMsg("Login correcto");
    } catch (e: any) {
      setMsg(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function post(path: string, data: any) {
    setLoading(true);
    try {
      await api(path, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(data),
      });
      setMsg("Guardado correctamente");
    } catch (e: any) {
      setMsg(e.message);
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <div className="rounded-xl min-h-[calc(100vh-4rem)] flex items-center justify-center bg-ink-50 dark:bg-ink-950 px-4">
        <div className="rounded-xl w-full max-w-md premium-card p-8 bg-white dark:bg-ink-900">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-ink-900 dark:text-white">Panel de Control</h1>
            <p className="text-ink-500 dark:text-ink-400 mt-2">Ingresa tus credenciales de administrador</p>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-ink-700 dark:text-ink-300 mb-1 block">Correo Electrónico</label>
              <input 
                className="w-full rounded-xl border border-ink-200 bg-ink-50 px-4 py-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all dark:border-ink-800 dark:bg-ink-800/50 dark:text-white" 
                placeholder="admin@votaciones.local" 
                onChange={e => setEmail(e.target.value)} 
              />
            </div>
            <div>
              <label className="text-sm font-medium text-ink-700 dark:text-ink-300 mb-1 block">Contraseña</label>
              <input 
                className="w-full rounded-xl border border-ink-200 bg-ink-50 px-4 py-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all dark:border-ink-800 dark:bg-ink-800/50 dark:text-white" 
                type="password" 
                placeholder="••••••••" 
                onChange={e => setPassword(e.target.value)} 
              />
            </div>
            <button 
              className="w-full btn-primary mt-6" 
              onClick={login}
              disabled={loading}
            >
              {loading ? "Iniciando..." : "Ingresar al Panel"}
            </button>
            
            {msg && (
              <p className={`mt-4 text-center text-sm font-medium ${msg.includes('correcto') ? 'text-green-600' : 'text-red-600'}`}>
                {msg}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl min-h-screen bg-ink-50 dark:bg-ink-950 py-12">
      <main className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-ink-900 dark:text-white">Administración Central</h1>
            <p className="text-ink-500 dark:text-ink-400 mt-1">Gestiona los procesos electorales de la plataforma.</p>
          </div>
          <button 
            className="inline-flex items-center justify-center rounded-xl border border-ink-200 bg-white px-4 py-2 text-sm font-medium text-red-600 shadow-sm transition-all hover:bg-red-50 dark:border-ink-800 dark:bg-ink-900 dark:hover:bg-red-900/10" 
            onClick={() => { localStorage.removeItem("admin_token"); setToken(""); }}
          >
            Cerrar Sesión
          </button>
        </div>

        {msg && (
          <div className={`mb-8 p-4 rounded-xl border ${msg.includes('correcto') || msg.includes('Guardado') ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'} dark:bg-ink-900 dark:border-ink-800`}>
            {msg}
          </div>
        )}

        <div className="grid lg:grid-cols-4 gap-8">
          <aside className="lg:col-span-1 space-y-6">
            <div className="rounded-xl premium-card p-6 bg-ink-900 text-white dark:bg-ink-900">
              <h3 className="font-bold mb-4">Guía Rápida</h3>
              <ul className="space-y-3 text-sm text-ink-300">
                <li className="flex gap-2"><span className="text-primary font-bold">1.</span> Define el Tipo de Elección.</li>
                <li className="flex gap-2"><span className="text-primary font-bold">2.</span> Crea la Región o ámbito.</li>
                <li className="flex gap-2"><span className="text-primary font-bold">3.</span> Configura la Elección.</li>
                <li className="flex gap-2"><span className="text-primary font-bold">4.</span> Agrega a los Candidatos.</li>
              </ul>
            </div>
          </aside>

          <div className="lg:col-span-3 space-y-8">
            <div className="grid md:grid-cols-2 gap-8">
              <CreateElectionType onSave={(name) => post("/admin/election-type", { name })} />
              <CreateRegion onSave={(data) => post("/admin/region", data)} />
              <CreateElection onSave={(data) => post("/admin/election", data)} />
              <CreateCandidate onSave={(data) => post("/admin/candidate", data)} />
            </div>
            
            <div className="mt-12">
              <h2 className="text-2xl font-bold text-ink-900 dark:text-white mb-6">Gestión de Procesos</h2>
              <ElectionManagement 
                onClose={(id) => api(`/admin/election/${id}/close`, { method: "PUT", headers: authHeaders() }).then(() => setMsg("Elección cerrada"))} 
                onDeleteCandidate={(id) => api(`/admin/candidate/${id}`, { method: "DELETE", headers: authHeaders() }).then(() => setMsg("Candidato eliminado"))}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function ElectionManagement({ onClose, onDeleteCandidate }: { onClose: (id: string) => void, onDeleteCandidate: (id: string) => void }) {
  const [elections, setElections] = useState<any[]>([]);
  const [candidatesMap, setCandidatesMap] = useState<Record<string, any[]>>({});

  useEffect(() => {
    api<any[]>("/elections").then(setElections);
  }, []);

  const loadCandidates = (id: string) => {
    if (candidatesMap[id]) return;
    api<any[]>(`/elections/${id}/candidates`).then(list => {
      setCandidatesMap(prev => ({ ...prev, [id]: list }));
    });
  };

  return (
    <div className="space-y-4">
      {elections.map(e => (
        <div key={e.id} className="rounded-xl premium-card p-6 bg-white dark:bg-ink-900 border border-ink-200 dark:border-ink-800">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="font-bold text-lg text-ink-900 dark:text-white">{e.title}</h3>
              <p className="text-xs text-ink-500">ID: {e.id}</p>
            </div>
            <div className="flex gap-2">
              <button 
                className="px-3 py-1 bg-ink-100 text-ink-700 rounded-lg text-xs font-semibold hover:bg-ink-200"
                onClick={() => loadCandidates(e.id)}
              >
                Ver Candidatos
              </button>
              <button 
                className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-xs font-semibold hover:bg-red-200"
                onClick={() => onClose(e.id)}
              >
                Cerrar Elección
              </button>
            </div>
          </div>
          
          {candidatesMap[e.id] && (
            <div className="mt-4 border-t pt-4 space-y-2">
              {candidatesMap[e.id].map(c => (
                <div key={c.id} className="flex justify-between items-center bg-ink-50 dark:bg-ink-800/50 p-2 rounded-lg text-sm">
                  <span>{c.name}</span>
                  <button 
                    className="text-red-500 hover:text-red-700 text-xs font-bold"
                    onClick={() => onDeleteCandidate(c.id)}
                  >
                    Eliminar
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}


function CreateElectionType({ onSave }: { onSave: (name: string) => void }) {
  const [name, setName] = useState("");
  return (
    <section className="premium-card p-6 flex flex-col">
      <h2 className="text-lg font-bold mb-4">Tipo de Elección</h2>
      <div className="space-y-4 flex-grow">
        <input 
          className="w-full rounded-lg border border-ink-200 bg-ink-50 px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary dark:border-ink-800 dark:bg-ink-800 dark:text-white" 
          placeholder="Ej: Presidencial, Regional" 
          onChange={e => setName(e.target.value)} 
        />
        <button className="w-full btn-primary text-xs py-2" onClick={() => onSave(name)}>Crear Tipo</button>
      </div>
    </section>
  );
}

function CreateRegion({ onSave }: { onSave: (d: any) => void }) {
  const [d, setD] = useState<any>({ level: "region" });
  return (
    <section className="premium-card p-6 flex flex-col">
      <h2 className="text-lg font-bold mb-4">Región / Ámbito</h2>
      <div className="space-y-4 flex-grow">
        <input 
          className="w-full rounded-lg border border-ink-200 bg-ink-50 px-3 py-2 text-sm outline-none dark:border-ink-800 dark:bg-ink-800 dark:text-white" 
          placeholder="Nombre (Ej: Lima, Cusco)" 
          onChange={e => setD({ ...d, name: e.target.value })} 
        />
        <select 
          className="w-full rounded-lg border border-ink-200 bg-ink-50 px-3 py-2 text-sm outline-none dark:border-ink-800 dark:bg-ink-800 dark:text-white" 
          onChange={e => setD({ ...d, level: e.target.value })}
        >
          <option value="country">País</option>
          <option value="region">Región</option>
          <option value="province">Provincia</option>
          <option value="district">Distrito</option>
        </select>
        <input 
          className="w-full rounded-lg border border-ink-200 bg-ink-50 px-3 py-2 text-sm outline-none dark:border-ink-800 dark:bg-ink-800 dark:text-white" 
          placeholder="Parent ID (opcional)" 
          onChange={e => setD({ ...d, parent_id: e.target.value || null })} 
        />
        <button className="w-full btn-primary text-xs py-2" onClick={() => onSave(d)}>Crear Región</button>
      </div>
    </section>
  );
}

function CreateElection({ onSave }: { onSave: (d: any) => void }) {
  const [d, setD] = useState<any>({ is_active: true });
  return (
    <section className="premium-card p-6 flex flex-col">
      <h2 className="text-lg font-bold mb-4">Nueva Elección</h2>
      <div className="space-y-4 flex-grow">
        <input 
          className="w-full rounded-lg border border-ink-200 bg-ink-50 px-3 py-2 text-sm outline-none dark:border-ink-800 dark:bg-ink-800 dark:text-white" 
          placeholder="Título de la Elección" 
          onChange={e => setD({ ...d, title: e.target.value })} 
        />
        <div className="grid grid-cols-2 gap-2">
          <input 
            className="rounded-lg border border-ink-200 bg-ink-50 px-3 py-2 text-sm outline-none dark:border-ink-800 dark:bg-ink-800 dark:text-white" 
            placeholder="Type ID" 
            onChange={e => setD({ ...d, election_type_id: e.target.value })} 
          />
          <input 
            className="rounded-lg border border-ink-200 bg-ink-50 px-3 py-2 text-sm outline-none dark:border-ink-800 dark:bg-ink-800 dark:text-white" 
            placeholder="Region ID" 
            onChange={e => setD({ ...d, region_id: e.target.value || null })} 
          />
        </div>
        <input 
          className="w-full rounded-lg border border-ink-200 bg-ink-50 px-3 py-2 text-sm outline-none dark:border-ink-800 dark:bg-ink-800 dark:text-white" 
          type="datetime-local" 
          onChange={e => setD({ ...d, end_date: new Date(e.target.value).toISOString() })} 
        />
        <button className="w-full btn-primary text-xs py-2" onClick={() => onSave(d)}>Crear Elección</button>
      </div>
    </section>
  );
}

function CreateCandidate({ onSave }: { onSave: (d: any) => void }) {
  const [d, setD] = useState<any>({});
  return (
    <section className="premium-card p-6 flex flex-col">
      <h2 className="text-lg font-bold mb-4">Candidato</h2>
      <div className="space-y-4 flex-grow">
        <input 
          className="w-full rounded-lg border border-ink-200 bg-ink-50 px-3 py-2 text-sm outline-none dark:border-ink-800 dark:bg-ink-800 dark:text-white" 
          placeholder="Nombre Completo" 
          onChange={e => setD({ ...d, name: e.target.value })} 
        />
        <input 
          className="w-full rounded-lg border border-ink-200 bg-ink-50 px-3 py-2 text-sm outline-none dark:border-ink-800 dark:bg-ink-800 dark:text-white" 
          placeholder="URL de la Foto" 
          onChange={e => setD({ ...d, image_url: e.target.value })} 
        />
        <input 
          className="w-full rounded-lg border border-ink-200 bg-ink-50 px-3 py-2 text-sm outline-none dark:border-ink-800 dark:bg-ink-800 dark:text-white" 
          placeholder="Election ID" 
          onChange={e => setD({ ...d, election_id: e.target.value })} 
        />
        <button className="w-full btn-primary text-xs py-2" onClick={() => onSave(d)}>Agregar Candidato</button>
      </div>
    </section>
  );
}
