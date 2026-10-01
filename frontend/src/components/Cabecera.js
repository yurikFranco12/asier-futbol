import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ContextoCarrito } from '../contexto/ContextoCarrito';
import '../styles/Cabecera.css';

function Cabecera() {
  const navigate = useNavigate();
  const { carrito } = useContext(ContextoCarrito);
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
          <a href="#tienda" >Tienda</a>
          <a href="#" onClick={(e) => { e.preventDefault(); navigate('/'); }}>Sobre nosotros</a>
        </nav>
        <div className="cart-icon" onClick={() => navigate('/carrito')}>
          🛒 Carrito ({cantidad})
        </div>
      </div>
    </header>
  );
}

export default Cabecera;