const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../db');
const { JWT_SECRET, verificarToken } = require('../middleware/auth');

// ==================== REGISTRO ====================

/**
 * POST /api/auth/register
 * Registrar nuevo usuario
 */
router.post('/register', async (req, res) => {
  const client = await pool.connect();

  try {
    const { email, contraseña, nombre_completo, telefono } = req.body;

    // Validación
    if (!email || !contraseña || !nombre_completo) {
      return res.status(400).json({
        error: 'Email, contraseña y nombre son requeridos'
      });
    }

    if (contraseña.length < 6) {
      return res.status(400).json({
        error: 'La contraseña debe tener al menos 6 caracteres'
      });
    }

    // Verificar si el usuario ya existe
    const usuarioExistente = await client.query(
      'SELECT id FROM usuarios WHERE email = $1',
      [email]
    );

    if (usuarioExistente.rows.length > 0) {
      return res.status(400).json({
        error: 'Este email ya está registrado'
      });
    }

    // Hashear contraseña
    const contraseñaHasheada = await bcrypt.hash(contraseña, 10);

    // Insertar usuario
    const resultado = await client.query(
      `INSERT INTO usuarios (email, contraseña, nombre_completo, telefono, rol, activo)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, email, nombre_completo, telefono, rol, fecha_registro`,
      [email, contraseñaHasheada, nombre_completo, telefono || null, 'cliente', true]
    );

    const usuario = resultado.rows[0];

    // Generar JWT
    const token = jwt.sign(
      { id: usuario.id, email: usuario.email },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.status(201).json({
      success: true,
      mensaje: 'Usuario registrado exitosamente',
      token: token,
      usuario: {
        id: usuario.id,
        email: usuario.email,
        nombre_completo: usuario.nombre_completo,
        telefono: usuario.telefono,
        rol: usuario.rol,
        fecha_registro: usuario.fecha_registro
      }
    });

  } catch (error) {
    console.error('❌ Error en registro:', error);
    res.status(500).json({
      error: 'Error al registrar usuario',
      details: error.message
    });
  } finally {
    client.release();
  }
});

// ==================== LOGIN ====================

/**
 * POST /api/auth/login
 * Iniciar sesión
 */
router.post('/login', async (req, res) => {
  try {
    const { email, contraseña } = req.body;

    // Validación
    if (!email || !contraseña) {
      return res.status(400).json({
        error: 'Email y contraseña requeridos'
      });
    }

    // Buscar usuario
    const resultado = await pool.query(
      'SELECT * FROM usuarios WHERE email = $1',
      [email]
    );

    if (resultado.rows.length === 0) {
      return res.status(401).json({
        error: 'Email o contraseña incorrectos'
      });
    }

    const usuario = resultado.rows[0];

    // Verificar contraseña
    const contraseñaValida = await bcrypt.compare(contraseña, usuario.contraseña);

    if (!contraseñaValida) {
      return res.status(401).json({
        error: 'Email o contraseña incorrectos'
      });
    }

    // Verificar si el usuario está activo
    if (!usuario.activo) {
      return res.status(401).json({
        error: 'Esta cuenta ha sido desactivada'
      });
    }

    // Generar JWT
    const token = jwt.sign(
      { id: usuario.id, email: usuario.email },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      success: true,
      mensaje: 'Sesión iniciada exitosamente',
      token: token,
      usuario: {
        id: usuario.id,
        email: usuario.email,
        nombre_completo: usuario.nombre_completo,
        telefono: usuario.telefono,
        direccion: usuario.direccion,
        ciudad: usuario.ciudad,
        codigo_postal: usuario.codigo_postal,
        rol: usuario.rol,
        fecha_registro: usuario.fecha_registro
      }
    });

  } catch (error) {
    console.error('❌ Error en login:', error);
    res.status(500).json({
      error: 'Error al iniciar sesión',
      details: error.message
    });
  }
});

// ==================== PERFIL ====================

/**
 * GET /api/auth/perfil
 * Obtener perfil del usuario logueado
 */
