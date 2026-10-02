require('dotenv').config();
const bcrypt = require('bcrypt');
const pool = require('./db');

async function crearAdmin() {
  const email = process.env.ADMIN_EMAIL;
  const contraseña = process.env.ADMIN_PASSWORD;

  if (!email || !contraseña) {
    console.error('❌ Define ADMIN_EMAIL y ADMIN_PASSWORD en backend/.env');
    process.exit(1);
  }

  const hash = await bcrypt.hash(contraseña, 10);

  const resultado = await pool.query(
    `INSERT INTO usuarios (email, contraseña, nombre_completo, rol, activo, email_verificado)
     VALUES ($1, $2, 'Administrador', 'admin', TRUE, TRUE)
     ON CONFLICT (email) DO UPDATE
       SET contraseña = EXCLUDED.contraseña, rol = 'admin', activo = TRUE, email_verificado = TRUE,
           updated_at = CURRENT_TIMESTAMP
     RETURNING id, email`,
    [email, hash]
  );

  console.log(`✅ Admin listo: ${resultado.rows[0].email} (id ${resultado.rows[0].id})`);
  await pool.end();
}

crearAdmin().catch(error => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
