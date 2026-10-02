import React, { useCallback, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Cabecera from '../components/Cabecera';
import { ContextoAutenticacion } from '../contexto/ContextoAutenticacion';
import { adminProductos } from '../api/productos';
import '../styles/AdminProductos.css';

const FORMULARIO_VACIO = {
  nombre: '',
  precio: '',
  cantidad_stock: '0',
  categoria: '',
  imagen_url: '',
  descripcion: '',
  caracteristicas: '',
  activo: true
};

function aFormulario(p) {
  return {
    nombre: p.nombre || '',
    precio: String(p.precio ?? ''),
    cantidad_stock: String(p.cantidad_stock ?? 0),
    categoria: p.categoria || '',
    imagen_url: p.imagen_url || '',
    descripcion: p.descripcion || '',
    caracteristicas: (p.caracteristicas || []).join('\n'),
    activo: p.activo
  };
}

function aPeticion(f) {
  return {
    nombre: f.nombre,
    precio: Number(f.precio),
    cantidad_stock: Number(f.cantidad_stock),
    categoria: f.categoria,
    imagen_url: f.imagen_url,
    descripcion: f.descripcion,
    caracteristicas: f.caracteristicas.split('\n'),
    activo: f.activo
  };
}

function AdminProductos() {
  const navigate = useNavigate();
  const { usuario, token, cargando: cargandoSesion } = useContext(ContextoAutenticacion);
  const esAdmin = usuario?.rol === 'admin';

  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [aviso, setAviso] = useState('');
  const [busqueda, setBusqueda] = useState('');

  const [editando, setEditando] = useState(null); // null = cerrado, 'nuevo' o id
  const [formulario, setFormulario] = useState(FORMULARIO_VACIO);
  const [errorFormulario, setErrorFormulario] = useState('');
  const [guardando, setGuardando] = useState(false);

  const [aEliminar, setAEliminar] = useState(null);
  const [eliminando, setEliminando] = useState(false);

  const cargarProductos = useCallback(async () => {
    setCargando(true);
    try {
      setProductos(await adminProductos.listar(token));
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }, [token]);

  useEffect(() => {
    if (esAdmin) cargarProductos();
  }, [esAdmin, cargarProductos]);

  const abrirNuevo = () => {
    setFormulario(FORMULARIO_VACIO);
    setErrorFormulario('');
    setEditando('nuevo');
  };

  const abrirEdicion = (producto) => {
    setFormulario(aFormulario(producto));
    setErrorFormulario('');
    setEditando(producto.id);
  };

  const cambiar = (e) => {
    const { name, value, type, checked } = e.target;
    setFormulario(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const guardar = async (e) => {
    e.preventDefault();
    setGuardando(true);
    setErrorFormulario('');
    try {
      if (editando === 'nuevo') {
        await adminProductos.crear(token, aPeticion(formulario));
        setAviso(`Producto "${formulario.nombre}" creado`);
      } else {
        await adminProductos.actualizar(token, editando, aPeticion(formulario));
        setAviso(`Producto "${formulario.nombre}" actualizado`);
      }
      setEditando(null);
      await cargarProductos();
    } catch (err) {
      setErrorFormulario(err.message);
    } finally {
      setGuardando(false);
    }
  };

  const confirmarEliminar = async () => {
    setEliminando(true);
    try {
      const resultado = await adminProductos.eliminar(token, aEliminar.id);
      setAviso(resultado.mensaje);
      setAEliminar(null);
      await cargarProductos();
    } catch (err) {
      setError(err.message);
      setAEliminar(null);
    } finally {
      setEliminando(false);
    }
  };

  if (cargandoSesion) return null;

  if (!esAdmin) {
    return (
      <div>
        <Cabecera />
        <div className="admin-container">
          <div className="admin-denegado">
            <h2>🔒 Acceso restringido</h2>
            <p>Esta sección es solo para administradores.</p>
            <button className="admin-btn-primario" onClick={() => navigate(usuario ? '/' : '/autenticacion')}>
              {usuario ? 'Volver al inicio' : 'Iniciar sesión'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const termino = busqueda.trim().toLowerCase();
  const visibles = productos.filter(p =>
    !termino ||
    p.nombre.toLowerCase().includes(termino) ||
    (p.categoria || '').toLowerCase().includes(termino)
  );

  return (
    <div>
      <Cabecera />
      <div className="admin-container">
        <div className="admin-header">
          <div>
            <h1>⚙️ Panel de Administración</h1>
            <p>Gestiona los productos del catálogo</p>
          </div>
          <button className="admin-btn-primario" onClick={abrirNuevo}>+ Nuevo producto</button>
        </div>

        {error && <div className="admin-mensaje admin-mensaje-error">❌ {error}</div>}
        {aviso && (
          <div className="admin-mensaje admin-mensaje-ok">
            ✅ {aviso}
            <button className="admin-mensaje-cerrar" onClick={() => setAviso('')} aria-label="Cerrar aviso">✕</button>
          </div>
        )}

        <div className="admin-toolbar">
          <input
            type="search"
            placeholder="Buscar por nombre o categoría..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
          <span className="admin-contador">
            {productos.length} productos · {productos.filter(p => !p.activo).length} ocultos
          </span>
        </div>

        {cargando ? (
          <p className="admin-estado">Cargando productos...</p>
        ) : visibles.length === 0 ? (
          <p className="admin-estado">No hay productos que coincidan.</p>
        ) : (
          <div className="admin-tabla-wrapper">
            <table className="admin-tabla">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Categoría</th>
                  <th>Precio</th>
                  <th>Stock</th>
                  <th>Estado</th>
                  <th aria-label="Acciones"></th>
                </tr>
              </thead>
              <tbody>
                {visibles.map(p => (
                  <tr key={p.id} className={p.activo ? '' : 'admin-fila-oculta'}>
                    <td>
                      <div className="admin-producto">
                        {p.imagen_url
                          ? <img src={p.imagen_url} alt="" />
                          : <div className="admin-sin-imagen">—</div>}
                        <div>
                          <strong>{p.nombre}</strong>
                          <small>#{p.id}</small>
                        </div>
                      </div>
                    </td>
                    <td>{p.categoria || '—'}</td>
                    <td className="admin-precio">${p.precio.toFixed(2)}</td>
                    <td className={p.cantidad_stock === 0 ? 'admin-sin-stock' : ''}>{p.cantidad_stock}</td>
                    <td>
                      <span className={`admin-badge ${p.activo ? 'activo' : 'oculto'}`}>
                        {p.activo ? 'Activo' : 'Oculto'}
                      </span>
                    </td>
                    <td>
                      <div className="admin-acciones">
                        <button className="admin-btn-editar" onClick={() => abrirEdicion(p)}>Editar</button>
                        <button className="admin-btn-eliminar" onClick={() => setAEliminar(p)}>Eliminar</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editando !== null && (
        <div className="admin-modal-overlay" onClick={() => !guardando && setEditando(null)}>
          <form className="admin-modal" onClick={(e) => e.stopPropagation()} onSubmit={guardar}>
            <h2>{editando === 'nuevo' ? 'Nuevo producto' : `Editar producto #${editando}`}</h2>

            {errorFormulario && <div className="admin-mensaje admin-mensaje-error">❌ {errorFormulario}</div>}

            <div className="admin-form-grid">
              <label className="admin-campo admin-campo-ancho">
                <span>Nombre *</span>
                <input name="nombre" value={formulario.nombre} onChange={cambiar} required />
              </label>

              <label className="admin-campo">
                <span>Precio ($) *</span>
                <input name="precio" type="number" min="0" step="0.01" value={formulario.precio} onChange={cambiar} required />
              </label>

              <label className="admin-campo">
                <span>Stock</span>
                <input name="cantidad_stock" type="number" min="0" step="1" value={formulario.cantidad_stock} onChange={cambiar} />
              </label>

              <label className="admin-campo admin-campo-ancho">
                <span>Categoría</span>
                <input name="categoria" value={formulario.categoria} onChange={cambiar} placeholder="botas, camisetas, balones..." />
              </label>

              <label className="admin-campo admin-campo-ancho">
                <span>URL de la imagen</span>
                <input name="imagen_url" type="url" value={formulario.imagen_url} onChange={cambiar} placeholder="https://..." />
              </label>

              {formulario.imagen_url && (
                <div className="admin-preview admin-campo-ancho">
                  <img src={formulario.imagen_url} alt="Vista previa" />
                </div>
              )}

              <label className="admin-campo admin-campo-ancho">
                <span>Descripción</span>
                <textarea name="descripcion" rows="4" value={formulario.descripcion} onChange={cambiar} />
              </label>

              <label className="admin-campo admin-campo-ancho">
                <span>Características (una por línea)</span>
                <textarea name="caracteristicas" rows="5" value={formulario.caracteristicas} onChange={cambiar} />
              </label>

              <label className="admin-check admin-campo-ancho">
                <input name="activo" type="checkbox" checked={formulario.activo} onChange={cambiar} />
                <span>Visible en el catálogo</span>
              </label>
            </div>

            <div className="admin-modal-botones">
              <button type="button" className="admin-btn-secundario" onClick={() => setEditando(null)} disabled={guardando}>
                Cancelar
              </button>
              <button type="submit" className="admin-btn-primario" disabled={guardando}>
                {guardando ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </form>
        </div>
      )}

      {aEliminar && (
        <div className="admin-modal-overlay" onClick={() => !eliminando && setAEliminar(null)}>
          <div className="admin-modal admin-modal-pequeno" onClick={(e) => e.stopPropagation()}>
            <h2>¿Eliminar "{aEliminar.nombre}"?</h2>
            <p className="admin-modal-texto">
              Si el producto aparece en pedidos anteriores, se ocultará del catálogo en lugar de borrarse,
              para conservar el historial de esos pedidos.
            </p>
            <div className="admin-modal-botones">
              <button className="admin-btn-secundario" onClick={() => setAEliminar(null)} disabled={eliminando}>
                Cancelar
              </button>
              <button className="admin-btn-peligro" onClick={confirmarEliminar} disabled={eliminando}>
                {eliminando ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminProductos;
