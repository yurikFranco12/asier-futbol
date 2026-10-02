require('dotenv').config();
const { Client } = require('pg');
const bcrypt = require('bcrypt');
const productosIniciales = require('./datos/productosIniciales');
const insertarCategorias = require('./datos/insertarCategorias');

// Datos de conexión
const config = {
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'admin',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432
};

async function crearBaseDatos() {
  const client = new Client(config);

  try {
    console.log('🔌 Conectando a PostgreSQL...');
    await client.connect();
    console.log('✅ Conectado\n');

    // 1. Crear BD
    console.log('📁 Creando base de datos asier_futbol...');
    await client.query('DROP DATABASE IF EXISTS asier_futbol;');
    await client.query('CREATE DATABASE asier_futbol ENCODING UTF8;');
    console.log('✅ BD creada\n');

    await client.end();

    // 2. Conectar a la BD nueva
    const clientDB = new Client({
      ...config,
      database: 'asier_futbol'
    });

    console.log('🔌 Conectando a asier_futbol...');
    await clientDB.connect();
    console.log('✅ Conectado\n');

    // 3. Crear tablas
    console.log('📋 Creando tablas...\n');

    // Tabla USUARIOS
    console.log('  • Creando tabla USUARIOS...');
    await clientDB.query(`
      CREATE TABLE usuarios (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        contraseña VARCHAR(255) NOT NULL,
        nombre_completo VARCHAR(255) NOT NULL,
        telefono VARCHAR(20),
        direccion VARCHAR(500),
        ciudad VARCHAR(100),
        codigo_postal VARCHAR(10),
        fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        activo BOOLEAN DEFAULT TRUE,
        rol VARCHAR(50) DEFAULT 'cliente',
        email_verificado BOOLEAN NOT NULL DEFAULT FALSE,
        token_verificacion VARCHAR(64),
        token_verificacion_expira TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('     ✅ USUARIOS creada');

    // Tabla CATEGORIAS (dos niveles: categoría padre y subcategoría)
    console.log('  • Creando tabla CATEGORIAS...');
    await clientDB.query(`
      CREATE TABLE categorias (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        slug VARCHAR(100) UNIQUE NOT NULL,
        padre_id INT REFERENCES categorias(id) ON DELETE CASCADE,
        orden INT NOT NULL DEFAULT 0
      );
    `);
    console.log('     ✅ CATEGORIAS creada');

    // Tabla PRODUCTOS
    console.log('  • Creando tabla PRODUCTOS...');
    await clientDB.query(`
      CREATE TABLE productos (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(255) NOT NULL,
        descripcion TEXT,
        precio DECIMAL(10, 2) NOT NULL,
        cantidad_stock INT NOT NULL DEFAULT 0,
        categoria_id INT REFERENCES categorias(id) ON DELETE SET NULL,
        imagen_url VARCHAR(500),
        caracteristicas TEXT[] NOT NULL DEFAULT '{}',
        fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        activo BOOLEAN DEFAULT TRUE,
        proveedor VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('     ✅ PRODUCTOS creada');

    // Tabla PEDIDOS
    console.log('  • Creando tabla PEDIDOS...');
    await clientDB.query(`
      CREATE TABLE pedidos (
        id SERIAL PRIMARY KEY,
        usuario_id INT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
        estado VARCHAR(50) DEFAULT 'pendiente',
        total DECIMAL(10, 2) NOT NULL,
        fecha_pedido TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        fecha_entrega TIMESTAMP,
        direccion_envio VARCHAR(500) NOT NULL,
        metodo_pago VARCHAR(50),
        stripe_payment_id VARCHAR(255) UNIQUE,
        notas TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('     ✅ PEDIDOS creada');

    // Tabla DETALLES_PEDIDOS
    console.log('  • Creando tabla DETALLES_PEDIDOS...');
    await clientDB.query(`
      CREATE TABLE detalles_pedidos (
        id SERIAL PRIMARY KEY,
        pedido_id INT NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
        producto_id INT NOT NULL REFERENCES productos(id) ON DELETE RESTRICT,
        cantidad INT NOT NULL,
        precio_unitario DECIMAL(10, 2) NOT NULL,
        subtotal DECIMAL(10, 2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(pedido_id, producto_id)
      );
    `);
    console.log('     ✅ DETALLES_PEDIDOS creada');

    // Tabla FAVORITOS
    console.log('  • Creando tabla FAVORITOS...');
    await clientDB.query(`
      CREATE TABLE favoritos (
        id SERIAL PRIMARY KEY,
        usuario_id INT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
        producto_id INT NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
        fecha_agregado TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(usuario_id, producto_id)
      );
    `);
    console.log('     ✅ FAVORITOS creada\n');

    // 4. Crear índices
    console.log('🔍 Creando índices...\n');
    await clientDB.query('CREATE INDEX idx_usuarios_email ON usuarios(email);');
    await clientDB.query('CREATE INDEX idx_usuarios_token_verificacion ON usuarios(token_verificacion);');
    await clientDB.query('CREATE INDEX idx_pedidos_usuario ON pedidos(usuario_id);');
    await clientDB.query('CREATE INDEX idx_detalles_pedido ON detalles_pedidos(pedido_id);');
    await clientDB.query('CREATE INDEX idx_favoritos_usuario ON favoritos(usuario_id);');
    console.log('  ✅ Índices creados\n');

    // 5. Datos de ejemplo
    console.log('📝 Insertando datos de ejemplo...\n');

    // Usuario de ejemplo con contraseña hasheada
    const passwordTest = 'test123456';
    const hashedPassword = await bcrypt.hash(passwordTest, 10);

    await clientDB.query(`
      INSERT INTO usuarios (email, contraseña, nombre_completo, telefono, ciudad, rol, email_verificado)
      VALUES ($1, $2, $3, $4, $5, $6, TRUE)
    `, ['test@example.com', hashedPassword, 'Usuario Test', '123456789', 'Madrid', 'cliente']);
    console.log('  ✅ Usuario de ejemplo agregado');
    console.log(`     📧 Email: test@example.com`);
    console.log(`     🔑 Contraseña: ${passwordTest}`);

    // Categorías
    await insertarCategorias(clientDB);
    console.log('  ✅ Categorías agregadas');

    // Productos de ejemplo
    for (const p of productosIniciales) {
      await clientDB.query(
        `INSERT INTO productos (nombre, descripcion, precio, cantidad_stock, categoria_id, imagen_url, proveedor, caracteristicas)
         VALUES ($1, $2, $3, $4, (SELECT id FROM categorias WHERE slug = $5), $6, $7, $8)`,
        [p.nombre, p.descripcion, p.precio, p.cantidad_stock, p.categoria_slug, p.imagen_url, p.proveedor, p.caracteristicas]
      );
    }
    console.log(`  ✅ ${productosIniciales.length} productos de ejemplo agregados\n`);

    console.log('═══════════════════════════════════════════════════════════');
    console.log('🎉 ¡BASE DE DATOS CREADA EXITOSAMENTE!');
    console.log('═══════════════════════════════════════════════════════════\n');

    console.log('📊 Resumen:');
    console.log('  ✅ BD: asier_futbol');
    console.log('  ✅ Tablas: 6 (usuarios, categorias, productos, pedidos, detalles_pedidos, favoritos)');
    console.log('  ✅ Índices: 4');
    console.log('  ✅ Usuario test: test@example.com');
    console.log('  ✅ Productos: 6 de ejemplo\n');

    console.log('⚠️  IMPORTANTE:');
    console.log('  1. Cambia la contraseña del usuario test');
    console.log('  2. Usa bcrypt para hashear contraseñas en producción');
    console.log('  3. Actualiza el .env con los datos de conexión\n');

    await clientDB.end();

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

crearBaseDatos();