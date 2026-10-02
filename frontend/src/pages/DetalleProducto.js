import React, { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Cabecera from '../components/Cabecera';
import { ContextoCarrito } from '../contexto/ContextoCarrito';
import { obtenerProducto } from '../api/productos';
import '../styles/DetalleProducto.css';

function DetalleProducto() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { agregarAlCarrito } = useContext(ContextoCarrito);
  const [cantidad, setCantidad] = useState(1);
  const [producto, setProducto] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    setCargando(true);
    obtenerProducto(id)
      .then(setProducto)
      .catch(() => setProducto(null))
      .finally(() => setCargando(false));
  }, [id]);

  if (cargando) {
    return (
      <div>
        <Cabecera />
        <div className="detalle-no-encontrado">
          <h2>Cargando producto...</h2>
        </div>
      </div>
    );
  }

  if (!producto) {
    return (
      <div>
        <Cabecera />
        <div className="detalle-no-encontrado">
          <h2>Producto no encontrado</h2>
          <button onClick={() => navigate('/catalogo')}>Volver al catálogo</button>
        </div>
      </div>
    );
  }

  const handleAgregarAlCarrito = () => {
    agregarAlCarrito(producto, cantidad);
    navigate('/carrito');
  };

  return (
    <div>
      <Cabecera />
      <div className="detalle-container">
        <button className="btn-volver" onClick={() => navigate('/catalogo')}>
          ← Volver al catálogo
        </button>

        <div className="detalle-contenido">
          <div className="detalle-imagen">
            <img src={producto.image} alt={producto.name} />
          </div>

          <div className="detalle-info">
            <h1>{producto.name}</h1>

            <div className="precio-detalle">
              <span className="precio-grande">${producto.price.toFixed(2)}</span>
            </div>

            {producto.description && <p className="descripcion">{producto.description}</p>}

            {producto.caracteristicas.length > 0 && (
              <div className="caracteristicas">
                <h3>Características:</h3>
                <ul>
                  {producto.caracteristicas.map((carac, index) => (
                    <li key={index}>{carac}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="seccion-compra">
              <div className="selector-cantidad">
                <label>Cantidad:</label>
                <div className="cantidad-controls">
                  <button onClick={() => setCantidad(Math.max(1, cantidad - 1))}>−</button>
                  <span className="cantidad-valor">{cantidad}</span>
                  <button onClick={() => setCantidad(cantidad + 1)}>+</button>
                </div>
              </div>

              <button className="btn-comprar" onClick={handleAgregarAlCarrito}>
                Agregar al carrito - ${(producto.price * cantidad).toFixed(2)}
              </button>
            </div>

            <div className="info-adicional">
              <p>✓ Envío gratis en compras mayores a $100</p>
              <p>✓ Garantía de 1 año en todos los productos</p>
              <p>✓ Devolución fácil en 30 días</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DetalleProducto;
