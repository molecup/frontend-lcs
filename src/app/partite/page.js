import AnimatedTitle from '@/components/AnimatedTitle';
import MatchesSlider from '@/components/MatchesSlider';
import LiveMatchTimeline from '@/components/LiveMatchTimeline';
import { eslMatches } from '@/data/eslData';
import '../competitions/[city]/[section]/section.css';
import './partite.css';
import { getMatchById } from '@/lib/queries';
import { normalizeMatchData, findLiveMatch } from '@/lib/dataNormalization';

const DEFAULT_CITY_SLUG = 'esl';
const MATCH_CENTER_TITLE = 'LCS Match Center';
const MATCH_CENTER_TAGLINE = 'Il recap nazionale con i migliori highlights ESL.';

export const metadata = {
    title: 'LCS Partite',
    description: 'Match center nazionale ESL con risultati live, timeline e highlight delle migliori scuole.'
};

export default async function PartitePage() {
    const matches = [];
    console.log(matches);
    // const matches = (await getMatchById()).map(normalizeMatchData);
    const liveMatch = findLiveMatch(matches);
    const bannerTitle = `${MATCH_CENTER_TITLE} · ${MATCH_CENTER_TAGLINE}`;

    return (
        <div className="city-page">
            <div className="city-section city-partite pdt">
                <div className="match-center-header">
                    <AnimatedTitle text={bannerTitle} />
                    <p className="match-center-tagline">{MATCH_CENTER_TAGLINE}</p>
                    <p className="match-center-subcopy">
                        Risultati aggiornati, cronache live e roster ufficiali in un unico hub nazionale ESL.
                    </p>
                </div>
                <MatchesSlider matches={matches} citySlug={DEFAULT_CITY_SLUG} />
                {liveMatch && <LiveMatchTimeline match={liveMatch} />}
            </div>
        </div>
    );
}
