import React, { useState } from 'react';
import ProductCard from './ProductCard';
import '../styles/ProductGrid.css';

function ProductGrid() {
  const [products] = useState([
    { id: 1, name: 'Botas Adidas F50', price: 89.99, description: 'Botas profesionales', image: 'https://www.futbolemotion.com/imagesarticulos/335854/330/bota-adidas-f50-hyperfast-elite-ll-ag-footwear-white-solar-purple-tursol-0.jpg' },
    { id: 2, name: 'Botas Adidas Predator', price: 99.99, description: 'Control y precisión', image: 'https://www.futbolemotion.com/imagesarticulos/291492/330/bota-adidas-predator-elite-ft-fg-core-black-ftwr-white-lucid-red-0.jpg' },
    { id: 3, name: 'Camiseta FC Barcelona', price: 49.99, description: 'Oficial 2026', image: 'https://www.futbolemotion.com/imagesarticulos/323203/750/camiseta-nike-fc-barcelona-primera-equipacion-2026-2027-garnet-0.webp' },
    { id: 4, name: 'Balón Adidas Official', price: 59.99, description: 'Match quality', image: 'https://www.futbolemotion.com/imagesarticulos/274071/330/balon-adidas-mundial-2026-pro-sala-white-team-royal-blue-solar-blue-power-red-1.jpg' },
    { id: 5, name: 'Calcetines TapeDesign Grip (1 Par)', price: 29.99, description: 'Más agarre y fuerza', image: 'https://www.futbolemotion.com/imagesarticulos/169848/750/calcetines-tapedesign-grip-blanco-3.webp' },
    { id: 6, name: 'Guantes de Portero', price: 39.99, description: 'Agarre perfecto', image: 'https://www.futbolemotion.com/imagesarticulos/333498/750/guantes-adidas-predator-pro-strap-negro-0.webp' },
  ]);

  return (
    <section className="product-grid-section" id="tienda">
      <h2>Nuestra Tienda</h2>
      <div className="product-grid">
        {products.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}

export default ProductGrid;