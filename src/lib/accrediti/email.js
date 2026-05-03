import { Resend } from 'resend';

const getResendClient = () => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  return new Resend(apiKey);
};

const buildEmailHtml = ({ fullName, weekendLabel, qrDataUrl }) => `
  <div style="font-family: Arial, sans-serif; color: #0f172a;">
    <h1 style="margin-bottom: 8px;">Accredito confermato - Leonessa Cup</h1>
    <p>Ciao <strong>${fullName}</strong>, il tuo accredito per il weekend ${weekendLabel} è confermato.</p>
    <p>Mostra questo QR code in cassa per l'ingresso di sabato e domenica.</p>
    <div style="margin: 24px 0; text-align: center;">
      <img src="${qrDataUrl}" alt="QR Code accredito" style="width: 240px; height: 240px;" />
    </div>
    <p style="font-size: 14px; color: #475569;">Contatti: accrediti@lcsleague.it</p>
  </div>
`;

export const sendAccreditationEmail = async ({ to, fullName, weekendLabel, qrDataUrl }) => {
  const resend = getResendClient();
  if (!resend) return { sent: false, skipped: true };

  await resend.emails.send({
    from: process.env.RESEND_FROM ?? 'LCS Accrediti <accrediti@lcsleague.it>',
    to,
    subject: 'Leonessa Cup - Accredito confermato',
    html: buildEmailHtml({ fullName, weekendLabel, qrDataUrl })
  });

  return { sent: true };
};

