import React from 'react';
import '../styles/HeroSection.css';

function HeroSection() {
  return (
    <section className="hero">
      <div className="hero-content">
        <h2>La j*dida PakSports!</h2>
        <p>Los mejores equipamientos deportivos, directamente para ti</p>
        <button className="cta-button" onClick={() => window.location.href = '/catalogo'}> Mostrar catálogo</button>
      </div>
    </section>
  );
}

export default HeroSection;