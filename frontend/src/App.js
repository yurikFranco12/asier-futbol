import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ProveedorCarrito } from './contexto/ContextoCarrito';
import { ProveedorAutenticacion } from './contexto/ContextoAutenticacion';
import Inicio from './pages/Inicio';
import Catalogo from './pages/Catalogo';
import SobreNosotros from './pages/SobreNosotros';
import DetalleProducto from './pages/DetalleProducto';
import Autenticacion from './pages/Autenticacion';
import Perfil from './pages/Perfil';
import MisPedidos from './pages/MisPedidos';
import Carrito from './components/Carrito';
import Pago from './components/Pago';
import Cabecera from './components/Cabecera';
import './App.css';

function App() {
  return (
    <Router>
      <ProveedorAutenticacion>
        <ProveedorCarrito>
          <div className="App">
            <Routes>
              <Route path="/" element={<Inicio/>} />
              <Route path="/catalogo" element={<Catalogo/>} />
              <Route path="/sobre-nosotros" element={<SobreNosotros/>} />
              <Route path="/producto/:id" element={<DetalleProducto/>} />
              <Route path="/autenticacion" element={<Autenticacion/>} />
              <Route path="/perfil" element={<Perfil/>} />
              <Route path="/mis-pedidos" element={<MisPedidos/>} />
              <Route path="/carrito" element={<Carrito />} />
              <Route path="/pago" element={<Pago />} />
            </Routes>
          </div>
        </ProveedorCarrito>
      </ProveedorAutenticacion>
    </Router>
  );
}

export default App;