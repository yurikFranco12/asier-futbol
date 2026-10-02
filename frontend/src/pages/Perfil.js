import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Cabecera from '../components/Cabecera';
import { ContextoAutenticacion } from '../contexto/ContextoAutenticacion';
import '../styles/Perfil.css';

function Perfil() {
  const navigate = useNavigate();
  const { usuario, token, logout, actualizarPerfil, cambiarContraseña, eliminarCuenta } = useContext(ContextoAutenticacion);

  const [seccion, setSeccion] = useState('datos'); // 'datos', 'contraseña', 'eliminar'
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);

  const [formularioDatos, setFormularioDatos] = useState({
    nombre_completo: usuario?.nombre_completo || '',
    telefono: usuario?.telefono || '',
    direccion: usuario?.direccion || '',
    ciudad: usuario?.ciudad || '',
    codigo_postal: usuario?.codigo_postal || ''
  });

  const [formularioContraseña, setFormularioContraseña] = useState({
    contraseña_actual: '',
    contraseña_nueva: '',
    confirmar_contraseña: ''
  });

  const [contraseñaEliminacion, setContraseñaEliminacion] = useState('');

  const manejarCambioDatos = (e) => {
    const { name, value } = e.target;
    setFormularioDatos(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const manejarCambioContraseña = (e) => {
    const { name, value } = e.target;
    setFormularioContraseña(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const guardarDatos = async (e) => {
    e.preventDefault();
    setCargando(true);
    setError('');
    setExito('');

    const resultado = await actualizarPerfil(formularioDatos);

    if (resultado.success) {
      setExito('Datos actualizados correctamente');
    } else {
      setError(resultado.error);
    }

    setCargando(false);
  };

  const cambiarPass = async (e) => {
    e.preventDefault();
    setCargando(true);
    setError('');
    setExito('');

    if (formularioContraseña.contraseña_nueva !== formularioContraseña.confirmar_contraseña) {
      setError('Las contraseñas no coinciden');
      setCargando(false);
      return;
    }

    if (formularioContraseña.contraseña_nueva.length < 6) {
      setError('La nueva contraseña debe tener al menos 6 caracteres');
      setCargando(false);
      return;
    }

    const resultado = await cambiarContraseña(
      formularioContraseña.contraseña_actual,
      formularioContraseña.contraseña_nueva
    );

    if (resultado.success) {
      setExito('Contraseña cambiada correctamente');
      setFormularioContraseña({
        contraseña_actual: '',
        contraseña_nueva: '',
        confirmar_contraseña: ''
      });
    } else {
      setError(resultado.error);
    }

    setCargando(false);
  };

  const eliminarCuentaFinal = async () => {
    if (!contraseñaEliminacion) {
      setError('Debes ingresar tu contraseña para confirmar');
      return;
    }

    setCargando(true);
    setError('');

    const resultado = await eliminarCuenta(contraseñaEliminacion);

    if (resultado.success) {
      setExito('Cuenta eliminada. Redirigiendo...');
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } else {
      setError(resultado.error);
      setCargando(false);
    }
  };

  if (!usuario || !token) {
    return (
      <div>
        <Cabecera />
        <div className="perfil-container">
          <div className="perfil-vacio">
            <h2>🔒 Debes iniciar sesión</h2>
            <p>Para acceder a tu perfil necesitas estar logueado</p>
            <button onClick={() => navigate('/autenticacion')}>
              Ir a Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Cabecera />
      <div className="perfil-container">
        <div className="perfil-header">
          <h1>👤 Mi Perfil</h1>
          <p>Gestiona tu información y cuenta</p>
        </div>

        <div className="perfil-contenido">
          <aside className="perfil-sidebar">
            <nav className="perfil-nav">
              <button
                className={`nav-item ${seccion === 'datos' ? 'activo' : ''}`}
                onClick={() => setSeccion('datos')}
              >
                📋 Mis Datos
              </button>
              <button
                className={`nav-item ${seccion === 'contraseña' ? 'activo' : ''}`}
                onClick={() => setSeccion('contraseña')}
              >
                🔑 Cambiar Contraseña
              </button>
              <button
                className={`nav-item ${seccion === 'eliminar' ? 'activo' : ''}`}
                onClick={() => setSeccion('eliminar')}
              >
                ⚠️ Eliminar Cuenta
              </button>
              <button
                className="nav-item logout"
                onClick={() => {
                  logout();
                  navigate('/');
                }}
              >
                🚪 Cerrar Sesión
              </button>
            </nav>
          </aside>

          <main className="perfil-main">
            {error && <div className="mensaje-error">❌ {error}</div>}
            {exito && <div className="mensaje-exito">✅ {exito}</div>}

            {/* SECCIÓN: MIS DATOS */}
            {seccion === 'datos' && (
              <section className="perfil-seccion">
                <h2>Información Personal</h2>
                <form onSubmit={guardarDatos} className="perfil-formulario">
                  <div className="info-grupo">
                    <span className="label-info">Email:</span>
                    <span className="valor-info">{usuario.email}</span>
                    <small>(No se puede cambiar)</small>
                  </div>

                  <div className="form-grupo">
                    <label>Nombre Completo *</label>
                    <input
                      type="text"
                      name="nombre_completo"
                      value={formularioDatos.nombre_completo}
                      onChange={manejarCambioDatos}
                      required
                    />
                  </div>

                  <div className="form-grupo">
                    <label>Teléfono</label>
                    <input
                      type="tel"
                      name="telefono"
                      value={formularioDatos.telefono}
                      onChange={manejarCambioDatos}
                    />
                  </div>

                  <div className="form-grupo">
                    <label>Dirección</label>
                    <input
                      type="text"
                      name="direccion"
                      placeholder="Calle y número"
                      value={formularioDatos.direccion}
                      onChange={manejarCambioDatos}
                    />
                  </div>

                  <div className="form-fila">
                    <div className="form-grupo">
                      <label>Ciudad</label>
                      <input
                        type="text"
                        name="ciudad"
                        value={formularioDatos.ciudad}
                        onChange={manejarCambioDatos}
                      />
                    </div>

                    <div className="form-grupo">
                      <label>Código Postal</label>
                      <input
                        type="text"
                        name="codigo_postal"
                        value={formularioDatos.codigo_postal}
                        onChange={manejarCambioDatos}
                      />
                    </div>
                  </div>

                  <div className="info-registro">
                    <p>Miembro desde: {new Date(usuario.fecha_registro).toLocaleDateString('es-ES')}</p>
                  </div>

                  <button type="submit" className="btn-principal" disabled={cargando}>
                    {cargando ? '⏳ Guardando...' : '💾 Guardar Cambios'}
                  </button>
                </form>
              </section>
            )}

            {/* SECCIÓN: CAMBIAR CONTRASEÑA */}
            {seccion === 'contraseña' && (
              <section className="perfil-seccion">
                <h2>Cambiar Contraseña</h2>
                <p className="seccion-descripcion">
                  Por seguridad, debes ingresar tu contraseña actual para establecer una nueva.
                </p>

                <form onSubmit={cambiarPass} className="perfil-formulario">
                  <div className="form-grupo">
                    <label>Contraseña Actual *</label>
                    <input
                      type="password"
                      name="contraseña_actual"
                      placeholder="••••••••"
                      value={formularioContraseña.contraseña_actual}
                      onChange={manejarCambioContraseña}
                      required
                    />
                  </div>

                  <div className="form-grupo">
                    <label>Nueva Contraseña *</label>
                    <input
                      type="password"
                      name="contraseña_nueva"
                      placeholder="••••••••"
                      value={formularioContraseña.contraseña_nueva}
                      onChange={manejarCambioContraseña}
                      required
                    />
                    <small>Mínimo 6 caracteres</small>
                  </div>

                  <div className="form-grupo">
                    <label>Confirmar Contraseña *</label>
                    <input
                      type="password"
                      name="confirmar_contraseña"
                      placeholder="••••••••"
                      value={formularioContraseña.confirmar_contraseña}
                      onChange={manejarCambioContraseña}
                      required
                    />
                  </div>

                  <button type="submit" className="btn-principal" disabled={cargando}>
                    {cargando ? '⏳ Actualizando...' : '🔑 Cambiar Contraseña'}
                  </button>
                </form>
              </section>
            )}

            {/* SECCIÓN: ELIMINAR CUENTA */}
            {seccion === 'eliminar' && (
              <section className="perfil-seccion eliminar-cuenta">
                <h2>⚠️ Zona de Peligro</h2>

                {!mostrarConfirmacion ? (
                  <div className="advertencia">
                    <p className="texto-advertencia">
                      Una vez que elimines tu cuenta, no hay forma de recuperarla.
                      Se eliminarán permanentemente:
                    </p>
                    <ul>
                      <li>Tu perfil y datos personales</li>
                      <li>Tus pedidos y historial</li>
                      <li>Tu información de envío guardada</li>
                    </ul>
                    <button
                      className="btn-peligro"
                      onClick={() => setMostrarConfirmacion(true)}
                    >
                      Continuar para Eliminar Cuenta
                    </button>
                  </div>
                ) : (
                  <div className="confirmacion">
                    <p className="texto-confirmacion">
                      Por favor, ingresa tu contraseña para confirmar la eliminación:
                    </p>

                    <div className="form-grupo">
                      <label>Contraseña *</label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={contraseñaEliminacion}
                        onChange={(e) => {
                          setContraseñaEliminacion(e.target.value);
                          setError('');
                        }}
                      />
                    </div>

                    <div className="botones-confirmacion">
                      <button
                        className="btn-secundario"
                        onClick={() => {
                          setMostrarConfirmacion(false);
                          setContraseñaEliminacion('');
                          setError('');
                        }}
                        disabled={cargando}
                      >
                        Cancelar
                      </button>
                      <button
                        className="btn-eliminar"
                        onClick={eliminarCuentaFinal}
                        disabled={cargando || !contraseñaEliminacion}
                      >
                        {cargando ? '⏳ Eliminando...' : '🗑️ Eliminar Permanentemente'}
                      </button>
                    </div>
                  </div>
                )}
              </section>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default Perfil;
