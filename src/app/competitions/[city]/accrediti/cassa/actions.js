'use server';

import { cookies } from 'next/headers';
import { clearStaffCookie, setStaffCookie, validateStaffCredentials } from '@/lib/accrediti/auth';

export async function loginStaff(prevState, formData) {
  const username = String(formData.get('username') ?? '').trim();
  const password = String(formData.get('password') ?? '');

  if (!validateStaffCredentials({ username, password })) {
    return { error: 'Credenziali non valide.' };
  }

  const cookieStore = cookies();
  setStaffCookie(cookieStore);
  return { error: null };
}

export async function logoutStaff() {
  const cookieStore = cookies();
  clearStaffCookie(cookieStore);
}

