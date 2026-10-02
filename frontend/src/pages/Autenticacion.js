import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Cabecera from '../components/Cabecera';
import { ContextoAutenticacion } from '../contexto/ContextoAutenticacion';
import '../styles/Autenticacion.css';

function Autenticacion() {
  const navigate = useNavigate();
  const { login, registro, reenviarVerificacion } = useContext(ContextoAutenticacion);

  const [modo, setModo] = useState('login'); // 'login' o 'registro'
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const [emailPendiente, setEmailPendiente] = useState(null);
  const [puedeReenviar, setPuedeReenviar] = useState(false);
  const [reenviando, setReenviando] = useState(false);

  const [formulario, setFormulario] = useState({
    email: '',
    contraseña: '',
    nombre_completo: '',
    telefono: ''
  });

  const manejarCambio = (e) => {
    const { name, value } = e.target;
    setFormulario(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
    setExito('');
    setPuedeReenviar(false);
  };

  const manejarReenvio = async (email) => {
    setReenviando(true);
    setError('');
    const resultado = await reenviarVerificacion(email);
    if (resultado.success) {
      setExito('Te hemos enviado un nuevo enlace de confirmación.');
      setPuedeReenviar(false);
    } else {
      setError(resultado.error);
    }
    setReenviando(false);
  };

  const manejarLogin = async (e) => {
    e.preventDefault();
    setCargando(true);
    setError('');
    setPuedeReenviar(false);

    const resultado = await login(formulario.email, formulario.contraseña);

    if (resultado.success) {
      setExito('¡Bienvenido! Redirigiendo...');
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } else {
      setError(resultado.error);
      setPuedeReenviar(resultado.codigo === 'EMAIL_NO_VERIFICADO');
    }

    setCargando(false);
  };

  const manejarRegistro = async (e) => {
    e.preventDefault();
    setCargando(true);
    setError('');

    if (formulario.contraseña.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      setCargando(false);
      return;
    }

    const resultado = await registro(
      formulario.email,
      formulario.contraseña,
      formulario.nombre_completo,
      formulario.telefono
    );

    if (resultado.success) {
      setEmailPendiente(resultado.email);
      setFormulario(prev => ({ ...prev, contraseña: '' }));
      if (!resultado.emailEnviado) setError(resultado.mensaje);
    } else {
      setError(resultado.error);
    }

    setCargando(false);
  };

  if (emailPendiente) {
    return (
      <div>
        <Cabecera />
        <div className="auth-container auth-container-centrado">
          <div className="auth-card auth-verificacion">
            <div className="auth-icono-grande">📧</div>
            <h2>Revisa tu email</h2>
            <p>
              Te hemos enviado un enlace de confirmación a <strong>{emailPendiente}</strong>.
              Ábrelo para activar tu cuenta. El enlace caduca en 24 horas.
            </p>
            <p className="auth-nota">¿No lo encuentras? Mira en la carpeta de spam.</p>

            {error && <div className="mensaje-error">❌ {error}</div>}
            {exito && <div className="mensaje-exito">✅ {exito}</div>}

            <button className="btn-auth" onClick={() => manejarReenvio(emailPendiente)} disabled={reenviando}>
              {reenviando ? '⏳ Enviando...' : 'Reenviar email'}
            </button>
            <button
              className="btn-auth-secundario"
              onClick={() => {
                setEmailPendiente(null);
                setModo('login');
                setError('');
                setExito('');
              }}
            >
              Volver a iniciar sesión
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Cabecera />
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1>PakSports</h1>
            <p>Tu tienda de equipamiento deportivo</p>
          </div>

          <div className="auth-tabs">
            <button
              className={`tab ${modo === 'login' ? 'activo' : ''}`}
              onClick={() => {
                setModo('login');
                setError('');
                setExito('');
              }}
            >
              Iniciar Sesión
            </button>
            <button
              className={`tab ${modo === 'registro' ? 'activo' : ''}`}
              onClick={() => {
                setModo('registro');
                setError('');
                setExito('');
              }}
            >
              Registrarse
            </button>
          </div>

          {error && <div className="mensaje-error">❌ {error}</div>}
          {exito && <div className="mensaje-exito">✅ {exito}</div>}
          {puedeReenviar && (
            <button
              type="button"
              className="btn-auth-secundario btn-reenviar"
              onClick={() => manejarReenvio(formulario.email)}
              disabled={reenviando}
            >
              {reenviando ? '⏳ Enviando...' : '📧 Reenviar email de confirmación'}
            </button>
          )}

          <form
            className="auth-formulario"
            onSubmit={modo === 'login' ? manejarLogin : manejarRegistro}
          >
            {modo === 'registro' && (
              <>
                <div className="form-group">
                  <label>Nombre Completo</label>
                  <input
                    type="text"
                    name="nombre_completo"
                    placeholder="Tu nombre"
                    value={formulario.nombre_completo}
                    onChange={manejarCambio}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Teléfono (Opcional)</label>
                  <input
                    type="tel"
                    name="telefono"
                    placeholder="Tu teléfono"
                    value={formulario.telefono}
                    onChange={manejarCambio}
                  />
                </div>
              </>
            )}

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                placeholder="tu@email.com"
                value={formulario.email}
                onChange={manejarCambio}
                required
              />
            </div>

            <div className="form-group">
              <label>Contraseña</label>
              <input
                type="password"
                name="contraseña"
                placeholder="••••••••"
                value={formulario.contraseña}
                onChange={manejarCambio}
                required
              />
              {modo === 'registro' && (
                <small>Mínimo 6 caracteres</small>
              )}
            </div>

            <button
              type="submit"
              className="btn-auth"
              disabled={cargando}
            >
              {cargando ? (
                <>⏳ Procesando...</>
              ) : (
                modo === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'
              )}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              {modo === 'login' ? (
                <>¿No tienes cuenta? <a href="#" onClick={(e) => { e.preventDefault(); setModo('registro'); }}>Regístrate aquí</a></>
              ) : (
                <>¿Ya tienes cuenta? <a href="#" onClick={(e) => { e.preventDefault(); setModo('login'); }}>Inicia sesión</a></>
              )}
            </p>
          </div>
        </div>

        <div className="auth-beneficios">
          <h2>Beneficios de registrarse:</h2>
          <ul>
            <li>✓ Compra de manera segura</li>
            <li>✓ Historial de pedidos</li>
            <li>✓ Guardar direcciones</li>
            <li>✓ Ofertas exclusivas</li>
            <li>✓ Seguimiento en tiempo real</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Autenticacion;
