export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { email, frequency, subscribedAt, source, webhookUrl } = req.body || {};

  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return res.status(400).json({ success: false, error: 'Por favor ingresa un correo electrónico válido.' });
  }

  const defaultWebhook = 'https://script.google.com/macros/s/AKfycbyAp_IwzOCSC2ANFgRDIegbQlsqa_t-VUGP6URVGzbZZ5wK6BjPwJpwRl8IRZrfTMF9/exec';
  const targetUrl = webhookUrl && typeof webhookUrl === 'string' && webhookUrl.startsWith('http') 
    ? webhookUrl 
    : defaultWebhook;

  try {
    const params = new URLSearchParams();
    params.append('email', email.trim().toLowerCase());
    params.append('frequency', frequency || 'semanal');
    params.append('subscribedAt', subscribedAt || new Date().toISOString().split('T')[0]);
    params.append('source', source || 'Sidebar - Blog Pizarra & Criterio');

    const googleResponse = await fetch(targetUrl, {
      method: 'POST',
      body: params,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
      },
      redirect: 'follow'
    });

    const responseText = await googleResponse.text();

    return res.status(200).json({
      success: true,
      googleStatus: googleResponse.status,
      message: 'Suscripción sincronizada con tu Google Sheet correctamente.',
      details: responseText
    });
  } catch (error: any) {
    console.error('Error forwarding subscriber to Google Sheets:', error);
    return res.status(502).json({
      success: false,
      error: error?.message || 'Error al conectar con la hoja de cálculo de Google Sheets'
    });
  }
}
