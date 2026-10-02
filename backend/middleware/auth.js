const jwt = require('jsonwebtoken');
const pool = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'tu_clave_secreta_super_segura_2024';

function verificarToken(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  try {
    req.usuario = jwt.verify(token, JWT_SECRET);
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
}

// Role is read from the DB, not the token, so a demoted admin loses access immediately.
async function verificarAdmin(req, res, next) {
  try {
    const resultado = await pool.query(
      'SELECT rol, activo FROM usuarios WHERE id = $1',
      [req.usuario.id]
    );
    const usuario = resultado.rows[0];

    if (!usuario || !usuario.activo || usuario.rol !== 'admin') {
      return res.status(403).json({ error: 'Acceso restringido a administradores' });
    }

    next();
  } catch (error) {
    console.error('❌ Error verificando admin:', error);
    res.status(500).json({ error: 'Error verificando permisos' });
  }
}

module.exports = { JWT_SECRET, verificarToken, verificarAdmin };
