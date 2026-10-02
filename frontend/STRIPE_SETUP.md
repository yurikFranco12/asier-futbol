# Configuración de Stripe en Frontend

Guía para integrar el formulario de pago con Stripe en el frontend de React.

## 🚀 Configuración Inicial

### 1. Variables de Entorno

Crea un archivo `.env` en la carpeta `frontend/`:

```bash
cp .env.example .env
```

Edita `.env` con tu clave pública de Stripe:

```
REACT_APP_STRIPE_PUBLIC_KEY=pk_test_51UKvZ6CoZP7i5oLfQdSu8XJrqFgmKCRM97uS9t26LUivqbuva0jodZPJmKnwnsGPSWZf9nDKCPwlDmC4cfR9KrN100VwztrJAC
REACT_APP_API_URL=http://localhost:5000
```

**⚠️ IMPORTANTE:**
- `REACT_APP_STRIPE_PUBLIC_KEY` es pública, puede estar en el código
- Nunca incluyas `STRIPE_SECRET_KEY` en el frontend
- Las variables de entorno en React deben empezar con `REACT_APP_`

### 2. Instalar Dependencias

```bash
cd frontend
npm install @stripe/react-stripe-js stripe
```

## 📦 Componentes

### FormularioPago.js

Componente principal que maneja todo el flujo de pago.

**Características:**
- CardElement de Stripe para entrada segura de tarjeta
- Validación de formulario
- Manejo de errores
- Estados de carga
- Pantalla de éxito

**Ubicación:** `frontend/src/components/FormularioPago.js`

### Pago.js

Componente padre que envuelve el formulario con Stripe Elements.

**Características:**
- Carga de Stripe
- Validación de carrito
- Layout responsivo
- Resumen de pedido

**Ubicación:** `frontend/src/components/Pago.js`

## 🔄 Flujo de Pago

### 1. Usuario completa formulario
```
Nombre, Email, Dirección, Tarjeta
```

### 2. Al hacer click en "Pagar"
```
FormularioPago.js detecta el envío del formulario
```

### 3. Crear Payment Intent
```javascript
POST /api/stripe/payment-intent
{
  usuario_id: 1,
  items: [...],
  total: 209.97,
  email: "cliente@example.com",
  nombre: "Juan García"
}

Response:
{
  clientSecret: "pi_..._secret_...",
  paymentIntentId: "pi_1234..."
}
```

### 4. Procesar Pago con Stripe
```javascript
stripe.confirmCardPayment(clientSecret, {
  payment_method: {
    card: cardElement,
    billing_details: { ... }
  }
})
```

### 5. Confirmar Pedido en Backend
```javascript
POST /api/stripe/confirm-payment
{
  paymentIntentId: "pi_1234...",
  usuario_id: 1,
  items: [...],
  total: 209.97,
  direccion_envio: "...",
  metodo_pago: "tarjeta"
}

Response:
{
  pedidoId: 15,
  mensaje: "Pedido confirmado"
}
```

### 6. Mostrar Éxito
```
Pantalla con número de pedido
Email de confirmación enviado
```

## 💳 Tarjetas de Prueba

### Pagos Exitosos
| Número | Expiración | CVC |
|--------|-----------|-----|
| 4242 4242 4242 4242 | Futuro | 123 |
| 5555 5555 5555 4444 | Futuro | 123 |
| 3782 822463 10005 | Futuro | 123 |

### Pagos Fallidos
| Número | Resultado | CVC |
|--------|-----------|-----|
| 4000 0000 0000 0002 | insufficient_funds | 123 |
| 4000 0000 0000 0069 | expired_card | 123 |
| 4000 0000 0000 0019 | lost_card | 123 |

### 3D Secure (Autenticación adicional)
| Número | Resultado | CVC |
|--------|-----------|-----|
| 4000 0025 0000 3155 | Requiere 3D Secure | 123 |

## 🎨 Personalización

### Estilos del CardElement

