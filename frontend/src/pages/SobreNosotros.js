import React from 'react';
import Cabecera from '../components/Cabecera';
import '../styles/SobreNosotros.css';

function SobreNosotros() {
  return (
    <div>
      <Cabecera />
      <div className="sobre-nosotros">
        {/* Hero Section */}
        <section className="hero-about">
          <div className="hero-content">
            <h1>Sobre PakSports</h1>
            <p>Tu tienda de confianza para equipamiento deportivo de calidad</p>
          </div>
        </section>

        {/* Misión, Visión, Valores */}
        <section className="valores">
          <div className="contenedor-valores">
            <div className="valor-card">
              <div className="valor-icon">🎯</div>
              <h3>Nuestra Misión</h3>
              <p>Proporcionar equipamiento deportivo de alta calidad accesible para todos, promoviendo un estilo de vida activo y saludable.</p>
            </div>

            <div className="valor-card">
              <div className="valor-icon">👁️</div>
              <h3>Nuestra Visión</h3>
              <p>Ser la tienda deportiva de referencia en la región, conocida por excelencia, confianza y atención al cliente excepcional.</p>
            </div>

            <div className="valor-card">
              <div className="valor-icon">⭐</div>
              <h3>Nuestros Valores</h3>
              <p>Calidad, integridad, pasión por el deporte y compromiso con la satisfacción total de nuestros clientes.</p>
            </div>
          </div>
        </section>

        {/* Historia */}
        <section className="historia">
          <div className="historia-contenedor">
            <div className="historia-texto">
              <h2>Nuestra Historia</h2>
              <p>
                PakSports nació con la passion por el deporte y la determinación de ofrecer los mejores productos
                a precios competitivos. Desde nuestros humildes comienzos, hemos crecido para convertirnos en un referente
                en el equipamiento deportivo de calidad.
              </p>
              <p>
                Cada producto en nuestro catálogo es seleccionado cuidadosamente por nuestro equipo de expertos
                para garantizar que cumple con los más altos estándares de calidad y durabilidad.
              </p>
            </div>
            <div className="placeholder-imagen">📦</div>
          </div>
        </section>

        {/* Equipo */}
        <section className="equipo">
          <h2>Nuestro Equipo</h2>
          <div className="miembros-equipo">
            <div className="miembro-card">
              <div className="miembro-avatar">👤</div>
              <h4>Asier García</h4>
              <p>Fundador & Gerente General</p>
            </div>

            <div className="miembro-card">
              <div className="miembro-avatar">👤</div>
              <h4>María Rodríguez</h4>
              <p>Gerente de Operaciones</p>
            </div>

            <div className="miembro-card">
              <div className="miembro-avatar">👤</div>
              <h4>Carlos López</h4>
              <p>Especialista en Productos</p>
            </div>

            <div className="miembro-card">
              <div className="miembro-avatar">👤</div>
              <h4>Jennifer Martín</h4>
              <p>Coordinadora de Servicio al Cliente</p>
            </div>
          </div>
        </section>

        {/* Por qué elegirnos */}
        <section className="por-que-elegirnos">
          <h2>¿Por Qué Elegirnos?</h2>
          <div className="razones">
            <div className="razon">
              <span className="numero">✓</span>
              <h4>Productos Certificados</h4>
              <p>Todos nuestros productos cumplen con estándares internacionales de calidad</p>
            </div>

            <div className="razon">
              <span className="numero">✓</span>
              <h4>Precios Competitivos</h4>
              <p>Ofrecemos la mejor relación calidad-precio en el mercado</p>
            </div>

            <div className="razon">
              <span className="numero">✓</span>
              <h4>Envíos Rápidos</h4>
              <p>Entrega a domicilio en 24-48 horas en toda la región</p>
            </div>

            <div className="razon">
              <span className="numero">✓</span>
              <h4>Atención Personalizada</h4>
              <p>Nuestro equipo está siempre disponible para ayudarte</p>
            </div>

            <div className="razon">
              <span className="numero">✓</span>
              <h4>Garantía Total</h4>
              <p>Garantía en todos los productos con devolución sin preguntas</p>
            </div>

            <div className="razon">
              <span className="numero">✓</span>
              <h4>Comunidad Activa</h4>
              <p>Únete a miles de clientes satisfechos que confían en nosotros</p>
            </div>
          </div>
        </section>

        {/* Contacto CTA */}
        <section className="contacto-cta">
          <h2>¿Tienes Preguntas?</h2>
          <p>Estamos aquí para ayudarte</p>
          <div className="contacto-info">
            <div className="info-item">
              <span>📧</span>
              <p>info@paksports.com</p>
            </div>
            <div className="info-item">
              <span>📞</span>
              <p>+34 123 456 789</p>
            </div>
            <div className="info-item">
              <span>📍</span>
              <p>Calle Principal 123, Ciudad</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default SobreNosotros;
