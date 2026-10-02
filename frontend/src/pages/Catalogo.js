import React, { useEffect, useState } from 'react';
import Cabecera from '../components/Cabecera';
import GridProducto from '../components/GridProducto';
import { obtenerProductos } from '../api/productos';
import '../styles/Catalogo.css';

function Catalogo() {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    obtenerProductos()
      .then(setProductos)
      .catch(() => setError('No se pudieron cargar los productos. ¿Está el servidor encendido?'))
      .finally(() => setCargando(false));
  }, []);

  return (
    <div>
      <Cabecera />
      <div className="catalogo-container">
        <section className="catalogo-header">
          <h1>Nuestro Catálogo</h1>
          <p>Descubre nuestra colección completa de equipamiento deportivo de calidad</p>
          <div className="catalogo-filtros">
            <span className="filtro-activo">Todos los productos</span>
          </div>
        </section>

        {cargando && <p className="catalogo-estado">Cargando productos...</p>}
        {error && <p className="catalogo-estado catalogo-error">{error}</p>}
        {!cargando && !error && <GridProducto productos={productos} />}
      </div>
    </div>
  );
}

export default Catalogo;
