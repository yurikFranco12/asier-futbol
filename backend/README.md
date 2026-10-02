# Backend - PakSports

Backend de la tienda de equipamiento deportivo construido con Express.js y PostgreSQL.

## 🚀 Configuración Inicial

### 1. Instalar Dependencias
```bash
npm install
```

### 2. Configurar Variables de Entorno
Copia `.env.example` a `.env` y actualiza con tus datos:
```bash
cp .env.example .env
```

Edita `.env` con:
- **DB_USER**: Usuario de PostgreSQL (default: postgres)
- **DB_PASSWORD**: Contraseña de PostgreSQL
- **DB_HOST**: Host de PostgreSQL (default: localhost)
- **DB_PORT**: Puerto de PostgreSQL (default: 5432)
- **STRIPE_SECRET_KEY**: Key de Stripe para pagos
- **CORS_ORIGIN**: URL del frontend (default: http://localhost:3000)

### 3. Crear Base de Datos
```bash
npm run setup
```

Este script:
- ✅ Crea la BD `asier_futbol`
- ✅ Crea 5 tablas (usuarios, productos, pedidos, detalles_pedidos, favoritos)
- ✅ Crea 4 índices para optimizar consultas
- ✅ Inserta datos de ejemplo
- ✅ Crea usuario test: `test@example.com` / `test123456`

### 4. Cambiar Contraseña del Usuario Test
```bash
npm run cambiar-pwd
```

Ingresa el email y la nueva contraseña.

## 🏃 Ejecutar el Servidor

**Desarrollo** (con auto-reload):
```bash
npm run dev
```

**Producción**:
```bash
npm start
```

El servidor estará disponible en `http://localhost:5000`

## 📊 Estructura de Base de Datos

### Usuarios
- `id` - ID único
- `email` - Email único
- `contraseña` - Contraseña hasheada con bcrypt
- `nombre_completo` - Nombre del usuario
- `telefono` - Teléfono de contacto
- `direccion` - Dirección de envío
- `ciudad` - Ciudad
- `codigo_postal` - Código postal
- `rol` - 'cliente' o 'admin' (default: cliente)
- `activo` - Cuenta activa o no
- `fecha_registro` - Fecha de registro

### Productos
- `id` - ID único
- `nombre` - Nombre del producto
- `descripcion` - Descripción detallada
- `precio` - Precio en USD
- `cantidad_stock` - Stock disponible
- `categoria` - Categoría del producto
- `imagen_url` - URL de la imagen
- `proveedor` - Proveedor del producto
- `activo` - Producto activo o no

### Pedidos
- `id` - ID único
- `usuario_id` - Referencia al usuario
- `estado` - Estado del pedido (pendiente, confirmado, enviado, entregado, cancelado)
- `total` - Total del pedido
- `fecha_pedido` - Fecha de creación
- `fecha_entrega` - Fecha de entrega (null si no está entregado)
- `direccion_envio` - Dirección de envío
- `metodo_pago` - Método de pago (tarjeta, efectivo, etc)
- `stripe_payment_id` - ID de pago de Stripe

### Detalles Pedidos
- `id` - ID único
- `pedido_id` - Referencia al pedido
- `producto_id` - Referencia al producto
- `cantidad` - Cantidad comprada
- `precio_unitario` - Precio al momento de la compra
- `subtotal` - Cantidad x Precio

### Favoritos
- `id` - ID único
- `usuario_id` - Referencia al usuario
- `producto_id` - Referencia al producto
- `fecha_agregado` - Fecha en que se agregó a favoritos

## 🔐 Seguridad

✅ **Contraseñas hasheadas** con bcrypt (10 rondas)
✅ **Índices en campos críticos** para optimizar búsquedas
✅ **Foreign keys** con cascada para integridad referencial
✅ **Variables de entorno** para datos sensibles
✅ **Validación de entrada** requerida en endpoints

## 📝 Scripts Disponibles

| Script | Descripción |
|--------|-------------|
| `npm start` | Ejecutar servidor en producción |
| `npm run dev` | Ejecutar servidor en desarrollo con nodemon |
| `npm run setup` | Crear base de datos e insertar datos de ejemplo |
| `npm run cambiar-pwd` | Cambiar contraseña de un usuario |

## 🐛 Troubleshooting

**Error: "ECONNREFUSED" al conectar a PostgreSQL**
- Verifica que PostgreSQL está corriendo
- Verifica que los datos en `.env` son correctos
- Por defecto: user=postgres, password=admin, host=localhost, port=5432

**Error: "relation 'usuarios' does not exist"**
- La BD no ha sido creada
- Ejecuta `npm run setup`

**Contraseña olvidada del usuario test**
- Ejecuta `npm run cambiar-pwd` e ingresa el email

## 📚 Endpoints Próximos

- `GET /api/productos` - Listar productos
- `GET /api/productos/:id` - Detalles de producto
- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/login` - Login
- `POST /api/pedidos` - Crear pedido
- `GET /api/pedidos/:id` - Detalles del pedido

---

Hecho con ❤️ para PakSports
