const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');

// Cargar variables de entorno antes que todo
dotenv.config();

const app = express();

// Importar rutas
const stripeRoutes = require('./routes/stripe');

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));

// Middleware especial para webhook de Stripe (debe estar ANTES que bodyParser.json())
app.use('/api/stripe/webhook', express.raw({ type: 'application/json' }), stripeRoutes);

app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true }));

// ==================== RUTAS ====================

// Health check
app.get('/api/salud', (req, res) => {
  res.json({
    mensaje: 'Servidor PakSports funcionando correctamente',
    ambiente: process.env.NODE_ENV || 'development',
    stripe: process.env.STRIPE_SECRET_KEY ? '✅ Configurado' : '❌ No configurado',
    bd: process.env.DB_NAME || 'asier_futbol'
  });
});

// Rutas de Stripe
app.use('/api/stripe', stripeRoutes);

// Ruta 404
app.use((req, res) => {
  res.status(404).json({
    error: 'Ruta no encontrada',
    path: req.path,
    method: req.method
  });
});

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error('❌ Error no capturado:', err);
  res.status(500).json({
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// ==================== INICIAR SERVIDOR ====================

const PUERTO = process.env.PORT || 5000;

app.listen(PUERTO, () => {
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('🚀 Servidor PakSports iniciado correctamente');
  console.log('═══════════════════════════════════════════════════════════\n');
  console.log(`✅ Puerto: ${PUERTO}`);
  console.log(`✅ URL: http://localhost:${PUERTO}`);
  console.log(`✅ CORS: ${process.env.CORS_ORIGIN || 'http://localhost:3000'}`);
  console.log(`✅ BD: ${process.env.DB_NAME || 'asier_futbol'}`);
  console.log(`✅ Stripe: ${process.env.STRIPE_SECRET_KEY ? '🟢 Test Mode' : '🔴 No configurado'}`);
  console.log(`✅ Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log('\n═══════════════════════════════════════════════════════════\n');
});