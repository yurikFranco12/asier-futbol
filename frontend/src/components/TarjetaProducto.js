import React, { useContext } from 'react';
import { ContextoCarrito } from '../contexto/ContextoCarrito';
import '../styles/TarjetaProducto.css';

function TarjetaProducto({ producto }) {
  const { agregarAlCarrito } = useContext(ContextoCarrito);

  return (
    <div className="tarjeta-producto">
      <img src={producto.image} alt={producto.name} className="producto-imagen" />
      <h3>{producto.name}</h3>
      <p className="precio">${producto.price}</p>
      <button 
        className="boton-agregar"
        onClick={() => agregarAlCarrito(producto)}
      >
        Agregar al carrito
      </button>
    </div>
  );
}

export default TarjetaProducto;