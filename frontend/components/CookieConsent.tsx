"use client";

import { useState, useEffect } from "react";

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  // States for interactive toggles
  const [statsEnabled, setStatsEnabled] = useState(true);
  const [marketingEnabled, setMarketingEnabled] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie_consent");
    if (!consent) {
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookie_consent", JSON.stringify({
      accepted: true,
      stats: statsEnabled,
      marketing: marketingEnabled,
      timestamp: new Date().toISOString()
    }));
    setIsVisible(false);
    setShowSettings(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-end justify-center p-6 md:p-12 pointer-events-none">
      <div className="rounded-xl w-full max-w-5xl bg-white dark:bg-ink-900 shadow-[0_30px_100px_rgba(16,185,129,0.15)] border-t-4 border-brand-600 p-8 md:p-12 pointer-events-auto animate-in fade-in slide-in-from-bottom-20 duration-700">
        
        {!showSettings ? (
          /* Main Banner View */
          <div className="flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="flex-grow">
              <h3 className="text-xs font-semibold tracking-[0.12em] mb-6 text-brand-600 dark:text-brand-400">Política de Privacidad</h3>
              <p className="text-sm font-bold leading-relaxed tracking-[0.08em] text-ink-500 dark:text-ink-400 max-w-4xl">
                Haga clic en <span className="text-brand-600 dark:text-brand-400">Aceptar</span> para permitir que <span className="text-black dark:text-white font-semibold">Escrutinio Digital</span> use cookies a fin de personalizar este sitio, publicar anuncios y medir su eficiencia en otras apps y sitios web. Personalice sus preferencias en configuración.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-6 w-full md:w-auto shrink-0">
              <button 
                onClick={() => setShowSettings(true)}
                className="px-10 py-5 text-xs font-semibold tracking-[0.1em] text-ink-400 dark:text-ink-500 hover:text-brand-600 dark:hover:text-brand-400 transition-all"
              >
                Configuración
              </button>
              <button 
                onClick={handleAccept}
                className="rounded-xl bg-brand-600 text-white px-12 py-5 text-xs font-semibold tracking-[0.1em] hover:bg-brand-500 transition-all shadow-[0_15px_30px_rgba(16,185,129,0.2)]"
              >
                Aceptar
              </button>
            </div>
          </div>
        ) : (
          /* Detailed Settings View */
          <div className="animate-in fade-in zoom-in-95 duration-500">
            <div className="flex justify-between items-center mb-12 border-b border-ink-50 dark:border-ink-800 pb-8">
              <h2 className="text-xl font-semibold tracking-tight text-black dark:text-white">Configuración de Cookies</h2>
              <button 
                onClick={() => setShowSettings(false)}
                className="text-xs font-bold tracking-wide text-ink-300 dark:text-ink-600 hover:text-black dark:hover:text-white transition-colors"
              >
                Cerrar ×
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
              {/* Necesarias */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold tracking-[0.1em] text-brand-600 dark:text-brand-400">Necesarias</h4>
                  <span className="rounded-xl text-xs font-bold tracking-wide bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 px-2 py-0.5">Siempre Activas</span>
                </div>
                <p className="text-xs font-bold leading-relaxed tracking-wide text-ink-400 dark:text-ink-500">
                  Las cookies necesarias nos ayudan a hacer utilizable el Sitio Web, toda vez que nos permiten activar sus funciones básicas (como, por ejemplo, la navegación dentro del Sitio Web). El Sitio Web no puede funcionar adecuadamente sin estas cookies.
                </p>
              </div>

              {/* Estadísticas */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h4 className={`text-sm font-semibold tracking-[0.1em] transition-colors ${statsEnabled ? "text-black dark:text-white" : "text-ink-300 dark:text-ink-600"}`}>Estadísticas</h4>
                  <button 
                    onClick={() => setStatsEnabled(!statsEnabled)}
                    className={`w-10 h-5 rounded-full relative transition-colors duration-300 ${statsEnabled ? "bg-brand-600" : "bg-ink-200 dark:bg-ink-700"}`}
                  >
                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all duration-300 ${statsEnabled ? "right-1" : "left-1"}`}></div>
                  </button>
                </div>
                <p className="text-xs font-bold leading-relaxed tracking-wide text-ink-400 dark:text-ink-500">
                  Las cookies estadísticas nos ayudan a comprender cómo interactúan los usuarios con el Sitio Web. Para ello, estas cookies recopilan, administran y procesan información anonimizada sobre las acciones de los usuarios en el Sitio Web.
                </p>
              </div>

              {/* De Marketing */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h4 className={`text-sm font-semibold tracking-[0.1em] transition-colors ${marketingEnabled ? "text-black dark:text-white" : "text-ink-300 dark:text-ink-600"}`}>De Marketing</h4>
                  <button 
                    onClick={() => setMarketingEnabled(!marketingEnabled)}
                    className={`w-10 h-5 rounded-full relative transition-colors duration-300 ${marketingEnabled ? "bg-brand-600" : "bg-ink-200 dark:bg-ink-700"}`}
                  >
                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all duration-300 ${marketingEnabled ? "right-1" : "left-1"}`}></div>
                  </button>
                </div>
                <p className="text-xs font-bold leading-relaxed tracking-wide text-ink-400 dark:text-ink-500">
                  Las cookies de marketing se utilizan para analizar posibles intereses y/o necesidades de los usuarios del Sitio Web. Lo anterior, con el propósito de mostrarles anuncios publicitarios de conformidad con su perfil individual.
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-8 border-t border-ink-50 dark:border-ink-800">
              <button 
                onClick={handleAccept}
                className="rounded-xl bg-black dark:bg-brand-600 text-white px-12 py-5 text-xs font-semibold tracking-[0.1em] hover:bg-brand-600 dark:hover:bg-brand-500 transition-all shadow-[0_10px_20px_rgba(0,0,0,0.1)]"
              >
                Guardar y Aceptar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
