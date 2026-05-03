import crypto from 'crypto';
import QRCode from 'qrcode';

export const createToken = () => crypto.randomUUID();

export const hashToken = (token) =>
  crypto.createHash('sha256').update(token).digest('hex');

export const buildQrPayload = ({ token }) => token;

export const parseQrPayload = (payload) => {
  if (typeof payload !== 'string') return null;
  const trimmed = payload.trim();
  if (!trimmed) return null;
  return { token: trimmed };
};

export const generateQrDataUrl = async (payload) => {
  return QRCode.toDataURL(payload, { width: 320, margin: 2 });
};
