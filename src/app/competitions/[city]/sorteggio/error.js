'use client';

import styles from './sorteggio.module.css';

export default function Error({ reset }) {
    return (
        <div className="city-page">
            <div className={`city-section ${styles.drawPage}`}>
                <section className={styles.sectionBlock}>
                    <h2 className={styles.errorTitle}>Impossibile caricare il sorteggio</h2>
                    <p className={styles.errorText}>
                        C&apos;e stato un problema nel recupero dei dati. Puoi riprovare subito.
                    </p>
                    <button type="button" className={styles.retryButton} onClick={() => reset()}>
                        Riprova
                    </button>
                </section>
            </div>
        </div>
    );
}

