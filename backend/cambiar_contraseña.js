const { Client } = require('pg');
const bcrypt = require('bcrypt');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const pregunta = (texto) => new Promise(resolve => {
  rl.question(texto, resolve);
});

const config = {
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'admin',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'asier_futbol'
};

async function cambiarContraseña() {
  const client = new Client(config);

  try {
    console.log('\n🔐 ═══════════════════════════════════════════════════════════');
    console.log('🔐  Cambiar contraseña de usuario');
    console.log('🔐 ═══════════════════════════════════════════════════════════\n');

    const email = await pregunta('📧 Email del usuario: ');
    const nuevaContraseña = await pregunta('🔑 Nueva contraseña: ');
    const confirmar = await pregunta('🔑 Confirma la contraseña: ');

    if (nuevaContraseña !== confirmar) {
      console.log('\n❌ Las contraseñas no coinciden');
      rl.close();
      return;
    }

    if (nuevaContraseña.length < 6) {
      console.log('\n❌ La contraseña debe tener al menos 6 caracteres');
      rl.close();
      return;
    }

    console.log('\n🔌 Conectando a la base de datos...');
    await client.connect();
    console.log('✅ Conectado\n');

    // Verificar que el usuario existe
    const resultado = await client.query(
      'SELECT id, email FROM usuarios WHERE email = $1',
      [email]
    );

    if (resultado.rows.length === 0) {
      console.log('❌ Usuario no encontrado');
      await client.end();
      rl.close();
      return;
    }

    // Hashear y actualizar contraseña
    const hashedPassword = await bcrypt.hash(nuevaContraseña, 10);

    await client.query(
      'UPDATE usuarios SET contraseña = $1, updated_at = CURRENT_TIMESTAMP WHERE email = $2',
      [hashedPassword, email]
    );

    console.log('═══════════════════════════════════════════════════════════');
    console.log('✅ ¡Contraseña actualizada correctamente!');
    console.log('═══════════════════════════════════════════════════════════\n');
    console.log(`📧 Usuario: ${email}`);
    console.log(`🔑 Nueva contraseña: ${nuevaContraseña}\n`);

    await client.end();
    rl.close();

  } catch (error) {
    console.error('❌ Error:', error.message);
    await client.end();
    rl.close();
    process.exit(1);
  }
}

cambiarContraseña();
