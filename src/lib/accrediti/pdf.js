import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

const formatDateRange = (weekendLabel) => weekendLabel ?? '';

const dataUrlToBytes = (dataUrl) => {
  if (!dataUrl) return null;
  const match = dataUrl.match(/^data:image\/(png|jpeg);base64,(.+)$/);
  if (!match) return null;
  const base64 = match[2];
  return Buffer.from(base64, 'base64');
};

export const buildTicketPdf = async ({ fullName, weekendLabel, qrDataUrl, ticketCode }) => {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([420, 595]);
  const { width, height } = page.getSize();

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const title = 'Leonessa Cup - Accredito';
  page.drawText(title, {
    x: 32,
    y: height - 48,
    size: 18,
    font: boldFont,
    color: rgb(0.06, 0.09, 0.16)
  });

  const lines = [
    `Nome: ${fullName}`,
    `Weekend: ${formatDateRange(weekendLabel)}`,
    `Codice: ${ticketCode}`
  ];

  let cursorY = height - 80;
  lines.forEach((line) => {
    page.drawText(line, { x: 32, y: cursorY, size: 12, font, color: rgb(0.15, 0.17, 0.2) });
    cursorY -= 18;
  });

  const qrBytes = dataUrlToBytes(qrDataUrl);
  if (qrBytes) {
    const qrImage = qrDataUrl.includes('image/jpeg')
      ? await pdfDoc.embedJpg(qrBytes)
      : await pdfDoc.embedPng(qrBytes);
    const qrSize = 180;
    page.drawImage(qrImage, {
      x: (width - qrSize) / 2,
      y: height - 320,
      width: qrSize,
      height: qrSize
    });
  }

  page.drawText('Il PDF e il QR sono la prova ufficiale di accredito.', {
    x: 32,
    y: 40,
    size: 10,
    font,
    color: rgb(0.35, 0.35, 0.35)
  });

  return pdfDoc.save();
};

