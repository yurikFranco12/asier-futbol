const express = require('express');
const pool = require('../db');
const { verificarToken, verificarAdmin } = require('../middleware/auth');

const SELECT_PRODUCTOS = `
  SELECT p.id, p.nombre, p.descripcion, p.precio, p.cantidad_stock, p.imagen_url, p.caracteristicas, p.activo,
         p.categoria_id, c.nombre AS categoria, c.slug AS categoria_slug,
         cp.nombre AS categoria_padre, cp.slug AS categoria_padre_slug
  FROM productos p
  LEFT JOIN categorias c ON c.id = p.categoria_id
  LEFT JOIN categorias cp ON cp.id = c.padre_id`;

function formatear(fila) {
  return {
    ...fila,
    precio: parseFloat(fila.precio),
    caracteristicas: fila.caracteristicas || []
  };
}

async function buscarPorId(id) {
  const { rows } = await pool.query(`${SELECT_PRODUCTOS} WHERE p.id = $1`, [id]);
  return rows[0] ? formatear(rows[0]) : null;
}

async function validarProducto(body) {
  const nombre = typeof body.nombre === 'string' ? body.nombre.trim() : '';
  const precio = Number(body.precio);
  const stock = Number(body.cantidad_stock ?? 0);
  const categoriaId = Number(body.categoria_id);

  if (!nombre) return { error: 'El nombre es obligatorio' };
  if (!Number.isFinite(precio) || precio < 0) return { error: 'El precio debe ser un número mayor o igual a 0' };
  if (!Number.isInteger(stock) || stock < 0) return { error: 'El stock debe ser un número entero mayor o igual a 0' };
  if (!Number.isInteger(categoriaId) || categoriaId <= 0) return { error: 'Selecciona una categoría' };

  const { rows } = await pool.query(
    'SELECT 1 FROM categorias WHERE id = $1 AND padre_id IS NOT NULL',
    [categoriaId]
  );
  if (rows.length === 0) return { error: 'La categoría debe ser una subcategoría existente' };

  const caracteristicas = Array.isArray(body.caracteristicas)
    ? body.caracteristicas.map(c => String(c).trim()).filter(Boolean)
    : [];

  return {
    datos: {
      nombre,
      descripcion: body.descripcion?.trim() || null,
      precio,
      cantidad_stock: stock,
      categoria_id: categoriaId,
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
    const { rows } = await pool.query(`${SELECT_PRODUCTOS} WHERE p.activo = TRUE ORDER BY p.id`);
    res.json({ success: true, productos: rows.map(formatear) });
  } catch (error) {
    console.error('❌ Error listando productos:', error);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
});

publico.get('/:id', async (req, res) => {
  try {
    const producto = await buscarPorId(req.params.id);
    if (!producto || !producto.activo) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json({ success: true, producto });
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
    const { rows } = await pool.query(`${SELECT_PRODUCTOS} ORDER BY p.id`);
    res.json({ success: true, productos: rows.map(formatear) });
  } catch (error) {
    console.error('❌ Error listando productos (admin):', error);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
});

admin.post('/', async (req, res) => {
  try {
    const { error, datos } = await validarProducto(req.body);
    if (error) return res.status(400).json({ error });

    const { rows } = await pool.query(
      `INSERT INTO productos (nombre, descripcion, precio, cantidad_stock, categoria_id, imagen_url, caracteristicas, activo)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id`,
      [datos.nombre, datos.descripcion, datos.precio, datos.cantidad_stock,
        datos.categoria_id, datos.imagen_url, datos.caracteristicas, datos.activo]
    );
    res.status(201).json({ success: true, producto: await buscarPorId(rows[0].id) });
  } catch (error) {
    console.error('❌ Error creando producto:', error);
    res.status(500).json({ error: 'Error al crear el producto' });
  }
});

admin.put('/:id', async (req, res) => {
  try {
    const { error, datos } = await validarProducto(req.body);
    if (error) return res.status(400).json({ error });

    const { rows } = await pool.query(
      `UPDATE productos
       SET nombre = $1, descripcion = $2, precio = $3, cantidad_stock = $4, categoria_id = $5,
           imagen_url = $6, caracteristicas = $7, activo = $8,
           fecha_actualizacion = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
       WHERE id = $9
       RETURNING id`,
      [datos.nombre, datos.descripcion, datos.precio, datos.cantidad_stock, datos.categoria_id,
        datos.imagen_url, datos.caracteristicas, datos.activo, req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json({ success: true, producto: await buscarPorId(rows[0].id) });
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
      const { rows } = await pool.query(
        'UPDATE productos SET activo = FALSE, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING id',
        [req.params.id]
      );
      if (rows.length === 0) {
        return res.status(404).json({ error: 'Producto no encontrado' });
      }
      return res.json({
        success: true,
        modo: 'desactivado',
        mensaje: 'El producto aparece en pedidos anteriores, así que se ha ocultado del catálogo en lugar de borrarse',
        producto: await buscarPorId(rows[0].id)
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
