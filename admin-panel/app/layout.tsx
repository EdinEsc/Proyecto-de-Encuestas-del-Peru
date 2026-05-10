import "./globals.css";
import Script from "next/script";

export const metadata = {
  title: "Votaciones Perú - Panel de Administración",
  description: "Gestión centralizada de procesos electorales.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <Script src="https://www.google.com/recaptcha/api.js" strategy="beforeInteractive" />
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            try {
              var theme = localStorage.getItem('admin_theme');
              if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                document.documentElement.classList.add('dark');
              }
            } catch(e) {}
          })();
        `}} />
      </head>
      <body className="min-h-screen bg-white dark:bg-slate-900 text-black dark:text-white antialiased transition-colors">
        <main className="min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}
