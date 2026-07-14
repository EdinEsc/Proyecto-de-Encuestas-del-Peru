"use client";

import { useEffect, useState } from "react";
import { api, authHeaders, Election } from "@/lib/api";

export default function AdminPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem("admin_token");
    if (saved) setToken(saved);
  }, []);

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
      setRefreshTrigger(prev => prev + 1);
    } catch (e: any) {
      setMsg(e.message);
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <div className="rounded-xl min-h-[calc(100vh-4rem)] flex items-center justify-center bg-ink-50 px-4">
        <div className="w-full max-w-md p-8 bg-white border border-ink-200 rounded-xl shadow-sm">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-ink-900">Panel de Control</h1>
            <p className="text-ink-500 mt-2">Ingresa tus credenciales de administrador</p>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-ink-700 mb-1 block">Correo Electrónico</label>
              <input 
                className="w-full rounded-xl border border-ink-200 bg-ink-50 px-4 py-3 text-sm focus:border-black focus:ring-1 focus:ring-black outline-none transition-all" 
                placeholder="admin@votaciones.local" 
                onChange={e => setEmail(e.target.value)} 
              />
            </div>
            <div>
              <label className="text-sm font-medium text-ink-700 mb-1 block">Contraseña</label>
              <input 
                className="w-full rounded-xl border border-ink-200 bg-ink-50 px-4 py-3 text-sm focus:border-black focus:ring-1 focus:ring-black outline-none transition-all" 
                type="password" 
                placeholder="••••••••" 
                onChange={e => setPassword(e.target.value)} 
              />
            </div>
            <button 
              className="w-full bg-black text-white rounded-xl px-4 py-3 text-sm font-bold hover:bg-ink-800 transition-colors mt-6 disabled:opacity-50" 
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
    <div className="rounded-xl min-h-screen bg-ink-50 py-12">
      <main className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-ink-900">Administración Central</h1>
            <p className="text-ink-500 mt-1">Gestiona los procesos electorales de la plataforma.</p>
          </div>
          <button 
            className="inline-flex items-center justify-center rounded-xl border border-ink-200 bg-white px-4 py-2 text-sm font-medium text-red-600 shadow-sm transition-all hover:bg-red-50" 
            onClick={() => { localStorage.removeItem("admin_token"); setToken(""); }}
          >
            Cerrar Sesión
          </button>
        </div>

        {msg && (
          <div className={`mb-8 p-4 rounded-xl border ${msg.includes('correcto') || msg.includes('Guardado') ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
            {msg}
          </div>
        )}

        <div className="grid lg:grid-cols-4 gap-8">
          <aside className="lg:col-span-1 space-y-6">
            <div className="p-6 bg-ink-900 text-white rounded-xl">
              <h3 className="font-bold mb-4">Guía Rápida</h3>
              <ul className="space-y-3 text-sm text-ink-300">
                <li className="flex gap-2"><span className="font-bold">1.</span> Define el Tipo de Elección.</li>
                <li className="flex gap-2"><span className="font-bold">2.</span> Crea la Región o ámbito.</li>
                <li className="flex gap-2"><span className="font-bold">3.</span> Configura la Elección.</li>
                <li className="flex gap-2"><span className="font-bold">4.</span> Agrega a los Candidatos.</li>
              </ul>
            </div>
          </aside>

          <div className="lg:col-span-3 space-y-8">
            <div className="grid md:grid-cols-2 gap-8">
              <CreateElectionType onSave={(name) => post("/admin/election-type", { name })} refreshKey={refreshTrigger} />
              <CreateRegion onSave={(data) => post("/admin/region", data)} refreshKey={refreshTrigger} />
              <CreateElection onSave={(data) => post("/admin/election", data)} refreshKey={refreshTrigger} />
              <CreateCandidate onSave={(data) => post("/admin/candidate", data)} refreshKey={refreshTrigger} />
            </div>
            
            <div className="mt-12">
              <h2 className="text-2xl font-bold text-ink-900 mb-6">Gestión de Procesos</h2>
              <ElectionManagement 
                refreshKey={refreshTrigger}
                onClose={(id) => api(`/admin/election/${id}/close`, { method: "PUT", headers: authHeaders() }).then(() => { setMsg("Elección cerrada"); setRefreshTrigger(p => p+1); })} 
                onDeleteCandidate={(id) => api(`/admin/candidate/${id}`, { method: "DELETE", headers: authHeaders() }).then(() => { setMsg("Candidato eliminado"); setRefreshTrigger(p => p+1); })}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function ElectionManagement({ onClose, onDeleteCandidate, refreshKey }: { onClose: (id: string) => void, onDeleteCandidate: (id: string) => void, refreshKey: number }) {
  const [elections, setElections] = useState<any[]>([]);
  const [candidatesMap, setCandidatesMap] = useState<Record<string, any[]>>({});

  useEffect(() => {
    api<any[]>("/admin/elections").then(d => setElections(d || [])).catch(() => {});
  }, [refreshKey]);

  const loadCandidates = (id: string) => {
    api<any[]>(`/elections/${id}/candidates`).then(list => {
      setCandidatesMap(prev => ({ ...prev, [id]: list }));
    });
  };

  return (
    <div className="space-y-4">
      {elections.map(e => (
        <div key={e.id} className="p-6 bg-white border border-ink-200 rounded-xl">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="font-bold text-lg text-ink-900">{e.title}</h3>
              <p className="text-xs text-ink-500">ID: {e.id}</p>
              <p className="text-xs mt-1">
                <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${e.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {e.is_active ? 'Activa' : 'Cerrada'}
                </span>
              </p>
            </div>
            <div className="flex gap-2">
              <button 
                className="px-3 py-1 bg-ink-100 text-ink-700 rounded-lg text-xs font-semibold hover:bg-ink-200"
                onClick={() => loadCandidates(e.id)}
              >
                Ver Candidatos
              </button>
              {e.is_active && (
                <button 
                  className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-xs font-semibold hover:bg-red-200"
                  onClick={() => onClose(e.id)}
                >
                  Cerrar Elección
                </button>
              )}
            </div>
          </div>
          
          {candidatesMap[e.id] && (
            <div className="mt-4 border-t pt-4 space-y-2">
              {candidatesMap[e.id].map((c: any) => (
                <div key={c.id} className="flex justify-between items-center bg-ink-50 p-2 rounded-lg text-sm">
                  <div className="flex items-center gap-3">
                    {c.image_url && (
                      <img src={c.image_url.startsWith('http') ? c.image_url : `http://localhost:8080${c.image_url}`} className="w-8 h-8 object-cover rounded" alt="" />
                    )}
                    <span>{c.name}</span>
                  </div>
                  <button 
                    className="text-red-500 hover:text-red-700 text-xs font-bold"
                    onClick={() => { onDeleteCandidate(c.id); setTimeout(() => loadCandidates(e.id), 500); }}
                  >
                    Eliminar
                  </button>
                </div>
              ))}
              {candidatesMap[e.id].length === 0 && (
                <p className="text-sm text-ink-400 italic">Sin candidatos registrados.</p>
              )}
            </div>
          )}
        </div>
      ))}
      {elections.length === 0 && (
        <p className="text-ink-400 text-sm italic py-8 text-center">No hay procesos electorales registrados.</p>
      )}
    </div>
  );
}


