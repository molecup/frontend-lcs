import { MetadataRoute } from 'next';
import { getLeagueBySlug, getMatchesByLeagueSlug, getNewsByLeagueSlug } from '@/lib/queries';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://legacalciostudenti.com';

  // 1. Pagine statiche
  const staticPages: MetadataRoute.Sitemap = [
    '',
    '/competitions',
    '/Partite',
    '/Squadre',
    '/team',
    '/contatti',
    '/privacy',
    '/terms',
    '/Classifica',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'daily' : 'weekly',
    priority: route === '' ? 1 : 0.8,
  }));

  // 2. Pagine dinamiche: Leghe/Città
  const leagues = await getLeagueBySlug();
  const leaguePages: MetadataRoute.Sitemap = [];
  
  if (Array.isArray(leagues)) {
    for (const league of leagues) {
      const citySlug = league.slug;
      if (!citySlug) continue;

      const cityBase = `/competitions/${citySlug}`;
      
      leaguePages.push(
        {
          url: `${baseUrl}${cityBase}`,
          lastModified: new Date(),
          changeFrequency: 'weekly',
          priority: 0.7,
        },
        {
          url: `${baseUrl}${cityBase}/partite`,
          lastModified: new Date(),
          changeFrequency: 'daily',
          priority: 0.6,
        },
        {
          url: `${baseUrl}${cityBase}/squadre`,
          lastModified: new Date(),
          changeFrequency: 'weekly',
          priority: 0.6,
        },
        {
          url: `${baseUrl}${cityBase}/blog`,
          lastModified: new Date(),
          changeFrequency: 'weekly',
          priority: 0.5,
        }
      );

      // 2a. Post del blog per città
      const news = await getNewsByLeagueSlug(citySlug);
      if (Array.isArray(news)) {
        for (const post of news) {
          if (post.slug) {
            leaguePages.push({
              url: `${baseUrl}${cityBase}/blog/${post.slug}`,
              lastModified: new Date(post.updated_at || post.created_at || new Date()),
              changeFrequency: 'monthly',
              priority: 0.4,
            });
          }
        }
      }
    }
  }

  // 3. Pagine dinamiche: Dettaglio Match
  // Nota: Recuperiamo tutti i match per avere gli ID.
  const allMatches = await getMatchesByLeagueSlug();
  const matchPages: MetadataRoute.Sitemap = (allMatches || []).map((match: any) => ({
    url: `${baseUrl}/Partite/${match.id}`,
    lastModified: new Date(),
    changeFrequency: 'hourly', // I match possono cambiare spesso se live
    priority: 0.5,
  }));

  return [...staticPages, ...leaguePages, ...matchPages];
}
