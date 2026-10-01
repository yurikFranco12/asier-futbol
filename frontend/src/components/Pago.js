import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ContextoCarrito } from '../contexto/ContextoCarrito';
import '../styles/Pago.css';

function Pago() {
  const navigate = useNavigate();
  const { carrito, obtenerTotal } = useContext(ContextoCarrito);
  
  const [formulario, setFormulario] = useState({
    nombre: '',
    email: '',
    telefono: '',
    direccion: '',
    ciudad: '',
    codigoPostal: '',
    tarjeta: ''
  });

  const [procesando, setProcesando] = useState(false);
  const [exito, setExito] = useState(false);
  const [error, setError] = useState('');
  const [pedidoId, setPedidoId] = useState(null);

  const manejarCambio = (e) => {
    const { name, value } = e.target;
    setFormulario(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const manejarEnvio = async (e) => {
    e.preventDefault();
    setProcesando(true);
    setError('');

    try {
      const respuesta = await fetch('http://localhost:5000/api/pedidos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          cliente: formulario,
          items: carrito,
          total: obtenerTotal()
        })
      });

      if (!respuesta.ok) {
        throw new Error('Error procesando el pedido');
      }

      const datos = await respuesta.json();
      setPedidoId(datos.pedidoId);
      setExito(true);
      
    } catch (error) {
      console.error('Error:', error);
      setError(error.message || 'Error procesando el pago');
    } finally {
      setProcesando(false);
    }
  };

  if (exito) {
    return (
      <div className="pago-exito">
        <div className="mensaje-exito">
          <h2>✓ Pedido realizado con éxito</h2>
          <p>Tu número de pedido es: <strong>#{pedidoId}</strong></p>
          <p>Recibirás un email de confirmación próximamente</p>
          <button onClick={() => navigate('/')}>Volver a la tienda</button>
        </div>
      </div>
    );
  }

  return (
    <div className="pago-container">
      <h2>Checkout - Finalizar compra</h2>
      
      <div className="pago-contenido">
        <form className="formulario-pago" onSubmit={manejarEnvio}>
          <fieldset>
            <legend>Datos personales</legend>
            <input
              type="text"
              name="nombre"
              placeholder="Nombre completo"
              value={formulario.nombre}
              onChange={manejarCambio}
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formulario.email}
              onChange={manejarCambio}
              required
            />
            <input
              type="tel"
              name="telefono"
              placeholder="Teléfono"
              value={formulario.telefono}
              onChange={manejarCambio}
              required
            />
          </fieldset>

          <fieldset>
            <legend>Dirección de envío</legend>
            <input
              type="text"
              name="direccion"
              placeholder="Calle y número"
              value={formulario.direccion}
              onChange={manejarCambio}
              required
            />
            <input
              type="text"
              name="ciudad"
              placeholder="Ciudad"
              value={formulario.ciudad}
              onChange={manejarCambio}
              required
            />
            <input
              type="text"
              name="codigoPostal"
              placeholder="Código postal"
              value={formulario.codigoPostal}
              onChange={manejarCambio}
              required
            />
          </fieldset>

          <fieldset>
            <legend>Datos de pago</legend>
            <input
              type="text"
              name="tarjeta"
              placeholder="Número de tarjeta (prueba: 4242 4242 4242 4242)"
              value={formulario.tarjeta}
              onChange={manejarCambio}
              required
            />
            <p className="info-test">
              💳 Usa esta tarjeta de prueba: <strong>4242 4242 4242 4242</strong>
            </p>
          </fieldset>

          {error && <div className="error-mensaje">{error}</div>}

          <button 
            type="submit" 
            className="boton-pagar"
            disabled={procesando}
          >
            {procesando ? 'Procesando...' : 'Pagar $' + obtenerTotal()}
          </button>
        </form>

        <div className="resumen-pedido">
          <h3>Resumen del pedido</h3>
          {carrito.map(item => (
            <div key={item.id} className="resumen-item">
              <span>{item.name} x{item.cantidad}</span>
              <span>${(item.price * item.cantidad).toFixed(2)}</span>
            </div>
          ))}
          <div className="resumen-total">
            <strong>Total: ${obtenerTotal()}</strong>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Pago;