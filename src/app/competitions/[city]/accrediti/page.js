import { notFound } from 'next/navigation';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { getOrCreateCurrentWeekend, getWeekendWindow, isRegistrationOpen } from '@/lib/accrediti/weekend';
import AccreditiForm from '@/components/accrediti/AccreditiForm';
import styles from './accrediti.module.css';

export const dynamic = 'force-dynamic';

export default async function AccreditiPage({ params }) {
  const { city } = await params;
  const rawKey = city.toLowerCase();
  const key = rawKey === 'leonessa-cup' ? 'leonessacup' : rawKey;
  if (key !== 'leonessacup') notFound();

  const supabase = getSupabaseAdmin();
  const weekend = await getOrCreateCurrentWeekend(supabase);
  const { count, error: countError } = await supabase
    .from('accreditations')
    .select('id', { count: 'exact', head: true })
    .eq('weekend_id', weekend.id);

  if (countError) {
    throw countError;
  }

  const total = count ?? 0;
  const remaining = Math.max(weekend.max_capacity - total, 0);
  const { opensAt, closesAt, weekendKey } = getWeekendWindow();

  const initialStatus = {
    weekendKey,
    isOpen: isRegistrationOpen(),
    opensAt: opensAt.toISOString(),
    closesAt: closesAt.toISOString(),
    maxCapacity: weekend.max_capacity,
    remaining
  };

  return (
    <main className={styles.page}>
      <div className={styles.formArea}>
        <AccreditiForm initialStatus={initialStatus} />
      </div>
    </main>
  );
}
