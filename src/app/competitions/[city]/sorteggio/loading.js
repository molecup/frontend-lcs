import styles from './sorteggio.module.css';

export default function LoadingSorteggioPage() {
    return (
        <div className="city-page">
            <div className={`city-section ${styles.drawPage}`}>
                <section className={`${styles.sectionBlock} ${styles.skeletonBlock}`} aria-hidden>
                    <div className={styles.skeletonTitle} />
                    <div className={styles.skeletonLine} />
                    <div className={styles.skeletonLineShort} />
                </section>

                <section className={`${styles.sectionBlock} ${styles.skeletonBlock}`} aria-hidden>
                    <div className={styles.skeletonTitle} />
                    <div className={styles.skeletonGrid}>
                        <div className={styles.skeletonCard} />
                        <div className={styles.skeletonCard} />
                        <div className={styles.skeletonCard} />
                    </div>
                </section>
            </div>
        </div>
    );
}

