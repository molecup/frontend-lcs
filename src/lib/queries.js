const API_URL_BASE = process.env.API_URL_BASE

export async function getLeagueBySlug(slug = null) {
    const slugComponent = slug? `${slug}/` : '';
    const response = await fetch(`${API_URL_BASE}/local-leagues/${slugComponent}`);
    if (!response.ok) {
        console.warn(`Failed to fetch league: ${response.status}`);
        return null;
    }
    return await response.json();
}

export async function getMatchesByLeagueSlug(leagueSlug = null) {
    const filter = leagueSlug ? "?local-league=" + leagueSlug : "";
    const response = await fetch(`${API_URL_BASE}/matches/${filter}`);
    if (!response.ok) {
        console.warn(`Failed to fetch matches: ${response.status}`);
        return null;
    }
    return await response.json();
} 

export async function getMatchById(matchId = null) {
    const slugComponent = matchId ? `${matchId}/` : '';
    const response = await fetch(`${API_URL_BASE}/matches/${slugComponent}`);
    if (!response.ok) {
        console.warn(`Failed to fetch match: ${response.status}`);
        return null;
    }   
    return await response.json();
}

export async function getTeamBySlug(teamSlug = null) {
    const slugComponent = teamSlug ? `${teamSlug}/` : '';
    const response = await fetch(`${API_URL_BASE}/teams/${slugComponent}`);
    if (!response.ok) {
        console.warn(`Failed to fetch team: ${response.status}`);
        return null;
    }
    return await response.json();
}