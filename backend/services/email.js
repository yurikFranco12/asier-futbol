const BREVO_URL = 'https://api.brevo.com/v3/smtp/email';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

function escaparHtml(texto) {
  return String(texto ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function plantilla(titulo, contenido) {
  return `<!doctype html>
<html lang="es">
<body style="margin:0;padding:0;background:#0f0f0f;font-family:Segoe UI,Roboto,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0f0f0f;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#1a1a1a;border:1px solid #2d2d2d;border-radius:12px;">
        <tr><td style="padding:24px 32px;border-bottom:2px solid #2db400;">
          <span style="color:#2db400;font-size:24px;font-weight:700;letter-spacing:1.5px;">PAKSPORTS</span>
        </td></tr>
        <tr><td style="padding:32px;color:#e0e0e0;font-size:15px;line-height:1.6;">
          <h1 style="margin:0 0 16px 0;color:#ffffff;font-size:22px;">${titulo}</h1>
          ${contenido}
        </td></tr>
        <tr><td style="padding:20px 32px;border-top:1px solid #2d2d2d;color:#808080;font-size:12px;">
          Has recibido este email porque tienes una cuenta en PakSports.
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function boton(url, texto) {
  return `<p style="margin:28px 0;">
    <a href="${url}" style="display:inline-block;background:#2db400;color:#0f0f0f;text-decoration:none;font-weight:700;padding:14px 32px;border-radius:10px;">${texto}</a>
  </p>`;
}

// Without BREVO_API_KEY the email is printed to the console, so registration can be tested locally.
async function enviarEmail({ para, nombre, asunto, html }) {
  const apiKey = process.env.BREVO_API_KEY;

  if (!apiKey) {
    console.log('\n📧 [EMAIL SIMULADO - falta BREVO_API_KEY]');
    console.log(`   Para: ${para}`);
    console.log(`   Asunto: ${asunto}`);
    const enlaces = html.match(/href="([^"]+)"/g);
    if (enlaces) enlaces.forEach(e => console.log(`   Enlace: ${e.slice(6, -1)}`));
    console.log('');
    return { simulado: true };
  }

  const respuesta = await fetch(BREVO_URL, {
    method: 'POST',
    headers: {
      'api-key': apiKey,
      'Content-Type': 'application/json',
      accept: 'application/json'
    },
    body: JSON.stringify({
      sender: {
        email: process.env.EMAIL_REMITENTE,
        name: process.env.EMAIL_REMITENTE_NOMBRE || 'PakSports'
      },
      to: [{ email: para, name: nombre || para }],
      subject: asunto,
      htmlContent: html
    })
  });

  if (!respuesta.ok) {
    const detalle = await respuesta.text();
    throw new Error(`Brevo respondió ${respuesta.status}: ${detalle}`);
  }

  return respuesta.json();
}

function enviarVerificacion({ email, nombre, token }) {
  const url = `${FRONTEND_URL}/verificar-email?token=${token}`;
  return enviarEmail({
    para: email,
    nombre,
    asunto: 'Confirma tu email en PakSports',
    html: plantilla(
      `¡Hola, ${escaparHtml(nombre)}!`,
      `<p>Gracias por registrarte en PakSports. Confirma tu dirección de email para activar tu cuenta:</p>
       ${boton(url, 'Confirmar mi email')}
       <p style="color:#b0b0b0;font-size:13px;">El enlace caduca en 24 horas. Si no has creado esta cuenta, ignora este mensaje.</p>`
    )
  });
}

function enviarConfirmacionPedido({ email, nombre, pedidoId, items, total, direccion }) {
  const filas = items.map(i => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #2d2d2d;color:#ffffff;">${escaparHtml(i.nombre)} <span style="color:#808080;">x${i.cantidad}</span></td>
      <td align="right" style="padding:10px 0;border-bottom:1px solid #2d2d2d;color:#2db400;font-weight:600;">$${Number(i.subtotal).toFixed(2)}</td>
    </tr>`).join('');

  return enviarEmail({
    para: email,
    nombre,
    asunto: `Pedido #${pedidoId} confirmado - PakSports`,
    html: plantilla(
      `¡Gracias por tu compra, ${escaparHtml(nombre)}!`,
      `<p>Hemos recibido tu pedido <strong style="color:#2db400;">#${pedidoId}</strong> y ya lo estamos preparando.</p>
       <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;font-size:14px;">
         ${filas}
         <tr>
           <td style="padding:14px 0;color:#ffffff;font-weight:700;">Total</td>
           <td align="right" style="padding:14px 0;color:#2db400;font-weight:700;font-size:18px;">$${Number(total).toFixed(2)}</td>
         </tr>
       </table>
       <p style="margin:0;color:#b0b0b0;font-size:13px;">Dirección de envío:</p>
       <p style="margin:4px 0 0 0;">${escaparHtml(direccion)}</p>
       ${boton(`${FRONTEND_URL}/mis-pedidos`, 'Ver mis pedidos')}`
    )
  });
}

module.exports = { enviarVerificacion, enviarConfirmacionPedido };
