import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { eslMatches } from '@/data/eslData';
import LiveMatchTimeline from '@/components/LiveMatchTimeline';
import styles from '../../competitions/[city]/partite/[matchId]/match.module.css';
import { getMatchById } from '@/lib/queries';
import { normalizeMatchData, buildMatchView, formatDate } from '@/lib/dataNormalization';


export async function generateStaticParams() {
    return (eslMatches || []).map((match) => ({ matchId: String(match.id) }));
}

export async function generateMetadata({ params }) {
    const resolvedParams = await params;
    const { matchId } = resolvedParams;
    const match = await getMatchById(matchId);
    if (!match) {
        return { title: 'Partita non trovata' };
    }
    const normalized = normalizeMatchData(match);
    const home = normalized.home?.name || 'Sconosciuta';
    const away = normalized.away?.name || 'Sconosciuta';
    return {
        title: `${home} vs ${away} — LCS Match Center`,
        description: `Dettaglio partita ${home} vs ${away} (${normalized.stage || 'Torneo'})`
    };
}

export default async function MatchDetailPage({ params }) {
    const resolvedParams = await params;
    const { matchId } = resolvedParams;

    const rawMatch = await getMatchById(matchId);
    if (!rawMatch) notFound();

    const nowTs = Date.now();
    const match = buildMatchView(rawMatch, nowTs);
    const { shortDate, time } = formatDate(match.date);
    console.log(rawMatch, match);
    const viewTimeline = match.isLive || match.finished;

    return (
        <div className={styles['match-detail-page']}>
            <div className={styles['match-detail-header']}>
                <Link className={styles['back-link']} href="/Partite">
                    &larr; Torna alle partite
                </Link>
                <h1>LCS Match Center</h1>
                <p className={styles['match-meta']}>
                    <span>{shortDate}</span>
                    {time && <span>• {time}</span>}
                    {match.stage && <span>• {match.stage}</span>}
                </p>
            </div>

            <section className={styles['match-detail-card']}>
                <div className={styles['team-block']}>
                    <div className={styles['team-logo']}>
                        {match.home?.logo && (
                            <Image src={match.home.logo} alt={match.home?.name || 'Squadra casa'} fill sizes="120px" style={{ objectFit: 'contain' }} />
                        )}
                    </div>
                    <p className={styles['team-name']}>{match.home?.name || 'TBD'}</p>
                </div>
                <div className={styles['score-section']}>
                    <p className={styles['score']}>{match.score || '-'}</p>
                    <p className={styles['status']}>
                        {match.isLive && match.minute !== null && `${match.minute}' LIVE`}
                        {!match.isLive && match.finished && 'FT'}
                        {!match.isLive && !match.finished && (match.status || 'SCHEDULED')}
                    </p>
                </div>
                <div className={styles['team-block']}>
                    <div className={styles['team-logo']}>
                        {match.away?.logo && (
                            <Image src={match.away.logo} alt={match.away?.name || 'Squadra ospite'} fill sizes="120px" style={{ objectFit: 'contain' }} />
                        )}
                    </div>
                    <p className={styles['team-name']}>{match.away?.name || 'TBD'}</p>
                </div>
            </section>

            {Array.isArray(match.events) && match.events.length > 0 && (
                <section className={styles['events-section']}>
                    <h2>Eventi</h2>
                    <ul>
                        {match.events.map((event, idx) => (
                            <li key={`${event.minute}-${idx}`}>
                                <span className={styles['minute']}>{event.minute}&rsquo;</span>
                                <span className={styles['type']}>{event.type}</span>
                                <span className={styles['player']}>{event.player}</span>
                                {event.team && <span className={styles['team']}>({event.team})</span>}
                            </li>
                        ))}
                    </ul>
                </section>
            )}

            {viewTimeline && (
                <section className={styles['timeline-section']}>
                    <h2>Andamento Live</h2>
                    <LiveMatchTimeline match={match} />
                </section>
            )}
        </div>
    );
}

