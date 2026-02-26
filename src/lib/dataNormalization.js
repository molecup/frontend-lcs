const DEFAULT_LOGO = '/logoCities/lcsw.png';
const MATCH_DURATION = 60;

const normalizeEventType = (type = '') => {
    switch (type.toUpperCase()) {
        case 'GOAL':
            return 'goal';
        case 'YELLOW_CARD':
            return 'yellow';
        case 'RED_CARD':
            return 'red';
        default:
            return type.toLowerCase();
    }
};

const formatScore = (home, away, scoreText) => {
    if (scoreText) return scoreText;
    if (home?.score != null && away?.score != null) return `${home.score} - ${away.score}`;
    return '-';
};

export function findLiveMatch(matches = []) {
    const nowTs = Date.now();
    return matches.find((match) => {
        const start = match?.date ? new Date(match.date).getTime() : null;
        if (!start) return false;
        const diffMin = Math.floor((nowTs - start) / 60000);
        return diffMin >= 0 && diffMin < MATCH_DURATION;
    }) ?? null;
};

const createEventList = (match) => {
    if (Array.isArray(match?.teams) && match.teams.length) {
        const events = match.teams.flatMap((teamEntry) => {
            const teamName = teamEntry.team?.name || '';
            return (teamEntry.events || []).map((event) => {
                const minuteValue = typeof event.minute === 'number' ? event.minute : Number(event.minute);
                return {
                    minute: Number.isFinite(minuteValue) ? minuteValue : null,
                    type: normalizeEventType(event.event_type || 'Evento'),
                    player: event.player || 'Giocatore sconosciuto',
                    team: teamName
                };
            });
        });
        return events.sort((a, b) => (a.minute ?? Infinity) - (b.minute ?? Infinity));
    }

    if (Array.isArray(match?.events)) {
        const events = match.events.map((event) => {
            const minuteValue = typeof event.minute === 'number' ? event.minute : Number(event.minute);
            return {
                minute: Number.isFinite(minuteValue) ? minuteValue : null,
                type: normalizeEventType(event.type || 'Evento'),
                player: event.player || 'Giocatore sconosciuto',
                team: event.team || ''
            };
        });
        return events.sort((a, b) => (a.minute ?? Infinity) - (b.minute ?? Infinity));
    }

    return [];
};

export function normalizeMatchData(match) {
    const entries = Array.isArray(match?.teams) ? match.teams : [];
    const hasStructuredTeams = entries.length > 0;
    const homeEntry = hasStructuredTeams ? (entries.find((team) => team.is_home) || entries[0] || null) : null;
    const awayEntry = hasStructuredTeams ? (entries.find((team) => !team.is_home) || entries[1] || null) : null;

    const fallbackHome = match.home || {};
    const fallbackAway = match.away || {};

    return {
        id: String(match.id),
        date: match.datetime || match.date || null,
        stage: match.stage || match.name || '',
        score: match.score_text || match.score || '-',
        status: match.finished ? 'FINISHED' : match.status || 'SCHEDULED',
        finished: !!match.finished,
        home: {
            name: homeEntry?.team?.name || fallbackHome.name || 'Sconosciuta',
            logo: homeEntry?.team?.logo || fallbackHome.logo || DEFAULT_LOGO
        },
        away: {
            name: awayEntry?.team?.name || fallbackAway.name || 'Sconosciuta',
            logo: awayEntry?.team?.logo || fallbackAway.logo || DEFAULT_LOGO
        },
        events: createEventList(match)
    };
};

const getMatchStartTimestamp = (match) => {
    if (!match?.date) return null;
    const ts = new Date(match.date).getTime();
    return Number.isFinite(ts) ? ts : null;
};

export function formatDate(dateStr) {
    if (!dateStr) return { shortDate: '', time: '' };
    const date = new Date(dateStr);
    return {
        shortDate: date.toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' }),
        time: date.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })
    };
};

const computeLiveState = (match) => {
    if (!match?.date) return { isLive: false, finished: false, minute: null };
    const start = new Date(match.date).getTime();
    const now = Date.now();
    const diffMin = Math.floor((now - start) / 60000);
    const isLive = diffMin >= 0 && diffMin < MATCH_DURATION;
    // const finished = diffMin >= MATCH_DURATION;
    return { isLive, finished: match.finished, minute: isLive ? diffMin : null };
};

export function buildMatchView(match, nowTs) {
    const normalized = normalizeMatchData(match);
    const liveState = computeLiveState(normalized);
    // const status = deriveMatchStatus(normalized, liveState, nowTs);
    const matchStart = getMatchStartTimestamp(normalized);
    const isUpcoming = match.status === 'SCHEDULED' && matchStart !== null && matchStart > nowTs;
    const shouldHideScore = !match.isLive && !match.finished && (matchStart === null || nowTs < matchStart);

    return {
        ...normalized,
        ...liveState,
        status: match.status,
        isUpcoming,
        score: shouldHideScore ? '-' : normalized.score
    };
};