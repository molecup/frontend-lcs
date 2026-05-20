import dynamic from "next/dynamic";
import img from "../../public/eslHome/DSCF6614-Migliorato-NR.webp";
import Image from "next/image";
import Link from "next/link";
import { FutbolIcon, TrophyIcon, StarIcon, MapPinIcon, CalendarIcon, PeopleGroupIcon } from "@/components/Icons";
import HeroWithBackground from "@/components/HeroWithBackground";
import styles from "@/app/competitions/competitions.module.css";
import { getLeagueBySlug, getMatchesByLeagueSlug } from "@/lib/queries";
import Counter from "@/components/Counter";

const SectionReveal = dynamic(() => import("@/components/SectionReveal"), {
    ssr: true,
});

const formatHighlights = [
    {
        title: "Gironi dinamici",
        description: "Ogni città struttura i propri gironi in base alle scuole iscritte con aggiornamenti weekly."
    },
    {
        title: "Knockout Day",
        description: "Le migliori squadre accedono a semifinali e finale secca in giornata dedicata."
    },
    {
        title: "Cronache live",
        description: "Timeline e score vengono aggiornati in tempo reale per match live e programmati."
    }
];

const homeStandings = [
    { name: "Lunardi", record: "3-0", pts: 9, gd: "+12" },
    { name: "Barozzi", record: "3-0", pts: 9, gd: "+7" },
    { name: "Leonardo", record: "3-0", pts: 9, gd: "+6" },
    { name: "Aselli", record: "3-0", pts: 9, gd: "+4" },
    { name: "Cattaneo", record: "3-0", pts: 9, gd: "+4" },
    { name: "Luzzago", record: "3-0", pts: 8, gd: "+19" },
    { name: "Curie Levi", record: "3-0", pts: 8, gd: "+15" },
    { name: "Galfer", record: "3-0", pts: 8, gd: "+7" },
    { name: "Calvesi Baracca", record: "3-0", pts: 8, gd: "+7" },
    { name: "Valsalice", record: "3-0", pts: 8, gd: "+5" },
    { name: "Brera", record: "3-0", pts: 8, gd: "+5" },
    { name: "Santanna", record: "3-0", pts: 8, gd: "+4" },
    { name: "Corni", record: "3-0", pts: 8, gd: "+4" },
    { name: "Alfieri", record: "3-0", pts: 8, gd: "+2" }
];

const toArray = (value) => (Array.isArray(value) ? value : []);
const resolveLeagueSlug = (league) => {
    const raw = league?.slug;
    return typeof raw === "string" && raw.trim() ? raw.trim().toLowerCase() : null;
};
const parseDate = (value) => {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
};

const isLiveMatch = (match) => {
    if (!match || match.finished) return false;
    const dt = parseDate(match.datetime);
    if (!dt) return false;
    return dt <= new Date();
};

const isScheduledMatch = (match) => {
    if (!match || match.finished) return false;
    const dt = parseDate(match.datetime);
    if (!dt) return false;
    return dt > new Date();
};

