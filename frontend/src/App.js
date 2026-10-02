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
import AdminProductos from './pages/AdminProductos';
import VerificarEmail from './pages/VerificarEmail';
import PoliticaCookies from './pages/PoliticaCookies';
import { ProveedorCookies } from './contexto/ContextoCookies';
import AvisoCookies from './components/AvisoCookies';
import Carrito from './components/Carrito';
import Pago from './components/Pago';
import Cabecera from './components/Cabecera';
import './App.css';

function App() {
  return (
    <Router>
      <ProveedorCookies>
        <ProveedorAutenticacion>
          <ProveedorCarrito>
            <div className="App">
              <AvisoCookies />
              <Routes>
                <Route path="/" element={<Inicio/>} />
                <Route path="/catalogo" element={<Catalogo/>} />
                <Route path="/sobre-nosotros" element={<SobreNosotros/>} />
                <Route path="/producto/:id" element={<DetalleProducto/>} />
                <Route path="/autenticacion" element={<Autenticacion/>} />
                <Route path="/verificar-email" element={<VerificarEmail/>} />
                <Route path="/perfil" element={<Perfil/>} />
                <Route path="/mis-pedidos" element={<MisPedidos/>} />
                <Route path="/admin" element={<AdminProductos/>} />
                <Route path="/carrito" element={<Carrito />} />
                <Route path="/pago" element={<Pago />} />
                <Route path="/politica-cookies" element={<PoliticaCookies />} />
              </Routes>
            </div>
          </ProveedorCarrito>
        </ProveedorAutenticacion>
      </ProveedorCookies>
    </Router>
  );
}

export default App;
