// /api/contact — serverless function (Vercel Node runtime).
//
// Recibe el formulario de contacto de la landing y envía un email real
// usando la API de Resend (https://resend.com). La API key vive únicamente
// en la variable de entorno RESEND_API_KEY (configurada en el panel de
// Vercel), nunca en el código ni en el navegador del usuario.
//
// Variables de entorno necesarias:
//   RESEND_API_KEY     (obligatoria) — API key secreta de Resend.
//   CONTACT_TO_EMAIL   (opcional)    — a quién llegan las consultas.
//                                      Default: josesoutou@gmail.com
//   CONTACT_FROM_EMAIL (opcional)    — remitente verificado en Resend.
//                                      Default: onboarding@resend.dev
//                                      (remitente de pruebas de Resend;
//                                      para producción conviene verificar
//                                      el dominio soutosa.com.ar en Resend
//                                      y usar algo como
//                                      "SOUTO SA <web@soutosa.com.ar>").

function escapeHtml(str = '') {
  return String(str).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
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
  const honeypot = (body.fwebsite || '').toString().trim();

  // Anti-spam: si el campo honeypot (oculto para personas) viene completo,
  // respondemos OK sin enviar nada, para no darle feedback a los bots.
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
    console.error('Falta RESEND_API_KEY en las variables de entorno.');
    return res.status(500).json({ error: 'Configuración de servidor incompleta' });
  }

  const toEmail = process.env.CONTACT_TO_EMAIL || 'josesoutou@gmail.com';
  const fromEmail = process.env.CONTACT_FROM_EMAIL || 'SOUTO SA Web <onboarding@resend.dev>';

  const html = `
    <div style="font-family:Arial,sans-serif; font-size:15px; color:#1A1917;">
      <h2 style="margin:0 0 16px;">Nueva consulta desde soutosa.com.ar</h2>
      <p><strong>Nombre:</strong> ${escapeHtml(fname)}</p>
      <p><strong>Barrio / empresa:</strong> ${escapeHtml(fcompany || '-')}</p>
      <p><strong>Teléfono:</strong> ${escapeHtml(fphone || '-')}</p>
      <p><strong>Email:</strong> ${escapeHtml(femail)}</p>
      <p><strong>Mensaje:</strong><br>${escapeHtml(fmsg).replace(/\n/g, '<br>')}</p>
    </div>
  `;

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
      }),
    });

    if (!resendRes.ok) {
      const errText = await resendRes.text();
      console.error('Resend error:', resendRes.status, errText);
      return res.status(502).json({ error: 'No se pudo enviar el email' });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Error enviando email:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};
