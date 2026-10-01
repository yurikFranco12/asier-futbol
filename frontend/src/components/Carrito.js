import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ContextoCarrito } from '../contexto/ContextoCarrito';
import '../styles/Carrito.css';

function Carrito() {
  const navigate = useNavigate();
  const { carrito, eliminarDelCarrito, aumentarCantidad, disminuirCantidad, obtenerTotal } = useContext(ContextoCarrito);

  if (carrito.length === 0) {
    return (
      <div className="carrito-vacio">
        <h2>Tu carrito está vacío</h2>
        <p>Añade productos para continuar</p>
        <button onClick={() => navigate('/')}>Volver a la tienda</button>
      </div>
    );
  }

  return (
    <div className="carrito-container">
      <h2>Mi Carrito</h2>
      <div className="carrito-items">
        {carrito.map(item => (
          <div key={item.id} className="carrito-item">
            <img src={item.image} alt={item.name} />
            <div className="item-info">
              <h3>{item.name}</h3>
              <p className="item-price">${item.price}</p>
            </div>
            <div className="item-cantidad">
              <button onClick={() => disminuirCantidad(item.id)}>-</button>
              <span>{item.cantidad}</span>
              <button onClick={() => aumentarCantidad(item.id)}>+</button>
            </div>
            <div className="item-total">
              <p>${(item.price * item.cantidad).toFixed(2)}</p>
              <button className="eliminar" onClick={() => eliminarDelCarrito(item.id)}>Eliminar</button>
            </div>
          </div>
        ))}
      </div>
      <div className="carrito-resumen">
        <h3>Total: ${obtenerTotal()}</h3>
        <button className="proceder-pago" onClick={() => navigate('/pago')}>
          Proceder al pago
        </button>
      </div>
    </div>
  );
}

export default Carrito;