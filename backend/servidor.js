const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || '');
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Variables para almacenar pedidos (en producción usaremos BD)
const pedidos = [];

// Ruta de prueba
app.get('/api/salud', (req, res) => {
  res.json({ mensaje: 'Servidor funcionando correctamente' });
});

// Crear pedido
app.post('/api/pedidos', async (req, res) => {
  try {
    const { cliente, items, total } = req.body;

    // Validar datos
    if (!cliente || !items || !total) {
      return res.status(400).json({ error: 'Datos incompletos' });
    }

    // Crear intención de pago con Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(total * 100), // Stripe usa centavos
      currency: 'eur',
      metadata: {
        cliente: JSON.stringify(cliente),
        items: JSON.stringify(items)
      }
    });

    // Almacenar pedido
    const nuevoPedido = {
      id: pedidos.length + 1,
      cliente,
      items,
      total,
      estado: 'pendiente',
      stripePaymentIntentId: paymentIntent.id,
      fecha: new Date()
    };

    pedidos.push(nuevoPedido);

    res.json({
      exito: true,
      pedidoId: nuevoPedido.id,
      clientSecret: paymentIntent.client_secret,
      total: total
    });

  } catch (error) {
    console.error('Error creando pedido:', error);
    res.status(500).json({ error: 'Error procesando pedido' });
  }
});

// Obtener todos los pedidos (solo para desarrollo)
app.get('/api/pedidos', (req, res) => {
  res.json(pedidos);
});

// Obtener pedido por ID
app.get('/api/pedidos/:id', (req, res) => {
  const pedido = pedidos.find(p => p.id === parseInt(req.params.id));
  if (!pedido) {
    return res.status(404).json({ error: 'Pedido no encontrado' });
  }
  res.json(pedido);
});

// Confirmar pago (webhook de Stripe)
app.post('/api/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  const sig = req.headers['stripe-signature'];
  
  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET || 'whsec_test_secret'
    );

    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object;
      
      // Actualizar estado del pedido
      const pedido = pedidos.find(p => p.stripePaymentIntentId === paymentIntent.id);
      if (pedido) {
        pedido.estado = 'pagado';
      }
    }

    res.json({ recibido: true });
  } catch (error) {
    console.error('Error en webhook:', error);
    res.status(400).send(`Webhook Error: ${error.message}`);
  }
});

// Iniciar servidor
const PUERTO = process.env.PORT || 5000;
app.listen(PUERTO, () => {
  console.log(`✓ Servidor corriendo en http://localhost:${PUERTO}`);
  console.log(`✓ CORS habilitado`);
  console.log(`✓ Stripe en modo TEST`);
});