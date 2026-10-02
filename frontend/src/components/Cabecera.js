import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ContextoCarrito } from '../contexto/ContextoCarrito';
import { ContextoAutenticacion } from '../contexto/ContextoAutenticacion';
import '../styles/Cabecera.css';

function Cabecera() {
  const navigate = useNavigate();
  const { carrito } = useContext(ContextoCarrito);
  const { usuario, estaLogueado, logout } = useContext(ContextoAutenticacion);
  const cantidad = carrito.length;

  return (
    <header className="header">
      <div className="header-container">
        <div className="logo" onClick={() => navigate('/')}>
          <img src="/logoPak.png" alt="AsierFutbol" className="logo-img" />
          <h1>PakSports</h1>
        </div>
        <nav className="nav">
          <a onClick={(e) => { e.preventDefault(); navigate('/'); }}>Inicio</a>
          <a onClick={(e) => { e.preventDefault(); navigate('/catalogo'); }}>Catálogo</a>
          <a onClick={(e) => { e.preventDefault(); navigate('/sobre-nosotros'); }}>Sobre nosotros</a>
        </nav>
        <div className="header-acciones">
          <div className="cart-icon" onClick={() => navigate('/carrito')}>
            🛒 Carrito ({cantidad})
          </div>

          {estaLogueado ? (
            <div className="usuario-menu">
              <button className="btn-perfil" onClick={() => navigate('/perfil')}>
                👤 {usuario.nombre_completo.split(' ')[0]}
              </button>
              <button className="btn-logout" onClick={() => {
                logout();
                navigate('/');
              }}>
                🚪 Salir
              </button>
            </div>
          ) : (
            <button className="btn-login" onClick={() => navigate('/autenticacion')}>
              🔐 Iniciar Sesión
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

export default Cabecera;