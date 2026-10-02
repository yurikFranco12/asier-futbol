import React, { createContext, useCallback, useState } from 'react';

export const ContextoCookies = createContext();

const CLAVE = 'consentimiento_cookies';
// Bump when the cookie policy changes so everyone is asked again.
const VERSION = 1;
const VALIDEZ_MS = 365 * 24 * 60 * 60 * 1000;

function leerConsentimiento() {
  try {
    const guardado = JSON.parse(localStorage.getItem(CLAVE));
    if (!guardado || guardado.version !== VERSION) return null;
    if (Date.now() - new Date(guardado.fecha).getTime() > VALIDEZ_MS) return null;
    return guardado;
  } catch {
    return null;
  }
}

export function ProveedorCookies({ children }) {
  const [consentimiento, setConsentimiento] = useState(leerConsentimiento);
  const [panelAbierto, setPanelAbierto] = useState(false);

  const guardar = useCallback((preferencias) => {
    const nuevo = {
      version: VERSION,
      fecha: new Date().toISOString(),
      necesarias: true,
      analiticas: !!preferencias.analiticas,
      marketing: !!preferencias.marketing
    };
    try {
      localStorage.setItem(CLAVE, JSON.stringify(nuevo));
    } catch {
      // Storage blocked (private mode): the choice still applies for this visit.
    }
    setConsentimiento(nuevo);
    setPanelAbierto(false);
  }, []);

  const aceptarTodas = useCallback(() => guardar({ analiticas: true, marketing: true }), [guardar]);
  const rechazarTodas = useCallback(() => guardar({ analiticas: false, marketing: false }), [guardar]);

  return (
    <ContextoCookies.Provider value={{
      consentimiento,
      decidido: consentimiento !== null,
      panelAbierto,
      abrirPanel: () => setPanelAbierto(true),
      cerrarPanel: () => setPanelAbierto(false),
      aceptarTodas,
      rechazarTodas,
      guardarPreferencias: guardar
    }}>
      {children}
    </ContextoCookies.Provider>
  );
}
