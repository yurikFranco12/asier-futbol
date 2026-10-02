# Integración Stripe - PakSports

Guía completa para procesar pagos con Stripe en PakSports.

## 🔧 Configuración

### 1. Variables de Entorno
Tu archivo `.env` ya contiene:
```
STRIPE_SECRET_KEY=sk_test_51UKvZ6...
STRIPE_PUBLIC_KEY=pk_test_51UKvZ6...
```

Ambas claves están en **Test Mode** - úsalas para desarrollo y pruebas.

### 2. Modo Test vs Producción

**Test Mode:**
- Claves: `pk_test_*` y `sk_test_*`
- No cobra dinero real
- Datos de prueba:
  - Tarjeta válida: `4242 4242 4242 4242`
  - Tarjeta rechazada: `4000 0000 0000 0002`
  - Tarjeta con 3D Secure: `4000 0025 0000 3155`

**Producción:**
- Claves: `pk_live_*` y `sk_live_*`
- Cobra dinero real
- Requiere validación de identidad

## 📡 Endpoints Disponibles

### 1. Crear Payment Intent
```http
POST /api/stripe/payment-intent
Content-Type: application/json

{
  "usuario_id": 1,
  "items": [
    { "id": 1, "name": "Botas Adidas", "price": 89.99, "quantity": 1 },
    { "id": 2, "name": "Camiseta Barcelona", "price": 59.99, "quantity": 2 }
  ],
  "total": 209.97,
  "email": "cliente@example.com",
  "nombre": "Juan García"
}
```

**Respuesta:**
```json
{
  "success": true,
  "clientSecret": "pi_1234..._secret_5678...",
  "paymentIntentId": "pi_1234...",
  "amount": 209.97,
  "currency": "EUR"
}
```

### 2. Confirmar Pago
```http
POST /api/stripe/confirm-payment
Content-Type: application/json

{
  "paymentIntentId": "pi_1234...",
  "usuario_id": 1,
  "items": [
    { "id": 1, "price": 89.99, "quantity": 1 },
    { "id": 2, "price": 59.99, "quantity": 2 }
  ],
  "total": 209.97,
  "direccion_envio": "Calle Principal 123, Madrid 28001",
  "metodo_pago": "tarjeta"
}
```

**Respuesta:**
```json
{
  "success": true,
  "pedidoId": 15,
  "mensaje": "Pedido confirmado exitosamente",
  "detalles": {
    "total": 209.97,
    "items": 2,
    "estado": "confirmado"
  }
}
```

### 3. Obtener Estado de Pago
```http
GET /api/stripe/payment-intent/:id
```

**Respuesta:**
```json
{
  "id": "pi_1234...",
  "status": "succeeded",
  "amount": 20997,
  "currency": "EUR",
  "createdAt": "2024-01-15T10:30:00.000Z"
}
```

### 4. Crear/Obtener Cliente Stripe
```http
POST /api/stripe/customer
Content-Type: application/json

{
  "email": "cliente@example.com",
  "nombre": "Juan García",
  "telefono": "+34 666 123 456"
}
```

**Respuesta:**
```json
{
  "success": true,
  "customerId": "cus_1234...",
  "email": "cliente@example.com",
  "name": "Juan García"
}
```

### 5. Procesar Reembolso
```http
POST /api/stripe/refund
Content-Type: application/json

{
  "paymentIntentId": "pi_1234...",
  "razon": "requested_by_customer"
}
```

Razones válidas:
- `duplicate` - Pago duplicado
- `fraudulent` - Fraude
- `requested_by_customer` - Solicitado por cliente

**Respuesta:**
```json
{
  "success": true,
  "refundId": "re_1234...",
  "amount": 209.97,
  "status": "succeeded"
}
```

### 6. Webhook
```http
POST /api/stripe/webhook
```

Eventos procesados:
- `payment_intent.succeeded` - Pago exitoso
- `payment_intent.payment_failed` - Pago fallido
- `charge.refunded` - Reembolso procesado

## 💳 Flujo Completo de Pago

