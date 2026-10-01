import React from 'react';
import Cabecera from '../components/Cabecera';
import HeroSection from '../components/HeroSection';
import GridProducto from '../components/GridProducto';

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

function Inicio() {
  return (
    <div>
      <Cabecera/>
      <HeroSection />
      <GridProducto productos={productos} />
    </div>
  );
}

export default Inicio;