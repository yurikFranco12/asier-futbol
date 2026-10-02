import React, { useState, useContext } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useNavigate } from 'react-router-dom';
import { ContextoCarrito } from '../contexto/ContextoCarrito';

const FormularioPago = () => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const { usuario } = useContext(ContextoAutenticacion);
  const { carrito, obtenerTotal, vaciarCarrito } = useContext(ContextoCarrito);

  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState('');
  const [exito, setExito] = useState(false);
  const [pedidoId, setPedidoId] = useState(null);

  const [formulario, setFormulario] = useState({
    nombre: '',
    email: '',
    telefono: '',
    direccion: '',
    ciudad: '',
    codigoPostal: ''
  });

  const manejarCambio = (e) => {
    const { name, value } = e.target;
    setFormulario(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const manejarEnvio = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      setError('Stripe no está cargado. Intenta recargar la página.');
      return;
    }

    // Validación del formulario
    if (!formulario.nombre || !formulario.email || !formulario.direccion) {
      setError('Por favor completa todos los campos');
      return;
    }

    if (carrito.length === 0) {
      setError('El carrito está vacío');
      return;
    }

    setProcesando(true);
    setError('');

    try {
      const total = parseFloat(obtenerTotal());

      // 1. Crear payment intent en el backend
      const paymentIntentResponse = await fetch(
        'http://localhost:5000/api/stripe/payment-intent',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            usuario_id: usuario.id,
            items: carrito.map(item => ({
              id: item.id,
              name: item.name,
              price: item.price,
              quantity: item.cantidad
            })),
            total: total,
            email: formulario.email,
            nombre: formulario.nombre
          })
        }
      );

      if (!paymentIntentResponse.ok) {
        throw new Error('Error creando intención de pago');
      }

      const { clientSecret, paymentIntentId } = await paymentIntentResponse.json();

      // 2. Confirmar pago con tarjeta
      const { paymentIntent, error: stripeError } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: elements.getElement(CardElement),
            billing_details: {
              name: formulario.nombre,
              email: formulario.email,
              phone: formulario.telefono,
              address: {
                line1: formulario.direccion,
                city: formulario.ciudad,
                postal_code: formulario.codigoPostal
              }
            }
          }
        }
      );

      if (stripeError) {
        setError(stripeError.message);
        setProcesando(false);
        return;
      }

      if (paymentIntent.status === 'succeeded') {
        // 3. Confirmar pedido en el backend
        const confirmResponse = await fetch(
          'http://localhost:5000/api/stripe/confirm-payment',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              paymentIntentId: paymentIntentId,
              usuario_id: usuario.id,
              items: carrito.map(item => ({
                id: item.id,
                price: item.price,
                quantity: item.cantidad
              })),
              total: total,
              direccion_envio: `${formulario.direccion}, ${formulario.ciudad}, ${formulario.codigoPostal}`,
              metodo_pago: 'tarjeta'
            })
          }
        );

        if (!confirmResponse.ok) {
          throw new Error('Error confirmando pedido');
        }

        const confirmData = await confirmResponse.json();
        setPedidoId(confirmData.pedidoId);
        setExito(true);
        vaciarCarrito();

      } else {
        setError('El pago no fue completado');
      }

    } catch (error) {
      console.error('Error:', error);
      setError(error.message || 'Error procesando el pago');
    } finally {
      setProcesando(false);
    }
  };

  if (exito) {
    return (
      <div className="pago-exito-container">
        <div className="mensaje-exito">
          <div className="icono-exito">✓</div>
          <h2>¡Pedido realizado con éxito!</h2>
          <p className="numero-pedido">Número de pedido: <strong>#{pedidoId}</strong></p>
          <p>Recibirás un email de confirmación a <strong>{formulario.email}</strong></p>
          <p className="info-entrega">Tu pedido será entregado en 2-3 días hábiles</p>
          <button className="btn-volver" onClick={() => navigate('/')}>
            Volver a la tienda
          </button>
        </div>
      </div>
    );
  }

  return (
    <form className="formulario-pago" onSubmit={manejarEnvio}>
      <fieldset className="fieldset-datos">
        <legend>📋 Datos Personales</legend>
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

      <fieldset className="fieldset-direccion">
        <legend>📦 Dirección de Envío</legend>
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

      <fieldset className="fieldset-tarjeta">
        <legend>💳 Datos de Pago</legend>
        <div className="card-element-wrapper">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#ffffff',
                  '::placeholder': {
                    color: '#b0b0b0'
                  },
                  fontFamily: 'Segoe UI, Roboto, sans-serif'
                },
                invalid: {
                  color: '#ff6b6b',
                  iconColor: '#ff6b6b'
                }
              },
              hidePostalCode: true
            }}
          />
        </div>
        <p className="info-test">
          💡 <strong>Tarjeta de prueba:</strong> 4242 4242 4242 4242 · Cualquier fecha futura · CVC: 123
        </p>
      </fieldset>

      {error && (
        <div className="error-mensaje">
          <span>❌</span> {error}
        </div>
      )}

      <button
        type="submit"
        className="boton-pagar"
        disabled={procesando || !stripe}
      >
        {procesando ? '⏳ Procesando pago...' : `Pagar $${obtenerTotal()}`}
      </button>

      <p className="seguridad-nota">
        🔒 Todos los pagos son procesados de forma segura con Stripe
      </p>
    </form>
  );
};

export default FormularioPago;
