const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Validar que las claves estén configuradas
if (!process.env.STRIPE_SECRET_KEY) {
  console.error('❌ Error: STRIPE_SECRET_KEY no está configurada en .env');
  process.exit(1);
}

module.exports = stripe;
