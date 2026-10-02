import React from 'react';
import { useNavigate } from 'react-router-dom';
import Cabecera from '../components/Cabecera';
import HeroSection from '../components/HeroSection';
import '../styles/Inicio.css';

function Inicio() {
  const navigate = useNavigate();

  return (
    <div>
      <Cabecera />
      <HeroSection />

      <section className="seccion-bienvenida">
        <div className="contenedor-bienvenida">
          <h2>Bienvenido a PakSports</h2>
          <p className="subtitulo">Tu destino número uno para equipamiento deportivo premium</p>

          <div className="grid-caracteristicas">
            <div className="caracteristica-card">
              <div className="icono">🏆</div>
              <h3>Calidad Premium</h3>
              <p>Productos seleccionados de las mejores marcas deportivas del mundo</p>
            </div>

            <div className="caracteristica-card">
              <div className="icono">⚡</div>
              <h3>Envío Rápido</h3>
              <p>Entrega en 24-48 horas a cualquier lugar de la región</p>
            </div>

            <div className="caracteristica-card">
              <div className="icono">💚</div>
              <h3>Garantía Total</h3>
              <p>1 año de garantía en todos nuestros productos</p>
            </div>

            <div className="caracteristica-card">
              <div className="icono">🤝</div>
              <h3>Atención Personal</h3>
              <p>Servicio al cliente disponible para ayudarte en todo momento</p>
            </div>
          </div>
        </div>
      </section>

      <section className="seccion-cta">
        <div className="cta-contenido">
          <h2>Descubre Nuestros Productos</h2>
          <p>Explora nuestra colección completa de equipamiento deportivo de calidad</p>
          <button className="btn-catalogo" onClick={() => navigate('/catalogo')}>
            Ver Catálogo
          </button>
        </div>
      </section>

      <section className="seccion-stats">
        <div className="stat-item">
          <div className="stat-numero">5000+</div>
          <div className="stat-texto">Clientes Satisfechos</div>
        </div>
        <div className="stat-item">
          <div className="stat-numero">150+</div>
          <div className="stat-texto">Productos Disponibles</div>
        </div>
        <div className="stat-item">
          <div className="stat-numero">24/7</div>
          <div className="stat-texto">Soporte Disponible</div>
        </div>
        <div className="stat-item">
          <div className="stat-numero">99%</div>
          <div className="stat-texto">Satisfacción Garantizada</div>
        </div>
      </section>

      <section className="seccion-llamada">
        <div className="llamada-contenido">
          <h2>¿Listo Para Comenzar?</h2>
          <p>Explora nuestro catálogo y encuentra el equipamiento perfecto para ti</p>
          <div className="botones-llamada">
            <button className="btn-primary" onClick={() => navigate('/catalogo')}>
              Explorar Catálogo
            </button>
            <button className="btn-secondary" onClick={() => navigate('/sobre-nosotros')}>
              Conoce Más Sobre Nosotros
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Inicio;
