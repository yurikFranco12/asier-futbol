import React, { useContext } from 'react';
import Cabecera from '../components/Cabecera';
import { ContextoCookies } from '../contexto/ContextoCookies';
import '../styles/PoliticaCookies.css';

const COOKIES = [
  { nombre: 'token, usuario', proveedor: 'PakSports', tipo: 'Necesaria', finalidad: 'Mantener tu sesión iniciada (almacenamiento local del navegador).', duracion: 'Hasta cerrar sesión' },
  { nombre: 'consentimiento_cookies', proveedor: 'PakSports', tipo: 'Necesaria', finalidad: 'Recordar tus preferencias de cookies (almacenamiento local).', duracion: '12 meses' },
  { nombre: '__stripe_mid', proveedor: 'Stripe', tipo: 'Necesaria', finalidad: 'Prevención de fraude en los pagos.', duracion: '1 año' },
  { nombre: '__stripe_sid', proveedor: 'Stripe', tipo: 'Necesaria', finalidad: 'Prevención de fraude en los pagos.', duracion: '30 minutos' }
];

function PoliticaCookies() {
  const { consentimiento, abrirPanel } = useContext(ContextoCookies);

  const estado = !consentimiento
    ? 'Todavía no has elegido.'
    : `Necesarias: sí · Analíticas: ${consentimiento.analiticas ? 'sí' : 'no'} · Marketing: ${consentimiento.marketing ? 'sí' : 'no'} (desde el ${new Date(consentimiento.fecha).toLocaleDateString('es-ES')})`;

  return (
    <div>
      <Cabecera />
      <main className="politica-container">
        <h1>Política de cookies</h1>

        <section>
          <h2>¿Qué son las cookies?</h2>
          <p>
            Las cookies y tecnologías similares (como el almacenamiento local del navegador) son pequeños archivos
            que una web guarda en tu dispositivo para recordar información entre visitas.
          </p>
        </section>

        <section>
          <h2>Tus preferencias</h2>
          <p className="politica-estado">{estado}</p>
          <button className="politica-btn" onClick={abrirPanel}>Cambiar preferencias de cookies</button>
        </section>

        <section>
          <h2>Cookies que utilizamos</h2>
          <p>
            Actualmente solo usamos cookies <strong>necesarias</strong>, que no requieren tu consentimiento porque sin
            ellas la tienda no puede funcionar. No usamos cookies analíticas ni de publicidad. Si en el futuro las
            añadimos, solo se activarán si las aceptas.
          </p>
          <div className="politica-tabla-wrapper">
            <table className="politica-tabla">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Proveedor</th>
                  <th>Tipo</th>
                  <th>Finalidad</th>
                  <th>Duración</th>
                </tr>
              </thead>
              <tbody>
                {COOKIES.map(c => (
                  <tr key={c.nombre}>
                    <td><code>{c.nombre}</code></td>
                    <td>{c.proveedor}</td>
                    <td>{c.tipo}</td>
                    <td>{c.finalidad}</td>
                    <td>{c.duracion}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2>Cómo borrar o bloquear las cookies</h2>
          <p>
            Además de usar el botón de preferencias, puedes borrar o bloquear las cookies desde la configuración de tu
            navegador (normalmente en Privacidad o Seguridad). Ten en cuenta que si bloqueas las cookies necesarias no
            podrás iniciar sesión ni completar compras.
          </p>
        </section>
      </main>
    </div>
  );
}

export default PoliticaCookies;
