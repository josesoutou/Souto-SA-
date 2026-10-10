function escapeHtml(str = '') {
  return String(str).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[character]));
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Método no permitido' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { body = {}; }
  }
  body = body || {};

  const fname = (body.fname || '').toString().trim();
  const fcompany = (body.fcompany || '').toString().trim();
  const fphone = (body.fphone || '').toString().trim();
  const femail = (body.femail || '').toString().trim();
  const fmsg = (body.fmsg || '').toString().trim();
  const honeypot = (body.hp_contact_ref || '').toString().trim();

  if (honeypot) {
    return res.status(200).json({ ok: true });
  }

  if (!fname || !femail || !fmsg) {
    return res.status(400).json({ error: 'Faltan campos requeridos' });
  }
  if (!isValidEmail(femail)) {
    return res.status(400).json({ error: 'Email inválido' });
  }
  if (fname.length > 200 || femail.length > 200 || fmsg.length > 5000) {
    return res.status(400).json({ error: 'Contenido demasiado largo' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error('[contact] Falta RESEND_API_KEY en las variables de entorno.');
    return res.status(500).json({ error: 'Configuración de servidor incompleta' });
  }

  const toEmail = process.env.CONTACT_TO_EMAIL || 'josesoutou@gmail.com';
  const senders = [
    process.env.CONTACT_FROM_EMAIL,
    'SOUTO SA Web <onboarding@resend.dev>',
  ].filter((sender, index, all) => sender && all.indexOf(sender) === index);
  const escapedMessage = escapeHtml(fmsg);
  const html = `
    <div style="font-family:Arial,sans-serif; font-size:15px; color:#1A1917;">
      <h2 style="margin:0 0 16px;">Nueva consulta desde soutosa.com.ar</h2>
      <p><strong>Nombre:</strong> ${escapeHtml(fname)}</p>
      <p><strong>Barrio / empresa:</strong> ${escapeHtml(fcompany || '-')}</p>
      <p><strong>Teléfono:</strong> ${escapeHtml(fphone || '-')}</p>
      <p><strong>Email:</strong> ${escapeHtml(femail)}</p>
      <p><strong>Mensaje:</strong><br>${escapedMessage.replace(/\n/g, '<br>')}</p>
    </div>
  `;
  const text = [
    'Nueva consulta desde soutosa.com.ar',
    `Nombre: ${fname}`,
    `Barrio / empresa: ${fcompany || '-'}`,
    `Teléfono: ${fphone || '-'}`,
    `Email: ${femail}`,
    `Mensaje:\n${fmsg}`,
  ].join('\n');

  for (const fromEmail of senders) {
    try {
      const resendRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [toEmail],
          reply_to: femail,
          subject: `Nueva consulta — ${fname}`,
          html,
          text,
        }),
      });

      if (resendRes.ok) {
        return res.status(200).json({ ok: true });
      }

      const errText = await resendRes.text();
      console.error(`[contact] Resend rechazó remitente ${fromEmail}: status=${resendRes.status} ${errText}`);
    } catch (error) {
      console.error(`[contact] Error con remitente ${fromEmail}:`, error);
    }
  }

  return res.status(502).json({ error: 'No se pudo enviar el email' });
};