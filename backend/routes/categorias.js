const express = require('express');
const pool = require('../db');

const router = express.Router();

/**
 * GET /api/categorias
 * Árbol de categorías: cada categoría padre con sus subcategorías
 * y el número de productos visibles en cada una.
 */
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT c.id, c.nombre, c.slug, c.padre_id,
             COUNT(p.id) FILTER (WHERE p.activo) AS total
      FROM categorias c
      LEFT JOIN productos p ON p.categoria_id = c.id
      GROUP BY c.id
      ORDER BY c.orden, c.id`);

    const padres = rows
      .filter(c => c.padre_id === null)
      .map(padre => {
        const hijos = rows
          .filter(c => c.padre_id === padre.id)
          .map(({ id, nombre, slug, total }) => ({ id, nombre, slug, total: Number(total) }));
        return {
          id: padre.id,
          nombre: padre.nombre,
          slug: padre.slug,
          total: hijos.reduce((suma, h) => suma + h.total, 0),
          hijos
        };
      });

    res.json({ success: true, categorias: padres });
  } catch (error) {
    console.error('❌ Error listando categorías:', error);
    res.status(500).json({ error: 'Error al obtener categorías' });
  }
});

module.exports = router;