### Frontend (React)
```javascript
import { loadStripe } from '@stripe/js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripe = await loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);

// 1. Crear payment intent
const response = await fetch('/api/stripe/payment-intent', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    usuario_id: 1,
    items: carrito,
    total: total,
    email: 'cliente@example.com',
    nombre: 'Juan García'
  })
});

const { clientSecret } = await response.json();

// 2. Mostrar formulario de tarjeta y procesar pago
const { paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
  payment_method: {
    card: cardElement,
    billing_details: { email: 'cliente@example.com' }
  }
});

if (paymentIntent.status === 'succeeded') {
  // 3. Confirmar pedido en backend
  await fetch('/api/stripe/confirm-payment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      paymentIntentId: paymentIntent.id,
      usuario_id: 1,
      items: carrito,
      total: total,
      direccion_envio: direccion,
      metodo_pago: 'tarjeta'
    })
  });
}
```

## 🔒 Seguridad

✅ **Nunca expongas la clave secreta en el frontend**
- Usa `STRIPE_PUBLIC_KEY` solo en el cliente
- `STRIPE_SECRET_KEY` solo en el backend

✅ **Valida siempre en el servidor**
- Verifica que el payment intent existe
- Verifica que el monto coincide
- Guarda los detalles en la BD

✅ **Usa webhooks para confirmar pagos**
- No confíes en respuestas del cliente
- Procesa eventos de Stripe directamente

## 📊 Métodos de Pago Soportados

Stripe soporta múltiples métodos:

- 💳 **Tarjetas de crédito/débito** (Visa, Mastercard, Amex)
- 🏦 **Transferencia bancaria**
- 💰 **Monederos digitales** (Apple Pay, Google Pay)
- 🌐 **Pagos locales** (SEPA, iDEAL, Giropay, etc.)

## 🧪 Datos de Prueba

### Tarjetas Válidas
| Número | Descripción |
|--------|-------------|
| 4242 4242 4242 4242 | Visa válida |
| 5555 5555 5555 4444 | Mastercard válida |
| 3782 822463 10005 | Amex válida |

### Tarjetas con Resultado Específico
| Número | Resultado |
|--------|-----------|
| 4000 0000 0000 0002 | Rechazada (insufficient_funds) |
| 4000 0000 0000 0069 | Rechazada (expired_card) |
| 4100 0000 0000 0019 | Rechazada (lost_card) |

### Detalles Comunes
- **Fecha expiración**: Cualquier fecha futura (ej: 12/25)
- **CVC**: Cualquier código de 3 dígitos (ej: 123)
- **Nombre**: Cualquier nombre

## 📈 Monitoreo

Accede al dashboard de Stripe para:
- Ver pagos procesados
- Revisar clientes y suscripciones
- Monitorear fraude
- Generar informes
- Configurar webhooks

**Dashboard:** https://dashboard.stripe.com

## 🆘 Troubleshooting

### Error: "STRIPE_SECRET_KEY not configured"
- Verifica que `.env` tiene `STRIPE_SECRET_KEY=sk_test_...`
- Reinicia el servidor

### Error: "Invalid API Key"
- Verifica que la clave secreta es correcta
- No mezcles claves de test y producción
- No expongas la clave en el frontend

### Webhooks no se reciben
- Verifica que `STRIPE_WEBHOOK_SECRET` está configurado
- Revisa logs en Stripe Dashboard > Webhooks
- Usa `stripe listen` localmente para testing

## 🚀 Próximos Pasos

1. **Instala cliente Stripe en frontend:**
   ```bash
   npm install @stripe/react-stripe-js @stripe/js
   ```

2. **Crea componente de formulario de pago:**
   - CardElement para tarjetas
   - Manejo de errores
   - Estados de carga

3. **Implementa confirmación de 3D Secure**
   - Para tarjetas que lo requieran
   - Validación adicional de seguridad

4. **Configura webhooks en producción**
   - Endpoint debe ser accesible desde internet
   - Valida firma de webhook

5. **Prueba con datos reales en staging**
   - Antes de ir a producción

---

Documentación oficial: https://stripe.com/docs
