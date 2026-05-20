const API_URL_BASE = process.env.API_URL_BASE
const REVALIDATE_HOUR = 3600;
const LIVE_SORTEGGIO_URL = 'https://api.m8lapi.tech/live.json';
const GOAL_EVENT_TYPE = 'GOAL';

const isGoalEvent = (event) => {
    const rawType = event?.event_type ?? event?.type ?? '';
    return String(rawType).toUpperCase() === GOAL_EVENT_TYPE;
};

const toSafeText = (value, fallback) => {
    if (typeof value === 'string') return value;
    if (value == null) return fallback;
    return String(value);
};

const toPlayerName = (player) => {
    if (typeof player === 'string') return player.trim() || null;
    if (!player || typeof player !== 'object') return null;

    const fullName = [player.first_name, player.last_name]
        .filter((part) => typeof part === 'string' && part.trim())
        .join(' ')
        .trim();

    if (fullName) return fullName;
    if (typeof player.name === 'string' && player.name.trim()) return player.name.trim();

    return null;
};

const toScorerKey = (player, team) => `${player}__${team}`;

const buildTopScorers = (matches = [], limit = 3) => {
    const scorersMap = new Map();

    matches.forEach((match) => {
        if (Array.isArray(match?.teams) && match.teams.length) {
            match.teams.forEach((teamEntry) => {
                const teamName = toSafeText(teamEntry?.team?.name || teamEntry?.team?.short_name, '');
                (teamEntry?.events || []).forEach((event) => {
                    if (!isGoalEvent(event)) return;
                    const playerName = toPlayerName(event?.player);
                    if (!playerName) return;
                    const key = toScorerKey(playerName, teamName);
                    const current = scorersMap.get(key) || { player: playerName, team: teamName, goals: 0 };
                    current.goals += 1;
                    scorersMap.set(key, current);
                });
            });
            return;
        }

        if (Array.isArray(match?.events)) {
            match.events.forEach((event) => {
                if (!isGoalEvent(event)) return;
                const playerName = toPlayerName(event?.player);
                if (!playerName) return;
                const teamName = toSafeText(event?.team, '');
                const key = toScorerKey(playerName, teamName);
                const current = scorersMap.get(key) || { player: playerName, team: teamName, goals: 0 };
                current.goals += 1;
                scorersMap.set(key, current);
            });
        }
    });

    return Array.from(scorersMap.values())
        .sort((a, b) => (b.goals - a.goals) || a.player.localeCompare(b.player) || a.team.localeCompare(b.team))
        .slice(0, Math.max(0, limit));
};
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

export async function getTopScorersByLeagueSlug(leagueSlug, limit = 3) {
    if (!leagueSlug) return [];
    const matches = await getMatchesByLeagueSlug(leagueSlug);
    if (!Array.isArray(matches)) return [];
    return buildTopScorers(matches, limit);
}

export async function getTopScorersByLeague(limit = 3) {
    const leagues = await getLeagueBySlug();
    if (!Array.isArray(leagues) || leagues.length === 0) return [];

    const results = await Promise.all(
        leagues.map(async (league) => {
            const slug = league?.slug;
            if (!slug) return null;
            const scorers = await getTopScorersByLeagueSlug(slug, limit);
            return {
                league: {
                    slug,
                    name: league?.name || league?.title || slug
                },
                scorers
            };
        })
    );

    return results.filter(Boolean);
}
