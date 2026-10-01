import React from 'react';
import TarjetaProducto from './TarjetaProducto';
import '../styles/GridProducto.css';

function GridProducto({ productos }) {
  return (
    <div className="grid-container">
      <h2 className="grid-titulo">Nuestra Tienda</h2>
      <div className="grid">
        {productos && productos.map(producto => (
          <TarjetaProducto key={producto.id} producto={producto} />
        ))}
      </div>
    </div>
  );
}

export default GridProducto;