export default async function Page() {
    const leagues = toArray(await getLeagueBySlug());
    const matches = toArray(await getMatchesByLeagueSlug());

    const totals = leagues.reduce(
        (acc, league) => {
            const teams = toArray(league.teams);
            return {
                schools: acc.schools + teams.length,
                matches: acc.matches,
                liveMatches: acc.liveMatches,
                upcoming: acc.upcoming
            };
        },
        { schools: 0, matches: 0, liveMatches: 0, upcoming: 0 }
    );

    totals.matches = matches.length;
    totals.liveMatches = matches.filter(isLiveMatch).length;
    totals.upcoming = matches.filter(isScheduledMatch).length;

    const heroStats = [
        { label: "Citta attive", value: leagues.length, hint: "stagione in corso" },
        { label: "Scuole iscritte", value: totals.schools, hint: "team approvati" },
        { label: "Match programmati", value: totals.matches, hint: "calendario ufficiale" },
        {
            label: "Live ora",
            value: totals.liveMatches,
            hint: totals.upcoming ? `${totals.upcoming} in arrivo` : "nessuno in programma"
        }
    ];

    const featuredLeagues = leagues
        .map((league, index) => ({
            league,
            index,
            schoolsCount: toArray(league.teams).length
        }))
        .sort((a, b) => b.schoolsCount - a.schoolsCount || a.index - b.index)
        .slice(0, 6)
        .map((entry) => entry.league);

    return (
        <div className={"homeESL"}>
            <HeroWithBackground text="lega calcio studenti" />

            <div className={"contentHome"}>
                <SectionReveal title="" align="right">
                    <div className="bg-blob bg-blob--1"></div>
                    <div className={"div-content"}>
                        <div className={"div-content-text"}>
                            <h2>Chi siamo</h2>
                            <p>Lega Calcio Studenti (LCS) è una lega studentesca nata con l&#39;obiettivo di valorizzare lo sport nel contesto scolastico, incentivando i licei a supportare i propri atleti e proponendo ai partecipanti nuove opportunita accademiche e didattiche.</p>
                            <Link href="/competitions" className="btn-cta">Scopri di piu</Link>
                        </div>
                        <figure className="div-image parallax" data-speed="0.2">
                            <Image
                                src={img}
                                alt="Mole Cup"
                                fill
                                loading="lazy"
                                quality={1}
                                sizes="(max-width: 900px) 100vw, 520px"
                                style={{ objectFit: "cover" }}
                            />
                        </figure>
                    </div>
                </SectionReveal>

                <SectionReveal title="Il format LCS" align="center">
                    <div className="bg-blob bg-blob--2"></div>
                    <div className={styles.stats}>
                        {heroStats.map((stat) => (
                            <article key={stat.label} className={styles.statCard}>
                                <span className={styles.statValue}>
                                    <Counter value={stat.value} />
                                </span>
                                <span>{stat.label}</span>
                                <small>{stat.hint}</small>
                            </article>
                        ))}
                    </div>

                    <ul className={"timeline"}>
                        <li>
                            <div className={"desc"}>
                                <h4>{formatHighlights[0].title}</h4>
                                <p>{formatHighlights[0].description}</p>
                            </div>
                            <div className={"imgCircle"}>
                                <div className={"circle"}>
                                    <span style={{ display: "inline-flex", transform: "scale(1.2)" }}>
                                        <FutbolIcon />
                                    </span>
                                </div>
                            </div>
                            <div className={"desc"}></div>
                        </li>
                        <li className={"linea"}></li>
                        <li>
                            <div className={"desc"}></div>
                            <div className={"imgCircle"}>
                                <div className={"circle"}><TrophyIcon /></div>
                            </div>
                            <div className={"desc desc-right"}>
                                <h4>{formatHighlights[1].title}</h4>
                                <p>{formatHighlights[1].description}</p>
                            </div>
                        </li>
                        <li className={"linea"}></li>
                        <li>
                            <div className={"desc"}>
                                <h4>{formatHighlights[2].title}</h4>
                                <p>{formatHighlights[2].description}</p>
                            </div>
                            <div className={"imgCircle"}>
                                <div className={"circle"}><StarIcon /></div>
                            </div>
                            <div className={"desc"}></div>
                        </li>
                    </ul>
                </SectionReveal>

                <SectionReveal title="Classifica generale" align="center">
                    <div className={styles.homeStandings}>
                        <header className={styles.homeStandingsHeader}>
                            <p className={styles.eyebrow}>Classifica</p>
                            <h2>Top squadre del momento</h2>
                            <p>Graduatoria aggiornata con i risultati piu recenti.</p>
                        </header>
                        <div className={styles.homeStandingsCard}>
                            <div className={styles.homeStandingsTable} role="table">
                                <div className={`${styles.homeStandingsRow} ${styles.homeStandingsRowHead}`} role="row">
                                    <div className={styles.homeStandingsColPos} role="columnheader">#</div>
                                    <div className={styles.homeStandingsColTeam} role="columnheader">Squadra</div>
                                    <div className={styles.homeStandingsCol} role="columnheader">Record</div>
                                    <div className={styles.homeStandingsCol} role="columnheader">Pt</div>
                                    <div className={styles.homeStandingsCol} role="columnheader">DR</div>
                                </div>
                                {homeStandings.map((team, idx) => (
                                    <div
                                        key={`${team.name}-${idx}`}
                                        className={`${styles.homeStandingsRow} ${styles.homeStandingsRowBody} ${idx < 3 ? styles.homeStandingsRowTop : ""}`}
                                        role="row"
                                    >
                                        <div className={styles.homeStandingsColPos} role="cell">
                                            <span className={`${styles.homeStandingsBadge} ${idx === 0 ? styles.homeStandingsBadgeGold : idx === 1 ? styles.homeStandingsBadgeSilver : idx === 2 ? styles.homeStandingsBadgeBronze : ""}`}>
                                                {idx + 1}
                                            </span>
                                        </div>
                                        <div className={styles.homeStandingsColTeam} role="cell">{team.name}</div>
                                        <div className={styles.homeStandingsCol} role="cell">{team.record}</div>
                                        <div className={styles.homeStandingsCol} role="cell">{team.pts}</div>
                                        <div className={styles.homeStandingsCol} role="cell">{team.gd}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </SectionReveal>

                <SectionReveal title="" align="left">
                    <div className="bg-blob bg-blob--1" style={{ bottom: '0', top: 'auto' }}></div>

                    <div className={styles.citySection} style={{ marginTop: "24px" }}>
                        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                            <p className={styles.eyebrow}>Sedi ufficiali</p>
                            <h2 style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontFamily: 'var(--font)' }}>Le competizioni in evidenza</h2>
                            <p className={styles.subtitle} style={{ maxWidth: '800px', margin: '10px auto' }}>
                                Esplora i tornei attivi nelle principali città italiane. Segui la tua squadra, guarda i risultati in tempo reale e scopri i prossimi incontri.
                            </p>
                        </div>

                        <div className={styles.cityGridFeatured}>
                            {featuredLeagues.map((league) => {
                                const leagueSlug = resolveLeagueSlug(league);
                                const teams = toArray(league.teams);
                                const leagueMatches = matches.filter((m) =>
                                    toArray(m.teams).some((tm) => tm?.team?.local_league?.toLowerCase?.() === leagueSlug)
                                );
                                const liveNow = leagueMatches.filter(isLiveMatch).length;
                                const scheduled = leagueMatches.filter(isScheduledMatch).length;
                                const total = leagueMatches.length;

                                const cardContent = (
                                    <>
                                        <div className={styles.cardHeader}>
                                            <h3>{league.title || league.name}</h3>
                                            <span className={styles.chip}>
                                                <PeopleGroupIcon className={styles.metaIcon} style={{ width: '14px', height: '14px', marginRight: '6px' }} />
                                                {teams.length ? `${teams.length} scuole` : "In arrivo"}
                                            </span>
                                        </div>

                                        <div className={styles.cityMeta}>
                                            {liveNow > 0 && (
                                                <div className={styles.metaItem}>
                                                    <span className={styles.livePulse}></span>
                                                    <span style={{ color: '#ff4b4b', fontWeight: 'bold' }}>{liveNow} MATCH LIVE ORA</span>
                                                </div>
                                            )}
                                            
                                            <div className={styles.metaItem}>
                                                <span className={styles.metaIcon}><FutbolIcon /></span>
                                                <span>{total > 0 ? `${total} match totali` : "Calendario in allestimento"}</span>
                                            </div>

                                            <div className={styles.metaItem}>
                                                <span className={styles.metaIcon}><CalendarIcon /></span>
                                                <span>{scheduled > 0 ? `${scheduled} match in programma` : "Nessun match imminente"}</span>
                                            </div>
                                            
                                            <div className={styles.metaItem}>
                                                <span className={styles.metaIcon}><MapPinIcon /></span>
                                                <span>Sede: {league.title || league.name}</span>
                                            </div>
                                        </div>

                                        <div className={styles.cardFooter}>
                                            <span className={`${styles.cityLink} ${leagueSlug ? '' : styles.cityLinkDisabled}`}>
                                                {leagueSlug ? 'Esplora citta' : 'Citta non disponibile'}
                                            </span>
                                        </div>
                                    </>
                                );

                                if (leagueSlug) {
                                    return (
                                        <Link
                                            key={leagueSlug ?? league.id}
                                            className={styles.cityCardLink}
                                            href={`/competitions/${encodeURIComponent(leagueSlug)}`}
                                            aria-label={`Esplora citta ${league.title || league.name}`}
                                        >
                                            <article className={styles.cityCard}>
                                                {cardContent}
                                            </article>
                                        </Link>
                                    );
                                }

                                return (
                                    <article key={league.id} className={`${styles.cityCard} ${styles.cityCardDisabled}`}>
                                        {cardContent}
                                    </article>
                                );
                            })}
                        </div>

                        {/*<div style={{ display: 'flex', justifyContent: 'center', marginTop: '40px' }}>*/}
                        {/*    <Link href="/competitions" className="btn-cta">*/}
                        {/*        Vai a tutte le competizioni*/}
                        {/*    </Link>*/}
                        {/*</div>*/}
                    </div>
                </SectionReveal>

                {/*<TestimonialsReveal />*/}
            </div>
        </div>
    );
}
