import crypto from 'crypto';

const COOKIE_NAME = 'lcs_staff';

const getStaffSecret = () => {
  const user = process.env.STAFF_USER ?? '';
  const pass = process.env.STAFF_PASSWORD ?? '';
  return `${user}:${pass}`;
};

const hashSecret = (secret) =>
  crypto.createHash('sha256').update(secret).digest('hex');

export const getStaffCookieValue = () => hashSecret(getStaffSecret());

export const isStaffAuthenticated = (cookieStore) => {
  const expected = getStaffCookieValue();
  const cookie = cookieStore.get(COOKIE_NAME)?.value;
  return Boolean(cookie) && cookie === expected;
};

export const setStaffCookie = (cookieStore) => {
  cookieStore.set(COOKIE_NAME, getStaffCookieValue(), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/'
  });
};

export const clearStaffCookie = (cookieStore) => {
  cookieStore.set(COOKIE_NAME, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0
  });
};

export const validateStaffCredentials = ({ username, password }) => {
  if (!process.env.STAFF_USER || !process.env.STAFF_PASSWORD) return false;
  return username === process.env.STAFF_USER && password === process.env.STAFF_PASSWORD;
};

