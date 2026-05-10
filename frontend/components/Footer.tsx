"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-80 border-t border-slate-100 dark:border-slate-800 pt-32 pb-16 bg-white dark:bg-slate-950">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-20 mb-32">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-2">
            <div className="h-10 w-10 bg-emerald-600 text-white flex items-center justify-center font-bold text-lg mb-8 shadow-[0_10px_20px_rgba(5,150,105,0.2)]">E</div>
            <h2 className="text-sm font-bold uppercase tracking-[0.4em] mb-8 text-black dark:text-white">Escrutinio Digital <span className="text-emerald-600 dark:text-emerald-400">Perú</span></h2>
            <p className="text-slate-600 dark:text-slate-400 text-[11px] font-bold uppercase leading-[2] tracking-[0.2em] max-w-sm">
              Plataforma independiente dedicada a la transparencia democrática. 
              Garantizamos un espacio seguro para el ejercicio de la participación ciudadana digital.
            </p>
            <div className="mt-12 flex gap-4">
              <div className="h-10 w-10 border border-slate-100 dark:border-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:border-emerald-600 hover:text-emerald-600 dark:hover:border-emerald-400 dark:hover:text-emerald-400 transition-all cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
              </div>
              <div className="h-10 w-10 border border-slate-100 dark:border-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:border-emerald-600 hover:text-emerald-600 dark:hover:border-emerald-400 dark:hover:text-emerald-400 transition-all cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.48 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/></svg>
              </div>
            </div>
          </div>

          {/* Links Sections */}
          <div>
            <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] text-emerald-600 dark:text-emerald-400 mb-10">Explorar</h3>
            <ul className="space-y-5 text-[10px] font-bold uppercase tracking-widest text-slate-600 dark:text-slate-400">
              <li><Link href="/" className="hover:text-black dark:hover:text-white transition-colors">Inicio Oficial</Link></li>
              <li><Link href="/?category=presidencial" className="hover:text-black dark:hover:text-white transition-colors">Presidencial</Link></li>
              <li><Link href="/?category=regionales" className="hover:text-black dark:hover:text-white transition-colors">Regionales</Link></li>
              <li><Link href="/?category=lima_distritos" className="hover:text-black dark:hover:text-white transition-colors">Distritos</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] text-black dark:text-white mb-10">Legalidad</h3>
            <ul className="space-y-5 text-[10px] font-bold uppercase tracking-widest text-slate-600 dark:text-slate-400">
              <li><a href="#" className="hover:text-black dark:hover:text-white transition-colors">Seguridad Voto</a></li>
              <li><a href="#" className="hover:text-black dark:hover:text-white transition-colors">Tratamiento Datos</a></li>
              <li><a href="#" className="hover:text-black dark:hover:text-white transition-colors">Términos Legales</a></li>
              <li><a href="#" className="hover:text-black dark:hover:text-white transition-colors">Cookies</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] text-black dark:text-white mb-10">Contacto</h3>
            <ul className="space-y-5 text-[10px] font-bold uppercase tracking-widest text-slate-600 dark:text-slate-400">
              <li><a href="#" className="hover:text-black dark:hover:text-white transition-colors">Mesa de Ayuda</a></li>
              <li><a href="#" className="hover:text-black dark:hover:text-white transition-colors">Prensa</a></li>
              <li><a href="/admin" className="text-emerald-600 dark:text-emerald-400 font-black hover:underline">Acceso Admin</a></li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-12 pt-16 border-t border-slate-100 dark:border-slate-800">
          <div className="text-[9px] font-bold uppercase tracking-[0.5em] text-slate-500 dark:text-slate-500">
            © {new Date().getFullYear()} Escrutinio Digital Perú — Proyecto Independiente
          </div>
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></span>
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-black dark:text-white">Red en Línea</span>
            </div>
            <div className="h-8 w-[1px] bg-slate-100 dark:bg-slate-800 hidden md:block"></div>
            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-600 dark:text-slate-400 italic underline decoration-emerald-600 decoration-2 underline-offset-4">Hecho en Perú</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
