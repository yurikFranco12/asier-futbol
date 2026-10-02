import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/TarjetaProducto.css';

function TarjetaProducto({ producto }) {
  return (
    <Link to={`/producto/${producto.id}`} className="tarjeta-producto">
      <img src={producto.image} alt={producto.name} className="producto-imagen" />
      <h3>{producto.name}</h3>
      <p className="precio">${producto.price}</p>
      <div className="boton-agregar">
        Ver detalles →
      </div>
    </Link>
  );
}

export default TarjetaProducto;