"use client";

import Link from "next/link";
import { LogoMark } from "@/components/Logo";

export default function Footer() {
  return (
    <footer className="mt-32 bg-navy py-16 text-white">
      <div className="mx-auto max-w-[1500px] px-6">
        {/*
          Solo queda "Explorar": las columnas de Legalidad y Contacto, y los
          iconos sociales, eran todos href="#" y no llevaban a ninguna parte.
        */}
        <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
          {/* Marca */}
          <div className="col-span-1 md:col-span-2">
            {/* El isotipo tiene trazos negros que desaparecen sobre el marino */}
            <span className="inline-flex items-center justify-center rounded-xl bg-white p-2">
              <LogoMark className="h-12 w-12" />
            </span>
            <p className="mt-6 max-w-sm text-sm leading-relaxed text-white/60">
              Plataforma independiente dedicada a la transparencia democrática. Un espacio
              seguro para el ejercicio de la participación ciudadana digital.
            </p>
          </div>

          <div>
            <h3 className="mb-5 text-[11px] font-semibold uppercase tracking-[0.14em] text-gold">Explorar</h3>
            <ul className="space-y-3 text-sm text-white/60">
              <li><Link href="/" className="transition-colors hover:text-gold">Inicio</Link></li>
              <li><Link href="/?category=presidencial" className="transition-colors hover:text-gold">Presidencial</Link></li>
              <li><Link href="/?category=regionales" className="transition-colors hover:text-gold">Regionales</Link></li>
              <li><Link href="/?category=lima_distritos" className="transition-colors hover:text-gold">Distritos</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-center justify-between gap-6 border-t border-white/15 pt-8 text-sm text-white/50 md:flex-row">
          <p>© {new Date().getFullYear()} Precisium</p>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 animate-pulse rounded-full bg-gold" />
              <span className="font-medium text-white/80">Red en línea</span>
            </span>
            <span className="hidden h-4 w-px bg-white/20 md:block" />
            <span>Hecho en Perú</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
