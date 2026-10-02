import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ContextoCookies } from '../contexto/ContextoCookies';
import '../styles/AvisoCookies.css';

const CATEGORIAS = [
  {
    clave: 'necesarias',
    titulo: 'Necesarias',
    descripcion: 'Mantienen tu sesión iniciada, guardan estas preferencias y permiten pagar de forma segura con Stripe (prevención de fraude). Sin ellas la tienda no funciona.',
    obligatoria: true
  },
  {
    clave: 'analiticas',
    titulo: 'Analíticas',
    descripcion: 'Nos ayudarían a entender cómo se usa la web para mejorarla. Ahora mismo no usamos ninguna.'
  },
  {
    clave: 'marketing',
    titulo: 'Marketing',
    descripcion: 'Servirían para mostrarte publicidad relevante en otras webs. Ahora mismo no usamos ninguna.'
  }
];

function AvisoCookies() {
  const {
    consentimiento, decidido, panelAbierto,
    abrirPanel, cerrarPanel, aceptarTodas, rechazarTodas, guardarPreferencias
  } = useContext(ContextoCookies);

  const [seleccion, setSeleccion] = useState({ analiticas: false, marketing: false });

  useEffect(() => {
    if (panelAbierto) {
      setSeleccion({
        analiticas: !!consentimiento?.analiticas,
        marketing: !!consentimiento?.marketing
      });
    }
  }, [panelAbierto, consentimiento]);

  if (decidido && !panelAbierto) return null;

  if (panelAbierto) {
    return (
      <div className="cookies-overlay" role="dialog" aria-modal="true" aria-labelledby="cookies-panel-titulo">
        <div className="cookies-panel">
          <h2 id="cookies-panel-titulo">Configurar cookies</h2>
          <p className="cookies-texto">
            Elige qué cookies permites. Puedes cambiarlo cuando quieras desde la{' '}
            <Link to="/politica-cookies" onClick={cerrarPanel}>política de cookies</Link>.
          </p>

          <ul className="cookies-categorias">
            {CATEGORIAS.map(cat => (
              <li key={cat.clave} className="cookies-categoria">
                <div className="cookies-categoria-cabecera">
                  <span className="cookies-categoria-titulo">{cat.titulo}</span>
                  {cat.obligatoria ? (
                    <span className="cookies-siempre">Siempre activas</span>
                  ) : (
                    <label className="cookies-interruptor">
                      <input
                        type="checkbox"
                        checked={seleccion[cat.clave]}
                        onChange={(e) => setSeleccion(prev => ({ ...prev, [cat.clave]: e.target.checked }))}
                        aria-label={`Permitir cookies ${cat.titulo.toLowerCase()}`}
                      />
                      <span className="cookies-deslizador" />
                    </label>
                  )}
                </div>
                <p>{cat.descripcion}</p>
              </li>
            ))}
          </ul>

          <div className="cookies-botones">
            <button className="cookies-btn cookies-btn-secundario" onClick={rechazarTodas}>Rechazar todas</button>
            <button className="cookies-btn cookies-btn-secundario" onClick={() => guardarPreferencias(seleccion)}>Guardar selección</button>
            <button className="cookies-btn cookies-btn-primario" onClick={aceptarTodas}>Aceptar todas</button>
          </div>
          {decidido && (
            <button className="cookies-cerrar" onClick={cerrarPanel} aria-label="Cerrar sin cambiar">✕</button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="cookies-banner" role="region" aria-label="Aviso de cookies">
      <div className="cookies-banner-contenido">
        <p className="cookies-texto">
          🍪 Usamos cookies necesarias para que la tienda funcione (sesión y pago seguro).
          Con tu permiso podríamos usar también cookies analíticas y de marketing.{' '}
          <Link to="/politica-cookies">Más información</Link>
        </p>
        <div className="cookies-botones">
          <button className="cookies-btn cookies-btn-secundario" onClick={abrirPanel}>Configurar</button>
          <button className="cookies-btn cookies-btn-secundario" onClick={rechazarTodas}>Rechazar</button>
          <button className="cookies-btn cookies-btn-primario" onClick={aceptarTodas}>Aceptar</button>
        </div>
      </div>
    </div>
  );
}

export default AvisoCookies;
