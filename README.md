# AsierFutbol 🏆

Tienda online de equipamiento deportivo con React + Node.js + PostgreSQL. MVP en desarrollo.

## 📋 Descripción

AsierFutbol es una plataforma e-commerce para vender equipamiento deportivo de calidad directamente a clubes y jugadores. Comenzaremos con dropshipping y evolucionaremos a nuestra propia marca deportiva.

**Objetivo:** €200/mes en costes, modelo escalable, marca profesional.

## 🚀 Quick Start

### Requisitos
- Node.js 16+
- npm o yarn
- PostgreSQL 12+ (próximas semanas)

### Instalación

**1. Clonar repositorio**
```bash
git clone https://github.com/yurikFranco12/asier-futbol.git
cd asier-futbol
```

**2. Frontend (puerto 3000)**
```bash
cd frontend
npm install
npm start
```

**3. Backend (puerto 5000)**
```bash
cd backend
npm install
npm start
```

Listo. Accede a `http://localhost:3000`

## 📁 Estructura del Proyecto

asier-futbol/
├── frontend/ # React 18 + Vite
│ ├── src/
│ │ ├── components/ # Cabecera, Carrito, Pago, etc.
│ │ ├── paginas/ # Inicio
│ │ ├── contexto/ # ContextoCarrito (Context API)
│ │ ├── estilos/ # CSS componentes
│ │ └── App.js
│ └── package.json
│
├── backend/ # Express.js
│ ├── servidor.js # Rutas API
│ ├── .env # Variables de entorno
│ └── package.json
│
└── CLAUDE.md # Registro de desarrollo

## 🎨 Colores & Branding

- **Verde Cancha:** `#2D5016` - Profesional, confianza
- **Oro Premium:** `#D4AF37` - Destacar, CTAs
- **Blanco:** `#FFFFFF` - Limpieza, espacios

## 🛠️ Stack Tecnológico

### Frontend
- **React 18** - UI declarativa
- **React Router** - Navegación SPA
- **Context API** - Estado global (carrito)
- **CSS3** - Animaciones, responsive

### Backend
- **Express.js** - API REST
- **Stripe** - Pagos (test mode)
- **Node.js** - Runtime

### Base de Datos (próximamente)
- **PostgreSQL** - Datos persistentes
- **Tablas:** usuarios, productos, pedidos

## 📦 Funcionalidades (MVP)

### ✅ Completadas
- [x] Homepage con grid 4 columnas
- [x] Carrito con Context API
- [x] Página checkout/pago
- [x] React Router (/, /carrito, /pago)
- [x] Animaciones hover
- [x] Backend Express (puerto 5000)
- [x] Rutas API /api/pedidos

### 🔄 En Progreso
- [ ] Stripe Elements integración
- [ ] PostgreSQL + persistencia
- [ ] Webhook Stripe

### ❌ Próximas
- [ ] Autenticación usuario
- [ ] Panel admin
- [ ] Email confirmación
- [ ] Analytics

## 💳 Testing Stripe

**Modo:** Test (sin dinero real)

**Tarjeta de prueba:**

4242 4242 4242 4242
Expira: Cualquier fecha futura
CVC: Cualquier 3 dígitos

## 🚢 Deployment

**Frontend:** Vercel (gratis)  
**Backend:** DigitalOcean (~€12/mes)  
**DB:** DigitalOcean Managed PostgreSQL (~€10/mes)

## 📝 Convenciones

- ✅ Todos los nombres en **ESPAÑOL**
- ✅ Componentes: `PascalCase` (Cabecera.js)
- ✅ Funciones: `camelCase` (agregarAlCarrito)
- ✅ Estilos: `NombreComponente.css`

## 🔐 Seguridad

- ✅ `.env` para secretos (NO commitear)
- ✅ CORS habilitado
- ✅ Variables de entorno para Stripe

**Nunca pushees .env o secretos a GitHub**

## 📞 Contacto

**Creador:** Asier  
**Email:** yurikfranco@gmail.com  
**GitHub:** https://github.com/yurikFranco12/asier-futbol

## 📄 Licencia

MIT

---

**Estado:** MVP 45% completado | **Última actualización:** 02/10/2026