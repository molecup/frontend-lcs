"use client";

import { useMemo, useState } from 'react';
import EmptyState from './EmptyState';
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

const getUniqueTeams = (matches) => {
    const teams = new Set();

    matches.forEach((match) => {
        if (match?.home?.name) teams.add(match.home.name);
        if (match?.away?.name) teams.add(match.away.name);
    });

    return Array.from(teams).sort((a, b) => a.localeCompare(b, 'it'));
};

export default function MatchDrawMatchesList({ matches = [] }) {
    const [selectedTeam, setSelectedTeam] = useState('all');

    const orderedMatches = useMemo(() => {
        if (!Array.isArray(matches)) return [];

        return [...matches].sort((a, b) => {
            const aTs = a?.date ? new Date(a.date).getTime() : Number.POSITIVE_INFINITY;
            const bTs = b?.date ? new Date(b.date).getTime() : Number.POSITIVE_INFINITY;
            return aTs - bTs;
        });
    }, [matches]);

    const teamOptions = useMemo(() => getUniqueTeams(orderedMatches), [orderedMatches]);

    const filteredMatches = useMemo(() => {
        if (selectedTeam === 'all') return orderedMatches;
        return orderedMatches.filter((match) => match?.home?.name === selectedTeam || match?.away?.name === selectedTeam);
    }, [orderedMatches, selectedTeam]);

    const teamCounters = useMemo(() => getTeamCounters(orderedMatches), [orderedMatches]);
    const totalTeams = teamCounters.size;
    const invalidTeams = Array.from(teamCounters.entries()).filter(([, count]) => count !== 3);

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
                <div className={styles.toolbar}>
                    <label className={styles.filterLabel} htmlFor="match-team-filter">
                        Filtra squadra
                    </label>
                    <select
                        id="match-team-filter"
                        className={styles.filterSelect}
                        value={selectedTeam}
                        onChange={(event) => setSelectedTeam(event.target.value)}
                    >
                        <option value="all">Tutte le squadre</option>
                        {teamOptions.map((team) => (
                            <option key={team} value={team}>
                                {team}
                            </option>
                        ))}
                    </select>
                </div>
            </header>

            <div className={styles.list}>
                {filteredMatches.map((match, index) => {
                    const key = match.id || `${match.home?.name}-${match.away?.name}-${index}`;

                    return (
                        <article key={key} className={styles.card}>
                            <div className={styles.teamsColumn}>
                                <strong>{match.home?.name || 'Squadra A'}</strong>
                                <span className={styles.vs}>vs</span>
                                <strong>{match.away?.name || 'Squadra B'}</strong>
                            </div>

                        </article>
                    );
                })}

                {filteredMatches.length === 0 && (
                    <EmptyState
                        title="Nessun match per la squadra selezionata"
                        description="Prova a scegliere un'altra squadra o torna alla vista completa."
                        align="left"
                    />
                )}
            </div>
        </section>
    );
}

