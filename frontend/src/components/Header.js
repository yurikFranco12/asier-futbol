import React from 'react';
import '../styles/Header.css';

function Header() {
  return (
    <header className="header">
      <div className="header-container">
        <div className="logo">
          <h1>🏆 AsierFutbol</h1>
        </div>
        <nav className="nav">
          <a href="#home">Inicio</a>
          <a href="#tienda">Tienda</a>
          <a href="#about">Sobre nosotros</a>
        </nav>
        <div className="cart-icon">
          🛒 Carrito
        </div>
      </div>
    </header>
  );
}

export default Header;