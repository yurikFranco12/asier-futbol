import React, { useContext, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Cabecera from '../components/Cabecera';
import { ContextoCarrito } from '../contexto/ContextoCarrito';
import '../styles/DetalleProducto.css';

// Datos de productos con descripciones
const productosData = [
  {
    id: 1,
    name: 'Botas Adidas F50',
    price: 89.99,
    image: 'https://www.futbolemotion.com/imagesarticulos/335848/750/bota-adidas-f50-hyperfast-elite-ll-fg-footwear-white-solar-purple-tursol-0.webp',
    description: 'Las Botas Adidas F50 Hyperfast Elite LL representan la máxima tecnología en calzado de fútbol profesional. Diseñadas para jugadores de velocidad extrema, estas botas ofrecen un ajuste preciso y control excepcional del balón.',
    caracteristicas: [
      'Suela de carbono ultraligera',
      'Tecnología de agarre adaptativa',
      'Sistema de amortiguación avanzado',
      'Material sintético premium',
      'Peso: 165g'
    ]
  },
  {
    id: 2,
    name: 'Botas Adidas Predator',
    price: 99.99,
    image: 'https://www.futbolemotion.com/imagesarticulos/291495/750/bota-adidas-predator-elite-ft-fg-lucid-red-core-black-ftwr-white-0.webp',
    description: 'Las Botas Adidas Predator Elite FT ofrecen un control de balón inigualable gracias a su superficie de agarre textil innovadora. Perfectas para jugadores que buscan precisión y control en cada toque.',
    caracteristicas: [
      'Superficie de agarre Demonskin',
      'Amortiguación de impactos',
      'Ajuste seguro en el talón',
      'Construcción híbrida',
      'Tecnología de torsión lateral'
    ]
  },
  {
    id: 3,
    name: 'Camiseta FC Barcelona',
    price: 59.99,
    image: 'https://camisetasfutbolbaloncesto.com/cdn/shop/files/camiseta-local-fc-barcelona-2026-27-2.jpg?v=1783153616&width=1946',
    description: 'Camiseta oficial del FC Barcelona temporada 2026-27. Confeccionada con materiales de alta calidad que garantizan comodidad y durabilidad en el campo de juego.',
    caracteristicas: [
      'Tela transpirable',
      'Tecnología de secado rápido',
      'Colores vibrantes',
      'Cuello reforzado',
      'Logo bordado oficial'
    ]
  },
  {
    id: 4,
    name: 'Balón Adidas Official',
    price: 49.99,
    image: 'https://www.futbolemotion.com/imagesarticulos/192135/grandes/balon-adidas-tiro-league-white-team-colleg-burgundy-team-colleg-red-0.webp',
    description: 'Balón oficial Adidas Tiro League de máxima calidad. Diseñado para entrenamiento y competición, ofrece una trayectoria perfecta y duración extendida.',
    caracteristicas: [
      'Cubierta termosellada',
      'Cámara de butilo',
      'Circunferencia: 68-70cm',
      'Peso: 410-450g',
      'Estructura de 12 paneles'
    ]
  },
  {
    id: 5,
    name: 'Espinilleras Nike',
    price: 29.99,
    image: 'https://media.futbolmania.com/media/catalog/product/cache/1/image/0f330055bc18e2dda592b4a7c3a0ea22/s/p/sp2162-010_espinilleras-de-futbol-nike-j-guard-negro_1_frontal.jpg',
    description: 'Espinilleras Nike J Guard fabricadas con materiales de protección de máxima calidad. Protegen tu tibia de impactos durante el juego sin comprometer la comodidad.',
    caracteristicas: [
      'Material de protección reforzado',
      'Correas de sujeción ajustables',
      'Material transpirable',
      'Ligeras y cómodas',
      'Diseño anatómico'
    ]
  },
  {
    id: 6,
    name: 'Guantes Portero',
    price: 79.99,
    image: 'https://media.futbolmania.com/media/catalog/product/cache/1/thumbnail/9df78eab33525d08d6e5fb8d27136e95/J/Y/JY6295_guantes-de-portero-color-blanco-adidas-predator-pro_1_dorso-mano-izquierda.jpg',
    description: 'Guantes Adidas Predator Pro para portero. Ofrecen máximo agarre y protección con tecnología de punta de látex profesional para atrapar el balón en cualquier condición.',
    caracteristicas: [
      'Látex profesional en palma',
      'Palma de espuma multicapa',
      'Puño de sujeción reforzado',
      'Material transpirable',
      'Tecnología de agarre en mojado'
    ]
  }
];

function DetalleProducto() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { agregarAlCarrito } = useContext(ContextoCarrito);
  const [cantidad, setCantidad] = useState(1);

  const producto = productosData.find(p => p.id === parseInt(id));

  if (!producto) {
    return (
      <div>
        <Cabecera />
        <div className="detalle-no-encontrado">
          <h2>Producto no encontrado</h2>
          <button onClick={() => navigate('/')}>Volver a la tienda</button>
        </div>
      </div>
    );
  }

  const handleAgregarAlCarrito = () => {
    for (let i = 0; i < cantidad; i++) {
      agregarAlCarrito(producto);
    }
    navigate('/carrito');
  };

  return (
    <div>
      <Cabecera />
      <div className="detalle-container">
        <button className="btn-volver" onClick={() => navigate('/')}>
          ← Volver a la tienda
        </button>

        <div className="detalle-contenido">
          {/* Imagen */}
          <div className="detalle-imagen">
            <img src={producto.image} alt={producto.name} />
          </div>

          {/* Información */}
          <div className="detalle-info">
            <h1>{producto.name}</h1>

            <div className="precio-detalle">
              <span className="precio-grande">${producto.price}</span>
            </div>

            <p className="descripcion">{producto.description}</p>

            {/* Características */}
            <div className="caracteristicas">
              <h3>Características:</h3>
              <ul>
                {producto.caracteristicas.map((carac, index) => (
                  <li key={index}>{carac}</li>
                ))}
              </ul>
            </div>

            {/* Cantidad y Compra */}
            <div className="seccion-compra">
              <div className="selector-cantidad">
                <label>Cantidad:</label>
                <div className="cantidad-controls">
                  <button
                    onClick={() => setCantidad(Math.max(1, cantidad - 1))}
                  >
                    −
                  </button>
                  <span className="cantidad-valor">{cantidad}</span>
                  <button
                    onClick={() => setCantidad(cantidad + 1)}
                  >
                    +
                  </button>
                </div>
              </div>

              <button
                className="btn-comprar"
                onClick={handleAgregarAlCarrito}
              >
                Agregar al carrito - ${(producto.price * cantidad).toFixed(2)}
              </button>
            </div>

            {/* Info adicional */}
            <div className="info-adicional">
              <p>✓ Envío gratis en compras mayores a $100</p>
              <p>✓ Garantía de 1 año en todos los productos</p>
              <p>✓ Devolución fácil en 30 días</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DetalleProducto;