En `FormularioPago.js`, puedes personalizar los estilos:

```javascript
<CardElement
  options={{
    style: {
      base: {
        fontSize: '16px',
        color: '#ffffff',
        '::placeholder': {
          color: '#b0b0b0'
        }
      },
      invalid: {
        color: '#ff6b6b',
        iconColor: '#ff6b6b'
      }
    }
  }}
/>
```

## 🔐 Seguridad

✅ **Mejor Prácticas Implementadas:**

- ✅ CardElement maneja datos de tarjeta de forma segura
- ✅ Nunca el servidor ve los datos de tarjeta completos
- ✅ Todas las transacciones van por Stripe
- ✅ Backend valida payment intent antes de guardar
- ✅ Variables de entorno protegen claves públicas

⚠️ **Nunca hagas esto:**
```javascript
// ❌ NUNCA envíes datos de tarjeta al backend
fetch('/api/pagar', {
  body: JSON.stringify({
    cardNumber: '4242...',
    cvc: '123'
  })
})

// ✅ En su lugar, usa Stripe directamente
stripe.confirmCardPayment(clientSecret, { ... })
```

## 🧪 Testing Local

### 1. Inicia el backend
```bash
cd backend
npm run dev
```

Debe estar en `http://localhost:5000`

### 2. Inicia el frontend
```bash
cd frontend
npm start
```

Debe estar en `http://localhost:3000`

### 3. Prueba el flujo
1. Añade productos al carrito
2. Ve a `/carrito`
3. Click en "Finalizar compra"
4. Completa el formulario
5. Usa tarjeta de prueba: `4242 4242 4242 4242`
6. Click en "Pagar"
7. Verifica que aparece el número de pedido

## 📊 Verificar en Stripe Dashboard

### Pagos Procesados
1. Ve a https://dashboard.stripe.com
2. Sección "Payments"
3. Verás todos los pagos de prueba

### Webhooks
1. Sección "Webhooks"
2. Configura endpoint: `http://tudominio.com/api/stripe/webhook`
3. Eventos a escuchar: `payment_intent.succeeded`, `payment_intent.payment_failed`

## 🚨 Errores Comunes

### Error: "Stripe is not defined"
```
✅ Solución: Verifica que loadStripe se ejecutó correctamente
// En Pago.js
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);
```

### Error: "Card declined"
```
✅ Usa una de las tarjetas de prueba listadas arriba
✅ Verifica que la fecha sea futura
```

### Error: "Payment intent not found"
```
✅ Verifica que el backend está corriendo en :5000
✅ Verifica que STRIPE_SECRET_KEY está en .env del backend
✅ Revisa logs del backend para más detalles
```

### Error: "CORS blocked"
```
✅ Verifica que CORS_ORIGIN en backend/.env es http://localhost:3000
✅ Reinicia el servidor backend
```

## 📱 Responsivo

El formulario está completamente responsivo:
- ✅ Desktop (≥1024px)
- ✅ Tablet (768px - 1023px)
- ✅ Mobile (< 768px)

## 🔄 Próximos Pasos

1. **Autenticación de usuarios**
   - Reemplazar `usuario_id: 1` con usuario logueado
   - Guardar dirección para compras futuras

2. **Métodos de pago adicionales**
   - Apple Pay
   - Google Pay
   - iDEAL, SEPA, etc.

3. **Webhook validation**
   - Configurar en producción
   - Actualizar estado de pedidos

4. **Email confirmación**
   - Enviar email a cliente
   - Mostrar tracking

5. **Analítica**
   - Rastrear conversiones
   - Monitorear tasas de abandono

## 📚 Recursos

- [Documentación Stripe](https://stripe.com/docs)
- [React Stripe.js Docs](https://stripe.com/docs/stripe-js/react)
- [Testing Cards](https://stripe.com/docs/testing)
- [Error Handling](https://stripe.com/docs/payments/handling-errors)

---

¿Preguntas? Revisa `/backend/STRIPE.md` para más detalles del backend.
