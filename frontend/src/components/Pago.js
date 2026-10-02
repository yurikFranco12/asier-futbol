import React, { useContext } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import Cabecera from './Cabecera';
import FormularioPago from './FormularioPago';
import { ContextoCarrito } from '../contexto/ContextoCarrito';
import '../styles/Pago.css';

// Inicializar Stripe con clave pública
const stripePromise = loadStripe(
  process.env.REACT_APP_STRIPE_PUBLIC_KEY || 'pk_test_51UKvZ6CoZP7i5oLfQdSu8XJrqFgmKCRM97uS9t26LUivqbuva0jodZPJmKnwnsGPSWZf9nDKCPwlDmC4cfR9KrN100VwztrJAC'
);

function Pago() {
  const { carrito, obtenerTotal } = useContext(ContextoCarrito);

  if (carrito.length === 0) {
    return (
      <div>
        <Cabecera />
        <div className="pago-vacio">
          <div className="mensaje-vacio">
            <h2>🛒 Tu carrito está vacío</h2>
            <p>Añade productos antes de continuar</p>
            <button onClick={() => window.location.href = '/catalogo'}>
              Explorar productos
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Cabecera />
      <div className="pago-container">
        <h1>💳 Checkout - Finalizar Compra</h1>

        <div className="pago-contenido">
          <Elements stripe={stripePromise}>
            <FormularioPago />
          </Elements>

          <aside className="resumen-pedido">
            <h3>📦 Resumen del Pedido</h3>
            <div className="lista-items">
              {carrito.map(item => (
                <div key={item.id} className="resumen-item">
                  <div className="item-info">
                    <span className="item-nombre">{item.name}</span>
                    <span className="item-cantidad">x{item.cantidad}</span>
                  </div>
                  <span className="item-precio">
                    ${(item.price * item.cantidad).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="resumen-desglose">
              <div className="desglose-fila">
                <span>Subtotal:</span>
                <span>${obtenerTotal()}</span>
              </div>
              <div className="desglose-fila">
                <span>Envío:</span>
                <span className="envio-gratis">GRATIS</span>
              </div>
              <div className="desglose-fila">
                <span>Impuestos:</span>
                <span>Incluido</span>
              </div>
            </div>

            <div className="resumen-total">
              <span>Total:</span>
              <span className="precio-total">${obtenerTotal()}</span>
            </div>

            <div className="info-seguridad">
              <p>🔒 Pago seguro con Stripe</p>
              <p>✓ SSL Encriptado</p>
              <p>✓ Datos protegidos</p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default Pago;