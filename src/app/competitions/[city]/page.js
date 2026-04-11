import Link from 'next/link';
import { notFound } from 'next/navigation';
// import { localleagues } from '@/data/CorrectDataStructure';
import AnimatedTitle from '@/components/AnimatedTitle';
import BlogSlider from '@/components/BlogSlider';
import LocalPartners from '@/components/LocalPartners';
import StadiumMap from '@/components/StadiumMap';
import SocialLinks from '@/components/SocialLinks';
import StaffSection from '@/components/StaffSection';
import MatchDrawCard from '@/components/MatchDrawCard';
// import { getSortedPostsData } from '@/lib/blog';
import styles from './city.module.css';
import {getLeagueBySlug, getNewsByLeagueSlug} from '@/lib/queries';

// const leaguesBySlug = localleagues.reduce((acc, league) => {
//     if (league?.slug) acc[league.slug.toLowerCase()] = league;
//     return acc;
// }, {});

export const dynamicParams = true;

export async function generateStaticParams() {
    const leagues = await getLeagueBySlug();
    if (!leagues || leagues.length === 0) {
        return [];
    }
    return leagues.map(league => ({ city: league.slug }));
    // return Object.keys(leaguesBySlug).map((city) => ({ city }));
}

export async function generateMetadata({ params }) {
    const { city } = await params;
    const key = city.toLowerCase();
    const data = await getLeagueBySlug(key);
    const title = data?.name || data?.title || 'Competitions';
    return { title };
}

export default async function CityPage({ params }) {
    const { city } = await params;
    const key = city.toLowerCase();
    const data = await getLeagueBySlug(key);
    if (!data) notFound();

    const cityBasePath = `/competitions/${key}`;

    const quickLinks = [
        {
            href: `${cityBasePath}/partite`,
            title: 'Partite',
        },
        {
            href: `${cityBasePath}/classifica`,
            title: 'Classifica',
        },
        {
            href: `${cityBasePath}/squadre`,
            title: 'Squadre',
        }
    ];

    const partners = Array.isArray(data.partners) ? data.partners : [];
    const stadiums = Array.isArray(data.stadiums) ? data.stadiums : [];
    const socials = data.socials || {};
    const staff = Array.isArray(data.staff) ? data.staff : [];

    // const blogPosts = getSortedPostsData(city);
    const blogPosts = await getNewsByLeagueSlug(key);
    const hasBlog = blogPosts.length > 0;
    const backgroundImage = data.background || '/backgroundCities/milano.png';

    return (
        <div className={styles.cityPage}>
            <div className={styles.banner} style={{ backgroundImage: `url(${backgroundImage})` }}>
                <div className={styles.bannerContent}>
                    <AnimatedTitle text={data.name || data.title}/>
                </div>
            </div>
            <div className={styles.cityInfo}>
                <section className={styles.quickNav} aria-label="Navigazione rapida">
                    <div className={styles.quickNavGrid}>
                        {quickLinks.map((item) => (
                            <Link key={item.href} href={item.href} className={styles.quickNavCard}>
                                <span className={styles.quickNavTitle}>{item.title}</span>
                            </Link>
                        ))}
                    </div>
                </section>
                <MatchDrawCard
                    href={`${cityBasePath}/sorteggio`}
                    title="Sorteggio Match"
                    description="Accedi alla sezione dedicata al sorteggio e consulta la struttura degli accoppiamenti."
                />
                {/*{hasNews && (*/}
                {/*    <CityScrollNews items={news} durationMs={4000} />*/}
                {/*)}*/}
                {hasBlog && (
                    <BlogSlider items={blogPosts} city={city} durationMs={5000} />
                )}
                <LocalPartners partners={partners} />
                <SocialLinks socials={socials} />
                <StaffSection staff={staff} mode="preview" citySlug={key} />
                {stadiums.length > 0 && (
                    <section className={styles.stadiumSection}>
                        <div className={styles.stadiumHeader}>
                            <p className={styles.stadiumEyebrow}>Dove giochiamo</p>
                            <h2 className={styles.stadiumTitle}>Stadi e indicazioni</h2>
                            <p className={styles.stadiumSubtitle}>
                                Trova lo stadio più vicino e ottieni le indicazioni per raggiungerlo facilmente.
                            </p>
                        </div>
                        <div className={`${styles.stadiumGrid} ${stadiums.length === 1 ? styles.stadiumGridSingle : ''}`}>
                            {stadiums.map((stadium) => (
                                <StadiumMap
                                    key={stadium.id || stadium.name}
                                    name={stadium.name}
                                    address={stadium.address}
                                    latitude={stadium.latitude}
                                    longitude={stadium.longitude}
                                />
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
}
