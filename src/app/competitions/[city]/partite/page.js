export const dynamic = 'force-dynamic';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import AnimatedTitle from '@/components/AnimatedTitle';
import MatchesSlider from '@/components/MatchesSlider';
import LiveMatchTimeline from '@/components/LiveMatchTimeline';
import { getLeagueBySlug, getMatchesByLeagueSlug } from '@/lib/queries';
import { normalizeMatchData, findLiveMatch } from '@/lib/dataNormalization';
import '../[section]/section.css';
import styles from './partite.module.css';
import Image from 'next/image';

const toArray = (value) => {
    if (Array.isArray(value)) return value;
    if (Array.isArray(value?.results)) return value.results;
    return [];
};

const findLatestPlayedMatch = (matches) => {
    const now = Date.now();
    return [...toArray(matches)]
        .filter((match) => {
            const startTs = match?.date ? new Date(match.date).getTime() : NaN;
            return Number.isFinite(startTs) && startTs <= now;
        })
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0] || null;
};

export async function generateMetadata({ params }) {
    const { city } = await params;
    const key = city?.toLowerCase?.() ?? '';
    const league = await getLeagueBySlug(key);

    if (!league) {
        return { title: 'Partite non disponibili' };
    }

    return {
        title: `${league.title || league.name}`,
        description: `Calendario e risultati per ${league.title || league.name}.`
    };
}

export default async function CityMatchesPage({ params }) {
    const { city } = await params;
    const slug = city?.toLowerCase?.() ?? '';
    const league = await getLeagueBySlug(slug);

    if (!league) {
        notFound();
    }

    const matches = toArray(await getMatchesByLeagueSlug(slug)).map(normalizeMatchData);
    const liveMatch = findLiveMatch(matches);
    const latestPlayedMatch = findLatestPlayedMatch(matches);
    const timelineMatch = liveMatch || latestPlayedMatch;
    const hasMatches = matches.length > 0;
    const backgroundImage = league.background || '/backgroundCities/milano.png';

    return (
        <div className="city-page">
            <div className="banner">
                <Image
                    src={backgroundImage}
                    alt={`${league.name || league.title} background`}
                    fill
                    className="banner-image"
                    priority
                    sizes="100vw"
                />
                <div className="banner-content">
                    <AnimatedTitle text={`${league.name || league.title}`} />
                </div>
            </div>

            <div className="city-section city-partite">
                {hasMatches ? (
                    <>
                        <div className={styles.sectionHeader}>
                            <h2>Calendario e risultati</h2>
                            <p>Segui tutte le sfide della competizione, con aggiornamenti live e dettagli partita.</p>
                        </div>
                        <MatchesSlider matches={matches} citySlug={slug} />
                        {timelineMatch && (
                            <>
                                {!liveMatch && (
                                    <div className={styles.lastMatchLabel}>Andamento ultima partita disputata</div>
                                )}
                                <LiveMatchTimeline match={timelineMatch} />
                            </>
                        )}
                    </>
                ) : (
                    <section className={styles.emptyWrap}>
                        <div className={styles.emptyHeader}>
                            <h2>Partite in definizione</h2>
                            <p>Stiamo preparando il calendario ufficiale. Intanto puoi vedere il format previsto della giornata.</p>
                        </div>

                        <div className={styles.placeholderGrid}>
                            <article className={styles.placeholderCard}>
                                <p className={styles.badge}>Slot 1</p>
                                <h3>Match di apertura</h3>
                                <p>Ore e squadre ancora da confermare.</p>
                            </article>
                            <article className={styles.placeholderCard}>
                                <p className={styles.badge}>Slot 2</p>
                                <h3>Big match serale</h3>
                                <p>Accoppiamenti in fase di definizione.</p>
                            </article>
                            <article className={styles.placeholderCard}>
                                <p className={styles.badge}>Slot 3</p>
                                <h3>Match conclusivo</h3>
                                <p>Dettagli disponibili a breve sul calendario.</p>
                            </article>
                        </div>

                        <div className={styles.actions}>
                            <Link href={`/competitions/${slug}`} className={styles.backLink}>
                                Torna alla pagina citta
                            </Link>
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
}
