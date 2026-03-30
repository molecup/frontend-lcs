export const revalidate = 3600; // 1 hour
// javascript
import { notFound, redirect } from 'next/navigation';
// import { localleagues, matches as allMatches } from '@/data/CorrectDataStructure';
import AnimatedTitle from '@/components/AnimatedTitle';
import TeamsRoster from '@/components/TeamsRoster';
import AnimatedSectionTitle from '@/components/AnimatedSectionTitle';
import Standings from '@/components/Standings';
import NewsSection from '@/components/NewsSection';
import StaffSection from '@/components/StaffSection';
import "./section.css";
import { getLeagueBySlug, getMatchesByLeagueSlug } from '@/lib/queries';
import {normalizeMatchData} from '@/lib/dataNormalization';

const DEFAULT_LOGO = '/logoCities/lcsw.png';
const toArray = (value) => (Array.isArray(value) ? value : []);

// const cityBackgrounds = {
//     boracup: '/backgroundCities/boracup.jpg',
//     ferreacup: '/backgroundCities/ferreacup.jpg',
//     leonessacup: '/backgroundCities/leonessacup.jpg',
//     milano: '/backgroundCities/milano.png',
//     molecup: '/backgroundCities/molecup.jpg',
//     olympiuscup: '/backgroundCities/olympiuscup.jpg',
//     turascup: '/backgroundCities/turascup.jpg',
// };

// const getBackgroundForCity = (slug) => cityBackgrounds[slug?.toLowerCase()] || '/backgroundCities/milano.png';

// const leaguesBySlug = localleagues.reduce((acc, league) => {
//     if (league?.slug) acc[league.slug.toLowerCase()] = league;
//     return acc;
// }, {});

const rawMatchesCache = new Map();
const getRawMatchesForLeague = async (slug) => {
    const key = slug?.toLowerCase?.() ?? slug;
    if (rawMatchesCache.has(key)) return rawMatchesCache.get(key);

    const matches = toArray(await getMatchesByLeagueSlug(key));
    // const filtered = toArray(matches)
        // .filter((match) =>
        //     toArray(match.teams).some(
        //         (teamMatch) => (teamMatch?.team?.local_league ?? '').toLowerCase() === key
        //     )
        // );

    rawMatchesCache.set(key, matches);
    return matches;
};


const mapTeamsForRoster = (league) =>
    toArray(league?.teams).map((team, index) => ({
        id: team.slug || team.id || `team-${index}`,
        name: team.name || team.short_name || `Team ${index + 1}`,
        logo: team.logo || DEFAULT_LOGO,
        city: league.name || league.title,
        coach: team.coach || 'Coach da definire',
        founded: team.founded,
        colors: team.colors,
        record: team.record,
        achievements: team.achievements,
        contact: team.contact
    }));

const buildGroupsForLeague = (league) => {
    const teams = mapTeamsForRoster(league);
    if (!teams.length) return [];
    return [
        {
            name: league.title ? `${league.title} — Girone Unico` : 'Girone Unico',
            teams: teams.map((team) => ({
                id: team.id,
                name: team.name,
                logo: team.logo,
                p: team.p ?? 0,
                w: team.w ?? 0,
                d: team.d ?? 0,
                l: team.l ?? 0,
                gf: team.gf ?? 0,
                ga: team.ga ?? 0,
                gd: team.gd ?? 0,
                pts: team.pts ?? 0
            }))
        }
    ];
};

const leagueSections = (league, matches) => {
    const sections = new Set(['home']);
    if (mapTeamsForRoster(league).length) sections.add('squadre');
    if (buildGroupsForLeague(league).length) sections.add('classifica');
    if (toArray(league.news).length) sections.add('notizie');
    if (toArray(league.staff).length) sections.add('staff');
    return sections;
};

export async function generateStaticParams() {
    const localLeagues = await getLeagueBySlug();
    return localLeagues.flatMap((league) => {
        const slug = league.slug?.toLowerCase();
        if (!slug) return [];
        return Array.from(leagueSections(league, [])).map((section) => ({ city: slug, section }));
    });
}

export async function generateMetadata({ params }) {
    const { city, section } = await params;
    // const league = leaguesBySlug[city.toLowerCase()];
    const league = await getLeagueBySlug(city.toLowerCase());
    const sectionKey = section?.toLowerCase?.() ?? '';
    const baseTitle = league?.name || league?.title || 'Competitions';
    const title = sectionKey === 'home' || !sectionKey
        ? baseTitle
        : `${baseTitle} — ${sectionKey.charAt(0).toUpperCase()}${sectionKey.slice(1)}`;
    return { title };
}

export default async function SectionPage({ params }) {
    const { city, section } = await params;
    const slug = city.toLowerCase();
    const league = await getLeagueBySlug(slug);
    if (!league) notFound();
    const rawMatches = await getRawMatchesForLeague(slug);
    const matches = rawMatches.map(normalizeMatchData);

    const sectionKey = section?.toLowerCase?.() ?? '';
    const availableSections = leagueSections(league, matches);
    if (!availableSections.has(sectionKey)) notFound();

    if (sectionKey === 'home') {
        return redirect(`/competitions/${city}`);
    }

    const teams = mapTeamsForRoster(league);
    const groups = buildGroupsForLeague(league);
    const news = toArray(league.news);
    const staff = toArray(league.staff);

    const sectionContent = {
        squadre: teams.length ? <TeamsRoster teams={teams} citySlug={slug} /> : null,
        classifica: groups.length ? <Standings groups={groups} matches={rawMatches} citySlug={slug} /> : null,
        notizie: news.length ? (
            <>
                <AnimatedSectionTitle className="CityTitleInfo">Notizie</AnimatedSectionTitle>
                <p className="news-intro">Ultimi aggiornamenti, comunicati e curiosità dal torneo.</p>
                <NewsSection news={news} />
            </>
        ) : null,
        staff: staff.length ? <StaffSection staff={staff} mode="full" citySlug={slug} /> : null
    }[sectionKey];

    if (!sectionContent) {
        return notFound();
    }

    const sectionContainerClass = `city-section city-${sectionKey}`;
    const backgroundImage = league.background || "/backgroundCities/milano.png";

    return (
        <div className="city-page">
            <div className="banner" style={{ backgroundImage: `url(${backgroundImage})` }}>
                <div className="banner-content">
                    <AnimatedTitle text={league.name || league.title} />
                </div>
            </div>
            <div className={sectionContainerClass}>
                {sectionContent}
            </div>
        </div>
    );
}





