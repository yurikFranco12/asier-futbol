import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Cabecera from '../components/Cabecera';
import GridProducto from '../components/GridProducto';
import { obtenerProductos, obtenerCategorias } from '../api/productos';
import '../styles/Catalogo.css';

function Catalogo() {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();
  const slugActivo = searchParams.get('categoria');

  useEffect(() => {
    Promise.all([obtenerProductos(), obtenerCategorias()])
      .then(([listaProductos, listaCategorias]) => {
        setProductos(listaProductos);
        setCategorias(listaCategorias);
      })
      .catch(() => setError('No se pudieron cargar los productos. ¿Está el servidor encendido?'))
      .finally(() => setCargando(false));
  }, []);

  const seleccionar = (slug) => {
    setSearchParams(slug ? { categoria: slug } : {});
  };

  const padreActivo = categorias.find(p =>
    p.slug === slugActivo || p.hijos.some(h => h.slug === slugActivo)
  );
  const hijoActivo = padreActivo?.hijos.find(h => h.slug === slugActivo);

  const visibles = slugActivo
    ? productos.filter(p => p.categoriaSlug === slugActivo || p.categoriaPadreSlug === slugActivo)
    : productos;

  const titulo = hijoActivo?.nombre || padreActivo?.nombre || 'Todos los productos';

  return (
    <div>
      <Cabecera />
      <div className="catalogo-container">
        <section className="catalogo-header">
          <h1>Nuestro Catálogo</h1>
          <p>Descubre nuestra colección completa de equipamiento deportivo de calidad</p>

          {categorias.length > 0 && (
            <nav className="catalogo-filtros" aria-label="Categorías">
              <div className="filtros-fila">
                <button
                  className={`filtro-chip ${!slugActivo ? 'activo' : ''}`}
                  onClick={() => seleccionar(null)}
                >
                  Todos <span className="filtro-total">{productos.length}</span>
                </button>
                {categorias.map(padre => (
                  <button
                    key={padre.id}
                    className={`filtro-chip ${padreActivo?.id === padre.id ? 'activo' : ''}`}
                    onClick={() => seleccionar(padre.slug)}
                  >
                    {padre.nombre} <span className="filtro-total">{padre.total}</span>
                  </button>
                ))}
              </div>

              {padreActivo && (
                <div className="filtros-fila filtros-sub">
                  {padreActivo.hijos.map(hijo => (
                    <button
                      key={hijo.id}
                      className={`filtro-chip filtro-chip-sub ${hijoActivo?.id === hijo.id ? 'activo' : ''}`}
                      onClick={() => seleccionar(hijoActivo?.id === hijo.id ? padreActivo.slug : hijo.slug)}
                    >
                      {hijo.nombre} <span className="filtro-total">{hijo.total}</span>
                    </button>
                  ))}
                </div>
              )}
            </nav>
          )}
        </section>

        {cargando && <p className="catalogo-estado">Cargando productos...</p>}
        {error && <p className="catalogo-estado catalogo-error">{error}</p>}
        {!cargando && !error && (
          visibles.length > 0
            ? <GridProducto productos={visibles} titulo={titulo} />
            : <p className="catalogo-estado">Aún no hay productos en {titulo}.</p>
        )}
      </div>
    </div>
  );
}

export default Catalogo;
