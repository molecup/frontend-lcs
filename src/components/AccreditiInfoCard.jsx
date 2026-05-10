import Link from 'next/link';
import styles from './AccreditiInfoCard.module.css';

export default function AccreditiInfoCard({ href }) {
  return (
    <section className={styles.card} aria-label="Accrediti Leonessa Cup">
      <div className={styles.header}>
        <p className={styles.eyebrow}>Accrediti</p>
        <h2 className={styles.title}>Leonessa Cup</h2>
        <p className={styles.subtitle}>
          Accrediti settimanali validi solo per il weekend in corso. Apertura il lunedi, chiusura il sabato alle 14:00.
        </p>
      </div>

      <Link className={styles.cta} href={href}>
        Vai agli accrediti
      </Link>
    </section>
  );
}
