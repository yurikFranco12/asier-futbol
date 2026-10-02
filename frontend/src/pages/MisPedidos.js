import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Cabecera from '../components/Cabecera';
import { ContextoAutenticacion } from '../contexto/ContextoAutenticacion';
import '../styles/MisPedidos.css';

function MisPedidos() {
  const navigate = useNavigate();
  const { estaLogueado, token } = useContext(ContextoAutenticacion);
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);

  useEffect(() => {
    if (!estaLogueado) {
      navigate('/autenticacion');
      return;
    }

    obtenerPedidos();
  }, [estaLogueado, token]);

  const obtenerPedidos = async () => {
    try {
      setCargando(true);
      const response = await fetch('http://localhost:5000/api/auth/mis-pedidos', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const datos = await response.json();

      if (!response.ok) {
        throw new Error(datos.error || 'Error al obtener pedidos');
      }

      setPedidos(datos.pedidos || []);
      setError('');
    } catch (err) {
      setError(err.message);
      console.error('Error:', err);
    } finally {
      setCargando(false);
    }
  };

  const obtenerDetallesPedido = async (pedidoId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/auth/mi-pedido/${pedidoId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const datos = await response.json();

      if (!response.ok) {
        throw new Error(datos.error);
      }

      setPedidoSeleccionado(datos.pedido);
    } catch (err) {
      console.error('Error:', err);
      setError(err.message);
    }
  };

  const pedidosFiltrados = filtroEstado === 'todos'
    ? pedidos
    : pedidos.filter(p => p.estado === filtroEstado);

  const getColorEstado = (estado) => {
    const colores = {
      'pendiente': '#ff9800',
      'confirmado': '#2196f3',
      'en_transito': '#9c27b0',
      'en_entrega': '#ff6b6b',
      'entregado': '#4caf50',
      'cancelado': '#999'
    };
    return colores[estado] || '#999';
  };

  const getIconoEstado = (estado) => {
    const iconos = {
      'pendiente': '⏳',
      'confirmado': '✅',
      'en_transito': '🚚',
      'en_entrega': '📦',
      'entregado': '🎉',
      'cancelado': '❌'
    };
    return iconos[estado] || '❓';
  };

  const getTextoEstado = (estado) => {
    const textos = {
      'pendiente': 'Pendiente',
      'confirmado': 'Confirmado',
      'en_transito': 'En Tránsito',
      'en_entrega': 'En Entrega',
      'entregado': 'Entregado',
      'cancelado': 'Cancelado'
    };
    return textos[estado] || estado;
  };

  if (!estaLogueado) {
    return null;
  }

  return (
    <div>
      <Cabecera />
      <div className="mis-pedidos-container">
        <div className="pedidos-header">
          <h1>📦 Mis Pedidos</h1>
          <p>Historial de compras y estado de tus pedidos</p>
        </div>

        {error && <div className="mensaje-error">❌ {error}</div>}

        {cargando ? (
          <div className="pedidos-cargando">
            <p>⏳ Cargando pedidos...</p>
          </div>
        ) : pedidos.length === 0 ? (
          <div className="pedidos-vacio">
            <h2>📭 No tienes pedidos aún</h2>
            <p>¡Comienza a comprar en nuestro catálogo!</p>
            <button onClick={() => navigate('/catalogo')}>
              Ir al Catálogo
            </button>
          </div>
        ) : (
          <div className="pedidos-contenido">
            <aside className="pedidos-filtros">
              <h3>Filtrar por Estado</h3>
              <button
                className={`filtro-btn ${filtroEstado === 'todos' ? 'activo' : ''}`}
                onClick={() => setFiltroEstado('todos')}
              >
                📋 Todos ({pedidos.length})
              </button>
              <button
                className={`filtro-btn ${filtroEstado === 'pendiente' ? 'activo' : ''}`}
                onClick={() => setFiltroEstado('pendiente')}
              >
                ⏳ Pendientes ({pedidos.filter(p => p.estado === 'pendiente').length})
              </button>
              <button
                className={`filtro-btn ${filtroEstado === 'confirmado' ? 'activo' : ''}`}
                onClick={() => setFiltroEstado('confirmado')}
              >
                ✅ Confirmados ({pedidos.filter(p => p.estado === 'confirmado').length})
              </button>
              <button
                className={`filtro-btn ${filtroEstado === 'en_transito' ? 'activo' : ''}`}
                onClick={() => setFiltroEstado('en_transito')}
              >
                🚚 En Tránsito ({pedidos.filter(p => p.estado === 'en_transito').length})
              </button>
              <button
                className={`filtro-btn ${filtroEstado === 'entregado' ? 'activo' : ''}`}
                onClick={() => setFiltroEstado('entregado')}
              >
                🎉 Entregados ({pedidos.filter(p => p.estado === 'entregado').length})
              </button>
            </aside>

            <main className="pedidos-lista">
              {pedidosFiltrados.length === 0 ? (
                <div className="sin-resultados">
                  <p>No hay pedidos con este estado</p>
                </div>
              ) : (
                pedidosFiltrados.map(pedido => {
                  const totalNumero = typeof pedido.total === 'string' ? parseFloat(pedido.total) : pedido.total;

                  return (
                  <div key={pedido.id} className="tarjeta-pedido">
                    <div className="pedido-encabezado">
                      <div className="pedido-numero">
                        <h3>Pedido #{pedido.id}</h3>
                        <p className="fecha">
                          {new Date(pedido.fecha_pedido).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>

                      <div className="pedido-estado">
                        <span
                          className="estado-badge"
                          style={{ backgroundColor: getColorEstado(pedido.estado) }}
                        >
                          {getIconoEstado(pedido.estado)} {getTextoEstado(pedido.estado)}
                        </span>
                      </div>
                    </div>

                    <div className="pedido-info">
                      <div className="info-fila">
                        <span className="label">Total:</span>
                        <span className="valor precio">${totalNumero.toFixed(2)}</span>
                      </div>
                      <div className="info-fila">
                        <span className="label">Items:</span>
                        <span className="valor">{pedido.cantidad_items} producto(s)</span>
                      </div>
                      <div className="info-fila">
                        <span className="label">Dirección:</span>
                        <span className="valor dirección">{pedido.direccion_envio}</span>
                      </div>
                    </div>

                    <button
                      className="btn-detalles"
                      onClick={() => obtenerDetallesPedido(pedido.id)}
                    >
                      Ver Detalles →
                    </button>
                  </div>
                  );
                })
              )}
            </main>
          </div>
        )}

        {/* Modal de detalles */}
        {pedidoSeleccionado && (() => {
          const totalNumeroModal = typeof pedidoSeleccionado.total === 'string' ? parseFloat(pedidoSeleccionado.total) : pedidoSeleccionado.total;

          return (
          <div className="modal-overlay" onClick={() => setPedidoSeleccionado(null)}>
            <div className="modal-contenido" onClick={(e) => e.stopPropagation()}>
              <button className="btn-cerrar" onClick={() => setPedidoSeleccionado(null)}>
                ✕
              </button>

              <h2>Detalles del Pedido #{pedidoSeleccionado.id}</h2>

              <div className="modal-estado">
                <span
                  className="estado-badge-grande"
                  style={{ backgroundColor: getColorEstado(pedidoSeleccionado.estado) }}
                >
                  {getIconoEstado(pedidoSeleccionado.estado)} {getTextoEstado(pedidoSeleccionado.estado)}
                </span>
              </div>

              <div className="modal-info">
                <div className="seccion">
                  <h3>📋 Información del Pedido</h3>
                  <p><strong>Fecha:</strong> {new Date(pedidoSeleccionado.fecha_pedido).toLocaleDateString('es-ES')}</p>
                  <p><strong>Total:</strong> ${totalNumeroModal.toFixed(2)}</p>
                  <p><strong>Método de Pago:</strong> {pedidoSeleccionado.metodo_pago}</p>
                </div>

                <div className="seccion">
                  <h3>📦 Dirección de Envío</h3>
                  <p>{pedidoSeleccionado.direccion_envio}</p>
                </div>

                {pedidoSeleccionado.fecha_entrega && (
                  <div className="seccion">
                    <h3>📅 Fecha de Entrega</h3>
                    <p>{new Date(pedidoSeleccionado.fecha_entrega).toLocaleDateString('es-ES')}</p>
                  </div>
                )}

                <div className="seccion">
                  <h3>🛒 Productos</h3>
                  <div className="items-lista">
                    {pedidoSeleccionado.items && pedidoSeleccionado.items.map(item => {
                      const precioNum = typeof item.precio_unitario === 'string' ? parseFloat(item.precio_unitario) : item.precio_unitario;
                      const subtotalNum = typeof item.subtotal === 'string' ? parseFloat(item.subtotal) : item.subtotal;

                      return (
                      <div key={item.id} className="item-detalle">
                        <div className="item-imagen">
                          <img src={item.imagen_url} alt={item.nombre} />
                        </div>
                        <div className="item-info">
                          <h4>{item.nombre}</h4>
                          <p>Cantidad: {item.cantidad}</p>
                          <p>Precio unitario: ${precioNum.toFixed(2)}</p>
                          <p className="subtotal">Subtotal: ${subtotalNum.toFixed(2)}</p>
                        </div>
                      </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <button className="btn-cerrar-modal" onClick={() => setPedidoSeleccionado(null)}>
                Cerrar
              </button>
            </div>
          </div>
          );
        })()}
      </div>
    </div>
  );
}

export default MisPedidos;
