import styles from './MatchDrawLiveHero.module.css';

export default function MatchDrawLiveHero({ leagueName, isLive = false, instagramUrl, ctaLabel = 'Vai al profilo' }) {
    return (
        <section className={styles.liveSection} aria-label="Sorteggio in diretta">
            <div className={styles.content}>
                <p className={styles.eyebrow}>Sezione Live</p>
                <h2 className={styles.title}>Sorteggio in diretta</h2>
                <p className={styles.subtitle}>
                    Il sorteggio dei match viene trasmesso live su Instagram per la community di {leagueName}.
                </p>

                <div className={styles.statusRow}>
                    <span className={`${styles.statusBadge} ${isLive ? styles.isLive : styles.isOffline}`}>
                        {isLive ? 'LIVE' : 'OFFLINE'}
                    </span>
                    <span className={styles.statusText}>
                        {isLive ? 'Siamo in diretta ora.' : 'Diretta non attiva in questo momento.'}
                    </span>
                </div>

                <a
                    href={instagramUrl}
                    className={styles.cta}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={ctaLabel}
                >
                    {ctaLabel}
                </a>
            </div>

            <div className={styles.playerMock} aria-hidden>
                <div className={styles.playerFrame}>
                    <div className={styles.playerTop}>
                        <span>Instagram Live</span>
                        <span>{isLive ? 'ON AIR' : 'Stand-by'}</span>
                    </div>
                    <div className={styles.playerBody}>
                        <span className={styles.playButton}>▶</span>
                    </div>
                </div>
            </div>
        </section>
    );
}

