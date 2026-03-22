import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
// import { localleagues, matches } from '@/data/CorrectDataStructure';
import { eslMatches } from '@/data/eslData';
import LiveMatchTimeline from '@/components/LiveMatchTimeline';
import styles from './match.module.css';
import { getLeagueBySlug, getMatchesByLeagueSlug, getMatchById } from '@/lib/queries';
import { normalizeMatchData, formatDate, buildMatchView } from '@/lib/dataNormalization';

const MATCH_CENTER_SLUG = 'partite';
const MATCH_CENTER_LEAGUE = { slug: MATCH_CENTER_SLUG, title: 'LCS Match Center', name: 'Match Center Nazionale' };

// const allLeagues = [...localleagues, MATCH_CENTER_LEAGUE];

// const leaguesBySlug = allLeagues.reduce((acc, league) => {
//     acc[league.slug.toLowerCase()] = league;
//     return acc;
// }, {});

// const matchesByLeague = matches.reduce((acc, match) => {
//     const slugs = new Set(
//         (match?.teams || [])
//             .map(({ team }) => team?.local_league?.toLowerCase?.())
//             .filter(Boolean)
//     );
//     slugs.forEach((slug) => {
//         if (!acc[slug]) acc[slug] = [];
//         acc[slug].push(match);
//     });
//     return acc;
// }, {});

// matchesByLeague[MATCH_CENTER_SLUG] = eslMatches || [];

// // const getMatchesForLeague = (slug) => matchesByLeague[slug?.toLowerCase?.()] || [];
// const getMatchesForLeague = async (slug) => { return await getMatchesByLeagueSlug(slug) }

// const findMatchForLeague = async (slug, matchId) => {
//     const leagueMatches = await getMatchesForLeague(slug);
//     return leagueMatches.find((match) => String(match.id) === String(matchId));
// };



export async function generateStaticParams() {
    const localleagues = await getLeagueBySlug();
    const leagueParams = localleagues.flatMap(async (league) =>
        (await getMatchesByLeagueSlug(league.slug)).map((match) => ({ city: league.slug, matchId: String(match.id) }))
    );
    const matchCenterParams = (eslMatches || []).map((match) => ({ city: MATCH_CENTER_SLUG, matchId: String(match.id) }));
    return [...leagueParams, ...matchCenterParams];
}

export async function generateMetadata({ params }) {
    const resolvedParams = await params;
    const { city, matchId } = resolvedParams;
    const key = city?.toLowerCase?.();
    const league = await getLeagueBySlug(key);
    const match = league ? await getMatchById(matchId) : null;
    if (!league || !match) {
        return { title: 'Partita non trovata' };
    }
    const normalized = normalizeMatchData(match);
    const home = normalized.home?.name || 'Sconosciuta';
    const away = normalized.away?.name || 'Sconosciuta';
    return {
        title: `${home} vs ${away} — ${league.title}`,
        description: `Dettaglio partita ${home} vs ${away} (${normalized.stage || 'Torneo'})`
    };
}

export default async function MatchDetailPage({ params }) {
    const resolvedParams = await params;
    const { city, matchId } = resolvedParams;
    const key = city?.toLowerCase?.();
    const league = await getLeagueBySlug(key);
    if (!league) notFound();

    const rawMatch = await getMatchById(matchId);
    if (!rawMatch) notFound();

    const nowTs = Date.now();
    const match = buildMatchView(rawMatch, nowTs);
    const { shortDate, time } = formatDate(match.date);
    const viewTimeline = match.isLive || match.finished;
    const backHref = city === MATCH_CENTER_SLUG ? `/partite` : `/competitions/${city}/partite`;

    return (
        <div className={styles['match-detail-page']}>
            <div className={styles['match-detail-header']}>
                <Link className={styles['back-link']} href={backHref}>
                    &larr; Torna alle partite
                </Link>
                <h1>{league.title}</h1>
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

            {viewTimeline  && (
                <section className={styles['timeline-section']}>
                    <h2>Andamento Live</h2>
                    <LiveMatchTimeline match={match} />
                </section>
            )}
        </div>
    );
}
