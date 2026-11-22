import { escapeHtml } from '../utils/sanitize.js';

// Every interpolated visitor value is HTML-escaped: these mails render as HTML in the admin inbox.
export const adminNotificationTemplate = (type: 'lead' | 'contact' | 'newsletter', data: Record<string, unknown>) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px; }
    .header { background: #b01212; color: white; padding: 10px 20px; border-radius: 10px 10px 0 0; }
    .content { padding: 20px; }
    .footer { font-size: 12px; color: #777; margin-top: 20px; border-top: 1px solid #eee; padding-top: 10px; }
    .field { margin-bottom: 10px; }
    .label { font-weight: bold; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>Yeni ${type === 'lead' ? 'Kurs Qeydiyyatı' : type === 'contact' ? 'Əlaqə Mesajı' : 'Newsletter Abunəliyi'}</h2>
    </div>
    <div class="content">
      <p>Vebsaytdan yeni bir müraciət daxil oldu:</p>
      <div class="field"><span class="label">Ad:</span> ${escapeHtml(data.name || 'N/A')}</div>
      <div class="field"><span class="label">Email:</span> ${escapeHtml(data.email)}</div>
      ${data.phone ? `<div class="field"><span class="label">Telefon:</span> ${escapeHtml(data.phone)}</div>` : ''}
      ${data.course ? `<div class="field"><span class="label">Kurs:</span> ${escapeHtml(data.course)}</div>` : ''}
      ${data.subject ? `<div class="field"><span class="label">Mövzu:</span> ${escapeHtml(data.subject)}</div>` : ''}
      ${data.message ? `<div class="field"><span class="label">Mesaj:</span><br/>${escapeHtml(data.message).replace(/\r?\n/g, '<br/>')}</div>` : ''}
    </div>
    <div class="footer">
      Bu email Cahan Academy sistemi tərəfindən avtomatik göndərilib.
    </div>
  </div>
</body>
</html>
`;

export const userThankYouTemplate = (name: string) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px; }
    .header { background: #b01212; color: white; padding: 10px 20px; border-radius: 10px 10px 0 0; }
    .content { padding: 20px; }
    .footer { font-size: 12px; color: #777; margin-top: 20px; border-top: 1px solid #eee; padding-top: 10px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>Təşəkkür edirik!</h2>
    </div>
    <div class="content">
      <p>Salam ${escapeHtml(String(name).slice(0, 60))},</p>
      <p>Müraciətiniz uğurla qeydə alındı. Tezliklə sizinlə əlaqə saxlayacağıq.</p>
      <p>Hörmətlə,<br/>Cahan Academy Komandası</p>
    </div>
    <div class="footer">
      © ${new Date().getFullYear()} Cahan Academy. Bütün hüquqlar qorunur.
    </div>
  </div>
</body>
</html>
`;
