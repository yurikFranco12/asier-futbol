import React, { createContext, useState } from 'react';

export const ContextoCarrito = createContext();

export function ProveedorCarrito({ children }) {
  const [carrito, setCarrito] = useState([]);

  const agregarAlCarrito = (producto, cantidadAgregada = 1) => {
    const existente = carrito.find(item => item.id === producto.id);

    if (existente) {
      setCarrito(carrito.map(item =>
        item.id === producto.id
          ? { ...item, cantidad: item.cantidad + cantidadAgregada }
          : item
      ));
    } else {
      setCarrito([...carrito, { ...producto, cantidad: cantidadAgregada }]);
    }
  };

  const eliminarDelCarrito = (id) => {
    setCarrito(carrito.filter(item => item.id !== id));
  };

  const aumentarCantidad = (id) => {
    setCarrito(carrito.map(item =>
      item.id === id
        ? { ...item, cantidad: item.cantidad + 1 }
        : item
    ));
  };

  const disminuirCantidad = (id) => {
    setCarrito(carrito.map(item =>
      item.id === id && item.cantidad > 1
        ? { ...item, cantidad: item.cantidad - 1 }
        : item
    ));
  };

  const obtenerTotal = () => {
    return carrito.reduce((total, item) => total + (item.price * item.cantidad), 0).toFixed(2);
  };

  return (
    <ContextoCarrito.Provider value={{
      carrito,
      agregarAlCarrito,
      eliminarDelCarrito,
      aumentarCantidad,
      disminuirCantidad,
      obtenerTotal
    }}>
      {children}
    </ContextoCarrito.Provider>
  );
}