function CreateElectionType({ onSave, refreshKey }: { onSave: (name: string) => void, refreshKey: number }) {
  const [name, setName] = useState("");
  const [list, setList] = useState<any[]>([]);

  useEffect(() => {
    api<any[]>("/election-types").then(d => setList(d || [])).catch(() => {});
  }, [refreshKey]);

  return (
    <section className="p-6 bg-white border border-ink-200 rounded-xl flex flex-col">
      <h2 className="text-lg font-bold mb-4">Tipo de Elección</h2>
      <div className="space-y-4 flex-grow">
        <input 
          className="w-full rounded-lg border border-ink-200 bg-ink-50 px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-black" 
          placeholder="Ej: Presidencial, Regional" 
          value={name}
          onChange={e => setName(e.target.value)} 
        />
        <button className="w-full bg-black text-white rounded-lg px-4 py-2 text-xs font-bold hover:bg-ink-800 transition-colors" onClick={() => { onSave(name); setName(""); }}>Crear Tipo</button>
      </div>
      {list.length > 0 && (
        <div className="mt-4 pt-4 border-t space-y-1">
          <p className="text-xs font-bold tracking-wide text-ink-400 mb-2">Tipos existentes:</p>
          {list.map(t => (
            <div key={t.id} className="text-xs flex justify-between text-ink-600 bg-ink-50 p-2 rounded">
              <span className="font-medium">{t.name}</span>
              <span className="text-ink-300 text-xs">{t.id.substring(0,8)}...</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function CreateRegion({ onSave, refreshKey }: { onSave: (d: any) => void, refreshKey: number }) {
  const [d, setD] = useState<any>({ level: "region" });
  const [regions, setRegions] = useState<any[]>([]);

  useEffect(() => {
    api<any[]>("/regions").then(d => setRegions(d || [])).catch(() => {});
  }, [refreshKey]);

  return (
    <section className="p-6 bg-white border border-ink-200 rounded-xl flex flex-col">
      <h2 className="text-lg font-bold mb-4">Región / Ámbito</h2>
      <div className="space-y-4 flex-grow">
        <input 
          className="w-full rounded-lg border border-ink-200 bg-ink-50 px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-black" 
          placeholder="Nombre (Ej: Lima, Cusco)" 
          onChange={e => setD({ ...d, name: e.target.value })} 
        />
        <select 
          className="w-full rounded-lg border border-ink-200 bg-ink-50 px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-black" 
          onChange={e => setD({ ...d, level: e.target.value })}
        >
          <option value="country">País</option>
          <option value="region" selected>Región</option>
          <option value="province">Provincia</option>
          <option value="district">Distrito</option>
        </select>
        <select 
          className="w-full rounded-lg border border-ink-200 bg-ink-50 px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-black" 
          onChange={e => setD({ ...d, parent_id: e.target.value || null })}
        >
          <option value="">Región Superior (Opcional)</option>
          {regions.map(r => <option key={r.id} value={r.id}>{r.name} ({r.level})</option>)}
        </select>
        <button className="w-full bg-black text-white rounded-lg px-4 py-2 text-xs font-bold hover:bg-ink-800 transition-colors" onClick={() => onSave(d)}>Crear Región</button>
      </div>
    </section>
  );
}

function CreateElection({ onSave, refreshKey }: { onSave: (d: any) => void, refreshKey: number }) {
  const [d, setD] = useState<any>({ is_active: true });
  const [types, setTypes] = useState<any[]>([]);
  const [regions, setRegions] = useState<any[]>([]);

  useEffect(() => {
    api<any[]>("/election-types").then(d => setTypes(d || [])).catch(() => {});
    api<any[]>("/regions").then(d => setRegions(d || [])).catch(() => {});
  }, [refreshKey]);

  return (
    <section className="p-6 bg-white border border-ink-200 rounded-xl flex flex-col">
      <h2 className="text-lg font-bold mb-4">Nueva Elección</h2>
      <div className="space-y-4 flex-grow">
        <input 
          className="w-full rounded-lg border border-ink-200 bg-ink-50 px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-black" 
          placeholder="Título de la Elección" 
          onChange={e => setD({ ...d, title: e.target.value })} 
        />
        <div className="grid grid-cols-2 gap-2">
          <select 
            className="rounded-lg border border-ink-200 bg-ink-50 px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-black" 
            onChange={e => setD({ ...d, election_type_id: e.target.value })}
            value={d.election_type_id || ""}
          >
            <option value="">Tipo de Elección</option>
            {types.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          <select 
            className="rounded-lg border border-ink-200 bg-ink-50 px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-black" 
            onChange={e => setD({ ...d, region_id: e.target.value || null })}
            value={d.region_id || ""}
          >
            <option value="">Región (Opcional)</option>
            {regions.map(r => <option key={r.id} value={r.id}>{r.name} ({r.level})</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-bold tracking-wide text-ink-400 block mb-1">Fecha de Cierre</label>
          <input 
            className="w-full rounded-lg border border-ink-200 bg-ink-50 px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-black" 
            type="datetime-local" 
            onChange={e => setD({ ...d, end_date: new Date(e.target.value).toISOString() })} 
          />
        </div>
        <button className="w-full bg-black text-white rounded-lg px-4 py-2 text-xs font-bold hover:bg-ink-800 transition-colors" onClick={() => onSave(d)}>Crear Elección</button>
      </div>
    </section>
  );
}

function CreateCandidate({ onSave, refreshKey }: { onSave: (d: any) => void, refreshKey: number }) {
  const [d, setD] = useState<any>({});
  const [elections, setElections] = useState<any[]>([]);

  useEffect(() => {
    // Usar el endpoint admin para ver todas las elecciones
    api<Election[]>("/admin/elections", { headers: authHeaders() }).then(d => setElections(d || [])).catch(() => {});
  }, [refreshKey]);

  return (
    <section className="p-6 bg-white border border-ink-200 rounded-xl flex flex-col">
      <h2 className="text-lg font-bold mb-4">Candidato</h2>
      <div className="space-y-4 flex-grow">
        <input 
          className="w-full rounded-lg border border-ink-200 bg-ink-50 px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-black" 
          placeholder="Nombre Completo" 
          onChange={e => setD({ ...d, name: e.target.value })} 
        />
        <input 
          className="w-full rounded-lg border border-ink-200 bg-ink-50 px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-black" 
          placeholder="URL de la Foto" 
          onChange={e => setD({ ...d, image_url: e.target.value })} 
        />
        <select 
          className="w-full rounded-lg border border-ink-200 bg-ink-50 px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-black" 
          onChange={e => setD({ ...d, election_id: e.target.value })}
          value={d.election_id || ""}
        >
          <option value="">Seleccione Elección</option>
          {elections.map(e => <option key={e.id} value={e.id}>{e.title}{!e.is_active ? ' (Cerrada)' : ''}</option>)}
        </select>
        <button className="w-full bg-black text-white rounded-lg px-4 py-2 text-xs font-bold hover:bg-ink-800 transition-colors" onClick={() => onSave(d)}>Agregar Candidato</button>
      </div>
    </section>
  );
}
