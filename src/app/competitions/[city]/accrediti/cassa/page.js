import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { getOrCreateCurrentWeekend, getWeekendStats } from '@/lib/accrediti/weekend';
import { isStaffAuthenticated } from '@/lib/accrediti/auth';
import StaffLoginForm from '@/components/accrediti/StaffLoginForm';
import StaffScanner from '@/components/accrediti/StaffScanner';
import { logoutStaff } from './actions';
import styles from './staff.module.css';

export const dynamic = 'force-dynamic';

export default async function AccreditiCassaPage({ params }) {
  const { city } = await params;
  const rawKey = city.toLowerCase();
  const key = rawKey === 'leonessa-cup' ? 'leonessacup' : rawKey;
  if (key !== 'leonessacup') notFound();

  const cookieStore = await cookies();
  const authenticated = isStaffAuthenticated(cookieStore);

  if (!authenticated) {
    return (
      <main className={styles.page}>
        <StaffLoginForm />
      </main>
    );
  }

  const supabase = getSupabaseAdmin();
  const weekend = await getOrCreateCurrentWeekend(supabase);
  const stats = await getWeekendStats(supabase, weekend.id);

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1>Cassa accrediti</h1>
          <p>Weekend {weekend.key}</p>
        </div>
        <form action={logoutStaff}>
          <button className={styles.logout} type="submit">Esci</button>
        </form>
      </header>

      <section className={styles.stats}>
        <div>
          <span>Accrediti totali</span>
          <strong>{stats.total}</strong>
        </div>
        <div>
          <span>Ingressi sabato</span>
          <strong>{stats.saturday}</strong>
        </div>
        <div>
          <span>Ingressi domenica</span>
          <strong>{stats.sunday}</strong>
        </div>
        <div>
          <span>Non presentati</span>
          <strong>{stats.noShow}</strong>
        </div>
      </section>

      <StaffScanner />
    </main>
  );
}
