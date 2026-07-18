"use client";

import Link from "next/link";
import { LogoMark } from "@/components/Logo";

export default function Footer() {
  return (
    <footer className="mt-32 border-t border-ink-100 bg-white py-16 dark:border-white/10 dark:bg-ink-950">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-4 lg:grid-cols-5">
          {/* Marca */}
          <div className="col-span-1 md:col-span-2">
            <LogoMark className="h-14 w-14" />
            <p className="mt-6 max-w-sm text-sm leading-relaxed text-ink-500 dark:text-ink-300">
              Plataforma independiente dedicada a la transparencia democrática. Un espacio
              seguro para el ejercicio de la participación ciudadana digital.
            </p>
            <div className="mt-8 flex gap-3">
              <a href="#" aria-label="Facebook" className="flex h-10 w-10 items-center justify-center rounded-xl border border-ink-200 text-ink-500 transition-colors hover:border-brand-600 hover:text-brand-600 dark:border-white/10 dark:text-ink-300 dark:hover:border-brand-400 dark:hover:text-brand-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
              </a>
              <a href="#" aria-label="X" className="flex h-10 w-10 items-center justify-center rounded-xl border border-ink-200 text-ink-500 transition-colors hover:border-brand-600 hover:text-brand-600 dark:border-white/10 dark:text-ink-300 dark:hover:border-brand-400 dark:hover:text-brand-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.48 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/></svg>
              </a>
            </div>
          </div>

          <div>
            <h3 className="eyebrow mb-5">Explorar</h3>
            <ul className="space-y-3 text-sm text-ink-500 dark:text-ink-300">
              <li><Link href="/" className="transition-colors hover:text-brand-600 dark:hover:text-brand-400">Inicio</Link></li>
              <li><Link href="/?category=presidencial" className="transition-colors hover:text-brand-600 dark:hover:text-brand-400">Presidencial</Link></li>
              <li><Link href="/?category=regionales" className="transition-colors hover:text-brand-600 dark:hover:text-brand-400">Regionales</Link></li>
              <li><Link href="/?category=lima_distritos" className="transition-colors hover:text-brand-600 dark:hover:text-brand-400">Distritos</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="eyebrow mb-5">Legalidad</h3>
            <ul className="space-y-3 text-sm text-ink-500 dark:text-ink-300">
              <li><a href="#" className="transition-colors hover:text-brand-600 dark:hover:text-brand-400">Seguridad del voto</a></li>
              <li><a href="#" className="transition-colors hover:text-brand-600 dark:hover:text-brand-400">Tratamiento de datos</a></li>
              <li><a href="#" className="transition-colors hover:text-brand-600 dark:hover:text-brand-400">Términos legales</a></li>
              <li><a href="#" className="transition-colors hover:text-brand-600 dark:hover:text-brand-400">Cookies</a></li>
            </ul>
          </div>

          <div>
            <h3 className="eyebrow mb-5">Contacto</h3>
            <ul className="space-y-3 text-sm text-ink-500 dark:text-ink-300">
              <li><a href="#" className="transition-colors hover:text-brand-600 dark:hover:text-brand-400">Mesa de ayuda</a></li>
              <li><a href="#" className="transition-colors hover:text-brand-600 dark:hover:text-brand-400">Prensa</a></li>
              <li><a href="/admin" className="font-semibold text-brand-600 transition-colors hover:text-brand-700 dark:text-brand-400">Acceso admin</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-center justify-between gap-6 border-t border-ink-100 pt-8 text-sm text-ink-400 dark:border-white/10 dark:text-ink-400 md:flex-row">
          <p>© {new Date().getFullYear()} Precisium</p>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 animate-pulse rounded-full bg-accent-500" />
              <span className="font-medium text-ink-600 dark:text-ink-200">Red en línea</span>
            </span>
            <span className="hidden h-4 w-px bg-ink-200 dark:bg-white/10 md:block" />
            <span>Hecho en Perú</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
