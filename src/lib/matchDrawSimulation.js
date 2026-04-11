const DEFAULT_TEAMS_COUNT = 22;
const DEFAULT_MATCHES_PER_TEAM = 3;
const DEFAULT_STAGE_LABELS = ['Girone 1', 'Girone 2', 'Girone 3'];

const DEFAULT_TEAM_NAMES = Array.from({ length: DEFAULT_TEAMS_COUNT }, (_, index) => `Squadra ${String(index + 1).padStart(2, '0')}`);

const getLeagueTeams = (league) => {
    const teams = Array.isArray(league?.teams) ? league.teams : [];
    return teams
        .map((team, index) => team?.name || team?.short_name || team?.title || `Squadra ${index + 1}`)
        .filter(Boolean);
};

const ensureTeamPool = (league, totalTeams = DEFAULT_TEAMS_COUNT) => {
    const sourceTeams = getLeagueTeams(league);
    const mergedTeams = [...sourceTeams];

    for (let index = mergedTeams.length; index < totalTeams; index += 1) {
        mergedTeams.push(DEFAULT_TEAM_NAMES[index] || `Squadra ${index + 1}`);
    }

    return mergedTeams.slice(0, totalTeams);
};

const rotateRoundRobin = (teams) => {
    if (teams.length < 2) return [teams];

    const rotated = [...teams];
    const fixed = rotated.shift();
    const rounds = [];

    for (let roundIndex = 0; roundIndex < DEFAULT_MATCHES_PER_TEAM; roundIndex += 1) {
        rounds.push([fixed, ...rotated]);

        const last = rotated.pop();
        if (last !== undefined) {
            rotated.unshift(last);
        }
    }

    return rounds;
};

export function simulateMatchDraw(league, { totalTeams = DEFAULT_TEAMS_COUNT, matchesPerTeam = DEFAULT_MATCHES_PER_TEAM } = {}) {
    const teamNames = ensureTeamPool(league, totalTeams);
    const rounds = rotateRoundRobin(teamNames);
    const baseTime = new Date();
    baseTime.setHours(18, 0, 0, 0);

    const matches = [];
    let matchCounter = 1;

    rounds.slice(0, matchesPerTeam).forEach((roundTeams, roundIndex) => {
        const pairs = [];
        for (let index = 0; index < roundTeams.length / 2; index += 1) {
            const home = roundTeams[index];
            const away = roundTeams[roundTeams.length - 1 - index];
            pairs.push([home, away]);
        }

        pairs.forEach(([home, away], matchIndex) => {
            const scheduledTime = new Date(baseTime.getTime() + ((roundIndex * 11) + matchIndex) * 30 * 60000);
            matches.push({
                id: `sim-${String(matchCounter).padStart(2, '0')}`,
                datetime: scheduledTime.toISOString(),
                date: scheduledTime.toISOString(),
                stage: DEFAULT_STAGE_LABELS[roundIndex] || `Girone ${roundIndex + 1}`,
                home: { name: home },
                away: { name: away },
                score_text: '-',
                finished: false,
                status: 'SCHEDULED'
            });
            matchCounter += 1;
        });
    });

    return matches;
}

export function isValidSimulatedDraw(matches = []) {
    if (!Array.isArray(matches) || matches.length !== 33) {
        return false;
    }

    const teamCounters = new Map();
    matches.forEach((match) => {
        const home = match?.home?.name;
        const away = match?.away?.name;
        if (home) teamCounters.set(home, (teamCounters.get(home) || 0) + 1);
        if (away) teamCounters.set(away, (teamCounters.get(away) || 0) + 1);
    });

    return teamCounters.size === 22 && Array.from(teamCounters.values()).every((count) => count === 3);
}

