import React from 'react';
import '../styles/HeroSection.css';

function HeroSection() {
  return (
    <section className="hero">
      <div className="hero-content">
        <h2>Bienvenido a ColindresF*ckingShop</h2>
        <p>Los mejores equipamientos deportivos, directamente para ti</p>
        <button className="cta-button">Ir a la tienda</button>
      </div>
    </section>
  );
}

export default HeroSection;