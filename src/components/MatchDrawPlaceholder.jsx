import styles from './MatchDrawPlaceholder.module.css';

export default function MatchDrawPlaceholder({ cityName }) {
    const slots = [
        { id: 'QF-1', label: 'Slot 1', description: 'In attesa del primo accoppiamento ufficiale.' },
        { id: 'QF-2', label: 'Slot 2', description: 'Definizione squadre in corso da parte dello staff.' },
        { id: 'QF-3', label: 'Slot 3', description: 'Il tabellone verra aggiornato dopo il sorteggio.' },
        { id: 'QF-4', label: 'Slot 4', description: 'Disponibile a breve con data e ora del match.' }
    ];

    return (
        <section className={styles.drawSection} aria-label="Anteprima sorteggio match">
            <header className={styles.header}>
                <p className={styles.eyebrow}>Work in progress</p>
                <h2 className={styles.title}>Tabellone {cityName || 'competizione'}</h2>
                <p className={styles.subtitle}>
                    Questa sezione e pronta per ospitare il sorteggio ufficiale. Per ora trovi una struttura base su cui evolveremo la componente.
                </p>
            </header>

            <div className={styles.grid}>
                {slots.map((slot) => (
                    <article key={slot.id} className={styles.card}>
                        <p className={styles.slotLabel}>{slot.label}</p>
                        <h3>{slot.id}</h3>
                        <p>{slot.description}</p>
                    </article>
                ))}
            </div>
        </section>
    );
}

