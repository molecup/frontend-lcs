import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import fs from 'fs';
import path from 'path';

const formatDateRange = (weekendLabel) => weekendLabel ?? '';

const dataUrlToBytes = (dataUrl) => {
  if (!dataUrl) return null;
  const match = dataUrl.match(/^data:image\/(png|jpeg);base64,(.+)$/);
  if (!match) return null;
  const base64 = match[2];
  return Buffer.from(base64, 'base64');
};

const loadLogoBytes = () => {
  try {
    const logoPath = path.join(process.cwd(), 'public', 'logoCities', 'leonessacup.png');
    return fs.readFileSync(logoPath);
  } catch (error) {
    return null;
  }
};

export const buildTicketPdf = async ({ fullName, weekendLabel, qrDataUrl, ticketCode }) => {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([420, 595]);
  const { width, height } = page.getSize();

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const lightColor = rgb(0.94, 0.96, 0.98);
  const darkColor = rgb(0.06, 0.09, 0.16);

  page.drawRectangle({ x: 0, y: 0, width, height, color: lightColor });
  page.drawRectangle({ x: 0, y: height - 120, width, height: 120, color: darkColor });

  const logoBytes = loadLogoBytes();
  if (logoBytes) {
    const logo = await pdfDoc.embedPng(logoBytes);
    const logoWidth = 70;
    const logoHeight = (logo.height / logo.width) * logoWidth;
    page.drawImage(logo, {
      x: 24,
      y: height - 100,
      width: logoWidth,
      height: logoHeight
    });
  }

  page.drawText('Leonessa Cup', {
    x: 110,
    y: height - 70,
    size: 20,
    font: boldFont,
    color: rgb(1, 1, 1)
  });
  page.drawText('Ticket accredito', {
    x: 110,
    y: height - 92,
    size: 12,
    font,
    color: rgb(0.86, 0.9, 0.95)
  });

  const infoStartY = height - 150;
  page.drawText('Intestatario', { x: 32, y: infoStartY, size: 10, font, color: rgb(0.4, 0.45, 0.52) });
  page.drawText(fullName, { x: 32, y: infoStartY - 16, size: 14, font: boldFont, color: darkColor });

  page.drawText('Weekend', { x: 32, y: infoStartY - 48, size: 10, font, color: rgb(0.4, 0.45, 0.52) });
  page.drawText(formatDateRange(weekendLabel), { x: 32, y: infoStartY - 64, size: 13, font: boldFont, color: darkColor });

  page.drawText('Codice', { x: 32, y: infoStartY - 96, size: 10, font, color: rgb(0.4, 0.45, 0.52) });
  page.drawText(ticketCode, { x: 32, y: infoStartY - 112, size: 11, font, color: darkColor });

  const qrBytes = dataUrlToBytes(qrDataUrl);
  if (qrBytes) {
    const qrImage = qrDataUrl.includes('image/jpeg')
      ? await pdfDoc.embedJpg(qrBytes)
      : await pdfDoc.embedPng(qrBytes);
    const qrSize = 190;
    page.drawImage(qrImage, {
      x: width - qrSize - 32,
      y: height - 360,
      width: qrSize,
      height: qrSize
    });
  }

  page.drawRectangle({
    x: 24,
    y: 32,
    width: width - 48,
    height: 64,
    color: rgb(1, 1, 1)
  });
  page.drawText('Mostra questo ticket in cassa. Il PDF e il QR sono la prova ufficiale di accredito.', {
    x: 40,
    y: 60,
    size: 10,
    font,
    color: rgb(0.35, 0.35, 0.35)
  });

  return pdfDoc.save();
};
