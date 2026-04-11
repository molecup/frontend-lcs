import Link from 'next/link';
import styles from './MatchDrawCard.module.css';

export default function MatchDrawCard({
    href,
    title = 'Sorteggio Match',
    description = 'Scopri accoppiamenti e percorso della fase a eliminazione.'
}) {
    return (
        <section className={styles.wrapper} aria-label="Accesso rapido sorteggio match">
            <Link href={href} className={styles.card}>
                <span className={styles.badge}>Prioritario</span>
                <h2 className={styles.title}>{title}</h2>
                <p className={styles.description}>{description}</p>
                <span className={styles.cta}>Vai al sorteggio</span>
            </Link>
        </section>
    );
}

