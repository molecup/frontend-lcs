const API_URL_BASE = process.env.API_URL_BASE
const REVALIDATE_HOUR = 3600;
const LIVE_SORTEGGIO_URL = 'https://api.m8lapi.tech/live.json';
/*
    * Helper functions to fetch data from the API
    * Each function corresponds to a specific endpoint and handles the response
    * Caching can be implemented here if needed in the future
    * Error handling is included to log issues without breaking the app
    * if no param is provided, it will fetch all items of that type (e.g., all leagues, all matches)
*/

export async function getLeagueBySlug(slug = null) {
    const slugComponent = slug? `${slug}/` : '';
    const response = await fetch(`${API_URL_BASE}/local-leagues/${slugComponent}`, {next: { revalidate: REVALIDATE_HOUR }});
    if (!response.ok) {
        console.warn(`Failed to fetch league: ${response.status}`);
        return null;
    }
    return await response.json();
}

export async function getMatchesByLeagueSlug(leagueSlug = null) {
    const filter = leagueSlug ? "?local-league=" + leagueSlug : "";
    console.log(filter);
    const response = await fetch(`${API_URL_BASE}/matches/${filter}`, {next: { revalidate: REVALIDATE_HOUR/10 }});
    if (!response.ok) {
        console.warn(`Failed to fetch matches: ${response.status}`);
        return null;
    }
    return await response.json();
}

export async function getMatchById(matchId = null) {
    const slugComponent = matchId ? `${matchId}/` : '';
    const response = await fetch(`${API_URL_BASE}/matches/${slugComponent}`, {next: { revalidate: REVALIDATE_HOUR/10 }});
    if (!response.ok) {
        console.warn(`Failed to fetch match: ${response.status}`);
        return null;
    }   
    return await response.json();
}

export async function getTeamBySlug(teamSlug = null) {
    const slugComponent = teamSlug ? `${teamSlug}/` : '';
    const response = await fetch(`${API_URL_BASE}/teams/${slugComponent}`, {next: { revalidate: REVALIDATE_HOUR }});
    if (!response.ok) {
        console.warn(`Failed to fetch team: ${response.status}`);
        return null;
    }
    return await response.json();
}

export async function getNewsBySlug(slug = null) {
    const slugComponent = slug ? `${slug}/` : '';
    const response = await fetch(`${API_URL_BASE}/news/${slugComponent}`, {next: { revalidate: REVALIDATE_HOUR/10 }});
    if (!response.ok) {
        console.warn(`Failed to fetch news: ${response.status}`);
        return null;
    }
    return await response.json();
}

export async function getNewsByLeagueSlug(leagueSlug = null) {
    const filter = leagueSlug ? "?local-league=" + leagueSlug : "";
    const response = await fetch(`${API_URL_BASE}/news/${filter}`, {next: { revalidate: REVALIDATE_HOUR/10 }});
    if (!response.ok) {
        console.warn(`Failed to fetch news by league: ${response.status}`);
        return null;
    }
    return await response.json();
}

export async function getLiveDrawStatus() {
    const response = await fetch(LIVE_SORTEGGIO_URL, { cache: 'no-store' });
    if (!response.ok) {
        console.warn(`Failed to fetch live draw status: ${response.status}`);
        return null;
    }
    return await response.json();
}

