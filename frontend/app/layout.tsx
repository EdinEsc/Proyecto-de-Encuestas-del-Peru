import "./globals.css";

export const metadata = {
  title: "Precisium — Datos precisos, decisiones certeras",
  description: "Participa en las encuestas electorales del Perú de manera segura y transparente.",
};

import ThemeProvider from "@/components/ThemeProvider";
import LayoutContent from "@/components/LayoutContent";
import { api, Election } from "@/lib/api";
import { Suspense } from "react";

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const elections = await api<Election[]>("/elections").catch(() => []) || [];

  return (
    <html lang="es" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&display=swap" rel="stylesheet" />
        {/* Prevent flash of light mode if user prefers dark */}
        <script dangerouslySetInnerHTML={{ __html: `
          try {
            var t = localStorage.getItem('theme');
            if (t === 'dark' || (!t && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
              document.documentElement.classList.add('dark');
            }
          } catch(e) {}
        `}} />
      </head>
      <body className="min-h-screen font-sans antialiased">
        <ThemeProvider>
          <Suspense fallback={null}>
            <LayoutContent elections={elections}>
              {children}
            </LayoutContent>
          </Suspense>
        </ThemeProvider>
      </body>
    </html>
  );
}

