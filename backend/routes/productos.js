const express = require('express');
const pool = require('../db');
const { verificarToken, verificarAdmin } = require('../middleware/auth');

const COLUMNAS = 'id, nombre, descripcion, precio, cantidad_stock, categoria, imagen_url, caracteristicas, activo';

function formatear(fila) {
  return {
    ...fila,
    precio: parseFloat(fila.precio),
    caracteristicas: fila.caracteristicas || []
  };
}

function validarProducto(body) {
  const nombre = typeof body.nombre === 'string' ? body.nombre.trim() : '';
  const precio = Number(body.precio);
  const stock = Number(body.cantidad_stock ?? 0);

  if (!nombre) return { error: 'El nombre es obligatorio' };
  if (!Number.isFinite(precio) || precio < 0) return { error: 'El precio debe ser un número mayor o igual a 0' };
  if (!Number.isInteger(stock) || stock < 0) return { error: 'El stock debe ser un número entero mayor o igual a 0' };

  const caracteristicas = Array.isArray(body.caracteristicas)
    ? body.caracteristicas.map(c => String(c).trim()).filter(Boolean)
    : [];

  return {
    datos: {
      nombre,
      descripcion: body.descripcion?.trim() || null,
      precio,
      cantidad_stock: stock,
      categoria: body.categoria?.trim() || null,
      imagen_url: body.imagen_url?.trim() || null,
      caracteristicas,
      activo: body.activo !== false
    }
  };
}

// ==================== PÚBLICO ====================

const publico = express.Router();

publico.get('/', async (req, res) => {
  try {
    const resultado = await pool.query(
      `SELECT ${COLUMNAS} FROM productos WHERE activo = TRUE ORDER BY id`
    );
    res.json({ success: true, productos: resultado.rows.map(formatear) });
  } catch (error) {
    console.error('❌ Error listando productos:', error);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
});

publico.get('/:id', async (req, res) => {
  try {
    const resultado = await pool.query(
      `SELECT ${COLUMNAS} FROM productos WHERE id = $1 AND activo = TRUE`,
      [req.params.id]
    );
    if (resultado.rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json({ success: true, producto: formatear(resultado.rows[0]) });
  } catch (error) {
    console.error('❌ Error obteniendo producto:', error);
    res.status(500).json({ error: 'Error al obtener el producto' });
  }
});

// ==================== ADMIN ====================

const admin = express.Router();
admin.use(verificarToken, verificarAdmin);

admin.get('/', async (req, res) => {
  try {
    const resultado = await pool.query(`SELECT ${COLUMNAS} FROM productos ORDER BY id`);
    res.json({ success: true, productos: resultado.rows.map(formatear) });
  } catch (error) {
    console.error('❌ Error listando productos (admin):', error);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
});

admin.post('/', async (req, res) => {
  const { error, datos } = validarProducto(req.body);
  if (error) return res.status(400).json({ error });

  try {
    const resultado = await pool.query(
      `INSERT INTO productos (nombre, descripcion, precio, cantidad_stock, categoria, imagen_url, caracteristicas, activo)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING ${COLUMNAS}`,
      [datos.nombre, datos.descripcion, datos.precio, datos.cantidad_stock,
        datos.categoria, datos.imagen_url, datos.caracteristicas, datos.activo]
    );
    res.status(201).json({ success: true, producto: formatear(resultado.rows[0]) });
  } catch (error) {
    console.error('❌ Error creando producto:', error);
    res.status(500).json({ error: 'Error al crear el producto' });
  }
});

admin.put('/:id', async (req, res) => {
  const { error, datos } = validarProducto(req.body);
  if (error) return res.status(400).json({ error });

  try {
    const resultado = await pool.query(
      `UPDATE productos
       SET nombre = $1, descripcion = $2, precio = $3, cantidad_stock = $4, categoria = $5,
           imagen_url = $6, caracteristicas = $7, activo = $8,
           fecha_actualizacion = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
       WHERE id = $9
       RETURNING ${COLUMNAS}`,
      [datos.nombre, datos.descripcion, datos.precio, datos.cantidad_stock, datos.categoria,
        datos.imagen_url, datos.caracteristicas, datos.activo, req.params.id]
    );
    if (resultado.rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json({ success: true, producto: formatear(resultado.rows[0]) });
  } catch (error) {
    console.error('❌ Error actualizando producto:', error);
    res.status(500).json({ error: 'Error al actualizar el producto' });
  }
});

// Products that appear in past orders are deactivated instead of deleted,
// so order history keeps its name and image (detalles_pedidos uses ON DELETE RESTRICT).
admin.delete('/:id', async (req, res) => {
  try {
    const enPedidos = await pool.query(
      'SELECT 1 FROM detalles_pedidos WHERE producto_id = $1 LIMIT 1',
      [req.params.id]
    );

    if (enPedidos.rows.length > 0) {
      const resultado = await pool.query(
        `UPDATE productos SET activo = FALSE, updated_at = CURRENT_TIMESTAMP
         WHERE id = $1 RETURNING ${COLUMNAS}`,
        [req.params.id]
      );
      if (resultado.rows.length === 0) {
        return res.status(404).json({ error: 'Producto no encontrado' });
      }
      return res.json({
        success: true,
        modo: 'desactivado',
        mensaje: 'El producto aparece en pedidos anteriores, así que se ha ocultado del catálogo en lugar de borrarse',
        producto: formatear(resultado.rows[0])
      });
    }

    const resultado = await pool.query('DELETE FROM productos WHERE id = $1 RETURNING id', [req.params.id]);
    if (resultado.rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json({ success: true, modo: 'eliminado', mensaje: 'Producto eliminado' });
  } catch (error) {
    console.error('❌ Error eliminando producto:', error);
    res.status(500).json({ error: 'Error al eliminar el producto' });
  }
});

module.exports = { publico, admin };
