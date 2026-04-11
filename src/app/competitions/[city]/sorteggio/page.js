import Link from 'next/link';
import { notFound } from 'next/navigation';
import AnimatedTitle from '@/components/AnimatedTitle';
import EmptyState from '@/components/EmptyState';
import MatchDrawLiveHero from '@/components/MatchDrawLiveHero';
import MatchDrawMatchesList from '@/components/MatchDrawMatchesList';
import { getLeagueBySlug, getLiveDrawStatus, getMatchesByLeagueSlug } from '@/lib/queries';
import { normalizeMatchData } from '@/lib/dataNormalization';
import '../[section]/section.css';
import styles from './sorteggio.module.css';

export const dynamic = 'force-dynamic';

const toMatchesArray = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.results)) return payload.results;
    return [];
};

export async function generateMetadata({ params }) {
    const { city } = await params;
    const slug = city?.toLowerCase?.() ?? '';
    const league = await getLeagueBySlug(slug);

    if (!league) {
        return { title: 'Sorteggio non disponibile' };
    }

    const leagueName = league.name || league.title;

    return {
        title: `${leagueName} - Sorteggio Match`,
        description: `Area dedicata al sorteggio match di ${leagueName}.`
    };
}

export default async function CityMatchDrawPage({ params }) {
    const { city } = await params;
    const slug = city?.toLowerCase?.() ?? '';
    const league = await getLeagueBySlug(slug);

    if (!league) {
        notFound();
    }

    const leagueName = league.name || league.title;
    const backgroundImage = league.background || '/backgroundCities/milano.png';
    const defaultInstagram = league?.socials?.instagram || 'https://www.instagram.com/';

    let matches = [];
    let hasApiError = false;
    let isLive = false;
    let ctaUrl = defaultInstagram;
    let ctaLabel = 'Vai al profilo';

    try {
        const liveData = await getLiveDrawStatus();
        if (liveData && typeof liveData === 'object') {
            isLive = liveData.isLive === true;
            ctaUrl = isLive ? (liveData.url || defaultInstagram) : (liveData.fallback || defaultInstagram);
            ctaLabel = isLive ? 'Guarda la live' : 'Vai al profilo';
        }
    } catch {
        // Manteniamo fallback locale senza alterare la UI.
    }

    try {
        const rawMatches = await getMatchesByLeagueSlug(slug);
        const safeMatches = toMatchesArray(rawMatches);

        if (rawMatches == null) {
            hasApiError = true;
        } else {
            matches = safeMatches.map(normalizeMatchData);
        }
    } catch {
        hasApiError = true;
    }

    return (
        <div className="city-page">
            <div className="banner" style={{ backgroundImage: `url(${backgroundImage})` }}>
                <div className="banner-content">
                    <AnimatedTitle text={`${leagueName}`} />
                </div>
            </div>

            <div className={`city-section ${styles.drawPage}`}>
                <MatchDrawLiveHero
                    leagueName={leagueName}
                    isLive={isLive}
                    instagramUrl={ctaUrl}
                    ctaLabel={ctaLabel}
                />

                {hasApiError ? (
                    <section className={styles.sectionBlock}>
                        <EmptyState
                            title="Match non disponibili"
                            description="Non siamo riusciti a recuperare gli accoppiamenti dal servizio partite. Riprova tra qualche minuto."
                            action={{ label: 'Torna alla citta', href: `/competitions/${slug}` }}
                            align="left"
                        />
                    </section>
                ) : (
                    <MatchDrawMatchesList matches={matches} />
                )}

                <div className={styles.actions}>
                    <Link href={`/competitions/${slug}`} className={styles.backLink}>
                        Torna alla pagina citta
                    </Link>
                </div>
            </div>
        </div>
    );
}
