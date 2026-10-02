const categorias = require('./categorias');

// Idempotent: safe to run on a database that already has some of the categories.
async function insertarCategorias(db) {
  for (const [i, padre] of categorias.entries()) {
    const { rows } = await db.query(
      `INSERT INTO categorias (nombre, slug, orden) VALUES ($1, $2, $3)
       ON CONFLICT (slug) DO UPDATE SET nombre = EXCLUDED.nombre, orden = EXCLUDED.orden
       RETURNING id`,
      [padre.nombre, padre.slug, i]
    );
    for (const [j, hijo] of padre.hijos.entries()) {
      await db.query(
        `INSERT INTO categorias (nombre, slug, padre_id, orden) VALUES ($1, $2, $3, $4)
         ON CONFLICT (slug) DO UPDATE SET nombre = EXCLUDED.nombre, padre_id = EXCLUDED.padre_id, orden = EXCLUDED.orden`,
        [hijo.nombre, hijo.slug, rows[0].id, j]
      );
    }
  }
}

module.exports = insertarCategorias;
