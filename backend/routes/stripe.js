const express = require('express');
const router = express.Router();
const stripe = require('../config/stripe');
const { Pool } = require('pg');
const { enviarConfirmacionPedido } = require('../services/email');

// Conexión a BD
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'admin',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'asier_futbol'
});

// ==================== PAGOS ====================

/**
 * POST /api/stripe/payment-intent
 * Crear una intención de pago para procesar un pedido
 */
router.post('/payment-intent', async (req, res) => {
  try {
    const { usuario_id, items, total, email, nombre } = req.body;

    // Validación
    if (!usuario_id || !items || !total || items.length === 0) {
      return res.status(400).json({
        error: 'Datos incompletos: usuario_id, items, total requeridos'
      });
    }

    // Crear intención de pago
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(total * 100), // Convertir a centavos
      currency: 'eur',
      description: `Pedido PakSports - ${nombre || 'Cliente'}`,
      metadata: {
        usuario_id: usuario_id,
        cantidad_items: items.length,
        email: email || 'no-email'
      },
      receipt_email: email // Enviar recibo por email
    });

    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: total,
      currency: 'EUR'
    });

  } catch (error) {
    console.error('❌ Error creando payment intent:', error);
    res.status(500).json({
      error: 'Error procesando pago',
      details: error.message
    });
  }
});

/**
 * POST /api/stripe/confirm-payment
 * Confirmar un pago y crear el pedido en la BD
 */
async function enviarEmailPedido(pedidoId) {
  const pedido = await pool.query(
    `SELECT p.id, p.total, p.direccion_envio, u.email, u.nombre_completo
     FROM pedidos p JOIN usuarios u ON u.id = p.usuario_id
     WHERE p.id = $1`,
    [pedidoId]
  );
  const items = await pool.query(
    `SELECT pr.nombre, dp.cantidad, dp.subtotal
     FROM detalles_pedidos dp JOIN productos pr ON pr.id = dp.producto_id
     WHERE dp.pedido_id = $1`,
    [pedidoId]
  );
  const p = pedido.rows[0];
  await enviarConfirmacionPedido({
    email: p.email,
    nombre: p.nombre_completo,
    pedidoId: p.id,
    items: items.rows,
    total: p.total,
    direccion: p.direccion_envio
  });
}

router.post('/confirm-payment', async (req, res) => {
  const client = await pool.connect();

  try {
    const {
      paymentIntentId,
      usuario_id,
      items,
      total,
      direccion_envio,
      metodo_pago
    } = req.body;

    // Validar payment intent con Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({
        error: `Pago no completado. Estado: ${paymentIntent.status}`
      });
    }

    // Iniciar transacción
    await client.query('BEGIN');

    try {
      // 1. Crear pedido
      const pedidoResult = await client.query(
        `INSERT INTO pedidos (usuario_id, estado, total, direccion_envio, metodo_pago, stripe_payment_id)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, fecha_pedido`,
        [usuario_id, 'confirmado', total, direccion_envio, metodo_pago, paymentIntentId]
      );

      const pedidoId = pedidoResult.rows[0].id;

      // 2. Insertar detalles del pedido
      for (const item of items) {
        const subtotal = item.price * item.quantity;

        await client.query(
          `INSERT INTO detalles_pedidos (pedido_id, producto_id, cantidad, precio_unitario, subtotal)
           VALUES ($1, $2, $3, $4, $5)`,
          [pedidoId, item.id, item.quantity, item.price, subtotal]
        );

        // Actualizar stock
        await client.query(
          `UPDATE productos SET cantidad_stock = cantidad_stock - $1 WHERE id = $2`,
          [item.quantity, item.id]
        );
      }

      // Confirmar transacción
      await client.query('COMMIT');

      res.json({
        success: true,
        pedidoId: pedidoId,
        mensaje: 'Pedido confirmado exitosamente',
        detalles: {
          total: total,
          items: items.length,
          estado: 'confirmado'
        }
      });

      enviarEmailPedido(pedidoId).catch(error =>
        console.error(`❌ Error enviando email del pedido #${pedidoId}:`, error.message)
      );

    } catch (dbError) {
      await client.query('ROLLBACK');
      throw dbError;
    }

  } catch (error) {
    console.error('❌ Error confirmando pago:', error);
    res.status(500).json({
      error: 'Error confirmando pago',
      details: error.message
    });
  } finally {
    client.release();
  }
});

/**
 * GET /api/stripe/payment-intent/:id
 * Obtener estado de un payment intent
 */
router.get('/payment-intent/:id', async (req, res) => {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(req.params.id);

    res.json({
      id: paymentIntent.id,
      status: paymentIntent.status,
      amount: paymentIntent.amount / 100, // Convertir de centavos
      currency: paymentIntent.currency.toUpperCase(),
      createdAt: new Date(paymentIntent.created * 1000)
    });

  } catch (error) {
    console.error('❌ Error obteniendo payment intent:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== CLIENTES ====================

/**
 * POST /api/stripe/customer
 * Crear o obtener un cliente Stripe
 */
router.post('/customer', async (req, res) => {
  try {
    const { email, nombre, telefono } = req.body;

    if (!email || !nombre) {
      return res.status(400).json({
        error: 'Email y nombre requeridos'
      });
    }

    // Buscar cliente existente
    const customers = await stripe.customers.list({
      email: email,
      limit: 1
    });

    let customer;
    if (customers.data.length > 0) {
      customer = customers.data[0];
    } else {
      // Crear nuevo cliente
      customer = await stripe.customers.create({
        email: email,
        name: nombre,
        phone: telefono || undefined,
        description: `Cliente PakSports`
      });
    }

    res.json({
      success: true,
      customerId: customer.id,
      email: customer.email,
      name: customer.name
    });

  } catch (error) {
    console.error('❌ Error en Stripe customer:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== WEBHOOKS ====================

/**
 * POST /api/stripe/webhook
 * Procesar eventos de Stripe
 */
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];

  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    console.log(`📬 Evento Stripe recibido: ${event.type}`);

    // Procesar según tipo de evento
    switch (event.type) {
      case 'payment_intent.succeeded':
        console.log('✅ Pago exitoso:', event.data.object.id);
        break;

      case 'payment_intent.payment_failed':
        console.log('❌ Pago fallido:', event.data.object.id);
        break;

      case 'charge.refunded':
        console.log('↩️  Reembolso procesado:', event.data.object.id);
        break;

      default:
        console.log(`⚠️  Evento no procesado: ${event.type}`);
    }

    res.json({ received: true });

  } catch (error) {
    console.error('❌ Error en webhook:', error.message);
    res.status(400).json({ error: `Webhook Error: ${error.message}` });
  }
});

// ==================== REEMBOLSOS ====================

/**
 * POST /api/stripe/refund
 * Procesar un reembolso
 */
router.post('/refund', async (req, res) => {
  try {
    const { paymentIntentId, razon } = req.body;

    if (!paymentIntentId) {
      return res.status(400).json({ error: 'paymentIntentId requerido' });
    }

    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      reason: razon || 'requested_by_customer',
      metadata: {
        timestamp: new Date().toISOString()
      }
    });

    res.json({
      success: true,
      refundId: refund.id,
      amount: refund.amount / 100,
      status: refund.status
    });

  } catch (error) {
    console.error('❌ Error procesando reembolso:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