router.get('/perfil', verificarToken, async (req, res) => {
  try {
    const resultado = await pool.query(
      'SELECT id, email, nombre_completo, telefono, direccion, ciudad, codigo_postal, rol, fecha_registro, activo FROM usuarios WHERE id = $1',
      [req.usuario.id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({
      success: true,
      usuario: resultado.rows[0]
    });

  } catch (error) {
    console.error('❌ Error obteniendo perfil:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== ACTUALIZAR PERFIL ====================

/**
 * PUT /api/auth/perfil
 * Actualizar datos del perfil
 */
router.put('/perfil', verificarToken, async (req, res) => {
  const client = await pool.connect();

  try {
    const { nombre_completo, telefono, direccion, ciudad, codigo_postal } = req.body;

    const resultado = await client.query(
      `UPDATE usuarios
       SET nombre_completo = COALESCE($1, nombre_completo),
           telefono = COALESCE($2, telefono),
           direccion = COALESCE($3, direccion),
           ciudad = COALESCE($4, ciudad),
           codigo_postal = COALESCE($5, codigo_postal),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $6
       RETURNING id, email, nombre_completo, telefono, direccion, ciudad, codigo_postal`,
      [nombre_completo, telefono, direccion, ciudad, codigo_postal, req.usuario.id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({
      success: true,
      mensaje: 'Perfil actualizado correctamente',
      usuario: resultado.rows[0]
    });

  } catch (error) {
    console.error('❌ Error actualizando perfil:', error);
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});

// ==================== CAMBIAR CONTRASEÑA ====================

/**
 * POST /api/auth/cambiar-contraseña
 * Cambiar contraseña del usuario
 */
router.post('/cambiar-contraseña', verificarToken, async (req, res) => {
  const client = await pool.connect();

  try {
    const { contraseña_actual, contraseña_nueva } = req.body;

    if (!contraseña_actual || !contraseña_nueva) {
      return res.status(400).json({
        error: 'Contraseña actual y nueva requeridas'
      });
    }

    if (contraseña_nueva.length < 6) {
      return res.status(400).json({
        error: 'La nueva contraseña debe tener al menos 6 caracteres'
      });
    }

    // Obtener usuario
    const usuarioResult = await client.query(
      'SELECT contraseña FROM usuarios WHERE id = $1',
      [req.usuario.id]
    );

    if (usuarioResult.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Verificar contraseña actual
    const contraseñaValida = await bcrypt.compare(
      contraseña_actual,
      usuarioResult.rows[0].contraseña
    );

    if (!contraseñaValida) {
      return res.status(401).json({
        error: 'La contraseña actual es incorrecta'
      });
    }

    // Hashear nueva contraseña
    const contraseñaHasheada = await bcrypt.hash(contraseña_nueva, 10);

    // Actualizar contraseña
    await client.query(
      'UPDATE usuarios SET contraseña = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [contraseñaHasheada, req.usuario.id]
    );

    res.json({
      success: true,
      mensaje: 'Contraseña cambiada exitosamente'
    });

  } catch (error) {
    console.error('❌ Error cambiando contraseña:', error);
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});

// ==================== MIS PEDIDOS ====================

/**
 * GET /api/auth/mis-pedidos
 * Obtener todos los pedidos del usuario logueado
 */
router.get('/mis-pedidos', verificarToken, async (req, res) => {
  try {
    // Obtener pedidos con sus detalles
    const resultado = await pool.query(
      `SELECT
        p.id,
        p.estado,
        p.total,
        p.fecha_pedido,
        p.fecha_entrega,
        p.direccion_envio,
        p.metodo_pago,
        COUNT(dp.id) as cantidad_items
       FROM pedidos p
       LEFT JOIN detalles_pedidos dp ON p.id = dp.pedido_id
       WHERE p.usuario_id = $1
       GROUP BY p.id
       ORDER BY p.fecha_pedido DESC`,
      [req.usuario.id]
    );

    res.json({
      success: true,
      pedidos: resultado.rows
    });

  } catch (error) {
    console.error('❌ Error obteniendo pedidos:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/auth/mi-pedido/:id
 * Obtener detalles completos de un pedido específico
 */
router.get('/mi-pedido/:id', verificarToken, async (req, res) => {
  try {
    const pedidoId = req.params.id;

    // Verificar que el pedido pertenece al usuario
    const verificacion = await pool.query(
      'SELECT usuario_id FROM pedidos WHERE id = $1',
      [pedidoId]
    );

    if (verificacion.rows.length === 0) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }

    if (verificacion.rows[0].usuario_id !== req.usuario.id) {
      return res.status(403).json({ error: 'No tienes acceso a este pedido' });
    }

    // Obtener detalles del pedido
    const pedido = await pool.query(
      `SELECT * FROM pedidos WHERE id = $1`,
      [pedidoId]
    );

    // Obtener items del pedido
    const items = await pool.query(
      `SELECT
        dp.id,
        dp.producto_id,
        dp.cantidad,
        dp.precio_unitario,
        dp.subtotal,
        pr.nombre,
        pr.imagen_url
       FROM detalles_pedidos dp
       JOIN productos pr ON dp.producto_id = pr.id
       WHERE dp.pedido_id = $1`,
      [pedidoId]
    );

    res.json({
      success: true,
      pedido: {
        ...pedido.rows[0],
        items: items.rows
      }
    });

  } catch (error) {
    console.error('❌ Error obteniendo detalles del pedido:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== ELIMINAR CUENTA ====================

/**
 * DELETE /api/auth/eliminar-cuenta
 * Eliminar cuenta del usuario
 */
router.delete('/eliminar-cuenta', verificarToken, async (req, res) => {
  const client = await pool.connect();

  try {
    const { contraseña } = req.body;

    if (!contraseña) {
      return res.status(400).json({
        error: 'Contraseña requerida para eliminar cuenta'
      });
    }

    // Obtener usuario
    const usuarioResult = await client.query(
      'SELECT contraseña, email, rol FROM usuarios WHERE id = $1',
      [req.usuario.id]
    );

    if (usuarioResult.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    if (usuarioResult.rows[0].rol === 'admin') {
      return res.status(403).json({ error: 'La cuenta de administrador no se puede eliminar' });
    }

    // Verificar contraseña
    const contraseñaValida = await bcrypt.compare(
      contraseña,
      usuarioResult.rows[0].contraseña
    );

    if (!contraseñaValida) {
      return res.status(401).json({
        error: 'La contraseña es incorrecta'
      });
    }

    // Iniciar transacción
    await client.query('BEGIN');

    try {
      // Eliminar pedidos asociados (en cascada)
      await client.query(
        'DELETE FROM pedidos WHERE usuario_id = $1',
        [req.usuario.id]
      );

      // Eliminar favoritos
      await client.query(
        'DELETE FROM favoritos WHERE usuario_id = $1',
        [req.usuario.id]
      );

      // Eliminar usuario
      await client.query(
        'DELETE FROM usuarios WHERE id = $1',
        [req.usuario.id]
      );

      await client.query('COMMIT');

      res.json({
        success: true,
        mensaje: 'Cuenta eliminada exitosamente. Lamentamos verte ir.'
      });

    } catch (dbError) {
      await client.query('ROLLBACK');
      throw dbError;
    }

  } catch (error) {
    console.error('❌ Error eliminando cuenta:', error);
    res.status(500).json({
      error: 'Error al eliminar cuenta',
      details: error.message
    });
  } finally {
    client.release();
  }
});

module.exports = router;
