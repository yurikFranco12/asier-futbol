import React from 'react';
import Cabecera from '../components/Cabecera';
import GridProducto from '../components/GridProducto';
import '../styles/Catalogo.css';

const productos = [
  {
    id: 1,
    name: 'Botas Adidas F50',
    price: 89.99,
    image: 'https://www.futbolemotion.com/imagesarticulos/335848/750/bota-adidas-f50-hyperfast-elite-ll-fg-footwear-white-solar-purple-tursol-0.webp'
  },
  {
    id: 2,
    name: 'Botas Adidas Predator',
    price: 99.99,
    image: 'https://www.futbolemotion.com/imagesarticulos/291495/750/bota-adidas-predator-elite-ft-fg-lucid-red-core-black-ftwr-white-0.webp'
  },
  {
    id: 3,
    name: 'Camiseta FC Barcelona',
    price: 59.99,
    image: 'https://camisetasfutbolbaloncesto.com/cdn/shop/files/camiseta-local-fc-barcelona-2026-27-2.jpg?v=1783153616&width=1946'
  },
  {
    id: 4,
    name: 'Balón Adidas Official',
    price: 49.99,
    image: 'https://www.futbolemotion.com/imagesarticulos/192135/grandes/balon-adidas-tiro-league-white-team-colleg-burgundy-team-colleg-red-0.webp'
  },
  {
    id: 5,
    name: 'Espinilleras Nike',
    price: 29.99,
    image: 'https://media.futbolmania.com/media/catalog/product/cache/1/image/0f330055bc18e2dda592b4a7c3a0ea22/s/p/sp2162-010_espinilleras-de-futbol-nike-j-guard-negro_1_frontal.jpg'
  },
  {
    id: 6,
    name: 'Guantes Portero',
    price: 79.99,
    image: 'https://media.futbolmania.com/media/catalog/product/cache/1/thumbnail/9df78eab33525d08d6e5fb8d27136e95/J/Y/JY6295_guantes-de-portero-color-blanco-adidas-predator-pro_1_dorso-mano-izquierda.jpg'
  }
];

function Catalogo() {
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

        <GridProducto productos={productos} />
      </div>
    </div>
  );
}

export default Catalogo;
