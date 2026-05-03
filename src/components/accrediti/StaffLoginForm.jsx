'use client';

import { useActionState } from 'react';
import { loginStaff } from '@/app/competitions/[city]/accrediti/cassa/actions';
import styles from './StaffLoginForm.module.css';

const initialState = { error: null };

export default function StaffLoginForm() {
  const [state, formAction] = useActionState(loginStaff, initialState);

  return (
    <form className={styles.form} action={formAction}>
      <h2>Accesso staff</h2>
      <label>
        Username
        <input name="username" type="text" autoComplete="username" required />
      </label>
      <label>
        Password
        <input name="password" type="password" autoComplete="current-password" required />
      </label>
      {state?.error && <p className={styles.error}>{state.error}</p>}
      <button type="submit">Entra</button>
    </form>
  );
}
