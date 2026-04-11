import EmptyState from './EmptyState';
import { formatDate } from '@/lib/dataNormalization';
import styles from './MatchDrawMatchesList.module.css';

const getTeamCounters = (matches) => {
    const counters = new Map();

    matches.forEach((match) => {
        const home = match?.home?.name;
        const away = match?.away?.name;

        if (home) counters.set(home, (counters.get(home) || 0) + 1);
        if (away) counters.set(away, (counters.get(away) || 0) + 1);
    });

    return counters;
};

export default function MatchDrawMatchesList({ matches = [] }) {
    if (!Array.isArray(matches) || matches.length === 0) {
        return (
            <section className={styles.section}>
                <EmptyState
                    title="Nessun match estratto"
                    description="Gli accoppiamenti compariranno qui appena disponibili."
                    align="left"
                />
            </section>
        );
    }

    const orderedMatches = [...matches].sort((a, b) => {
        const aTs = a?.date ? new Date(a.date).getTime() : Number.POSITIVE_INFINITY;
        const bTs = b?.date ? new Date(b.date).getTime() : Number.POSITIVE_INFINITY;
        return aTs - bTs;
    });

    const teamCounters = getTeamCounters(orderedMatches);
    const totalTeams = teamCounters.size;
    const invalidTeams = Array.from(teamCounters.entries()).filter(([, count]) => count !== 3);

    return (
        <section className={styles.section} aria-label="Match generati">
            <header className={styles.header}>
                <p className={styles.eyebrow}>Match Generati</p>
                <h2 className={styles.title}>Accoppiamenti dal servizio partite</h2>
                <p className={styles.subtitle}>
                    Totale squadre: {totalTeams}. Vincolo previsto: 3 match per squadra.
                </p>
                <p className={styles.validation}>
                    {invalidTeams.length === 0
                        ? 'Distribuzione corretta: tutte le squadre hanno 3 match.'
                        : `${invalidTeams.length} squadre non rispettano ancora il vincolo dei 3 match.`}
                </p>
            </header>

            <div className={styles.list}>
                {orderedMatches.map((match, index) => {
                    const dateData = formatDate(match.date);
                    const key = match.id || `${match.home?.name}-${match.away?.name}-${index}`;

                    return (
                        <article key={key} className={styles.card}>
                            <div className={styles.meta}>
                                <span>{dateData.shortDate || 'Data da definire'}</span>
                                <span>{dateData.time || 'Orario da definire'}</span>
                            </div>

                            <div className={styles.teamsRow}>
                                <strong>{match.home?.name || 'Squadra A'}</strong>
                                <span className={styles.vs}>vs</span>
                                <strong>{match.away?.name || 'Squadra B'}</strong>
                            </div>

                            {match.stage && <p className={styles.stage}>{match.stage}</p>}
                        </article>
                    );
                })}
            </div>
        </section>
    );
}

