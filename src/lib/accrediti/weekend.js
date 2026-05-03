const ROME_TZ = 'Europe/Rome';
const WEEKDAY_INDEX = { Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 7 };

const getParts = (date = new Date()) => {
  const formatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: ROME_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    weekday: 'short',
    hour12: false
  });

  const parts = formatter.formatToParts(date).reduce((acc, part) => {
    acc[part.type] = part.value;
    return acc;
  }, {});

  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour: Number(parts.hour),
    minute: Number(parts.minute),
    second: Number(parts.second),
    weekday: parts.weekday
  };
};

const makeDate = (parts, time = {}) => {
  const hour = time.hour ?? parts.hour ?? 0;
  const minute = time.minute ?? parts.minute ?? 0;
  const second = time.second ?? parts.second ?? 0;
  return new Date(Date.UTC(parts.year, parts.month - 1, parts.day, hour, minute, second));
};

const addDays = (date, days) => new Date(date.getTime() + days * 86400000);

const formatKey = (date) => {
  const yyyy = date.getUTCFullYear();
  const mm = String(date.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(date.getUTCDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

export const getWeekendWindow = () => {
  const nowParts = getParts();
  const now = makeDate(nowParts);
  const weekdayIndex = WEEKDAY_INDEX[nowParts.weekday];

  let saturday = now;
  if (weekdayIndex === 7) {
    saturday = addDays(now, -1);
  } else if (weekdayIndex !== 6) {
    const daysUntilSaturday = (6 - weekdayIndex + 7) % 7;
    saturday = addDays(now, daysUntilSaturday);
  }

  const sunday = addDays(saturday, 1);
  const startDate = makeDate({
    year: saturday.getUTCFullYear(),
    month: saturday.getUTCMonth() + 1,
    day: saturday.getUTCDate()
  }, { hour: 0, minute: 0, second: 0 });

  const endDate = makeDate({
    year: sunday.getUTCFullYear(),
    month: sunday.getUTCMonth() + 1,
    day: sunday.getUTCDate()
  }, { hour: 23, minute: 59, second: 59 });

  const monday = addDays(saturday, -5);
  const opensAt = makeDate({
    year: monday.getUTCFullYear(),
    month: monday.getUTCMonth() + 1,
    day: monday.getUTCDate()
  }, { hour: 0, minute: 0, second: 0 });

  const closesAt = makeDate({
    year: saturday.getUTCFullYear(),
    month: saturday.getUTCMonth() + 1,
    day: saturday.getUTCDate()
  }, { hour: 14, minute: 0, second: 0 });

  return {
    now,
    startDate,
    endDate,
    opensAt,
    closesAt,
    weekendKey: formatKey(startDate)
  };
};

export const isRegistrationOpen = () => {
  const { now, opensAt, closesAt } = getWeekendWindow();
  return now >= opensAt && now <= closesAt;
};

export const isWithinWeekend = () => {
  const { now, startDate, endDate } = getWeekendWindow();
  return now >= startDate && now <= endDate;
};

export const getWeekendDayLabel = () => {
  const { now } = getWeekendWindow();
  const weekday = new Intl.DateTimeFormat('en-GB', { timeZone: ROME_TZ, weekday: 'short' })
    .format(now);
  if (weekday === 'Sat') return 'saturday';
  if (weekday === 'Sun') return 'sunday';
  return 'other';
};

export const getMaxCapacity = () => {
  const fallback = 400;
  const parsed = Number(process.env.ACCREDITI_MAX_CAP);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

export const getOrCreateCurrentWeekend = async (supabase) => {
  const { startDate, endDate, weekendKey } = getWeekendWindow();
  const { data: existing, error: findError } = await supabase
    .from('weekends')
    .select('*')
    .eq('key', weekendKey)
    .maybeSingle();

  if (findError) {
    throw findError;
  }

  if (existing) return existing;

  const { data: created, error: createError } = await supabase
    .from('weekends')
    .insert({
      key: weekendKey,
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString(),
      max_capacity: getMaxCapacity()
    })
    .select('*')
    .single();

  if (createError) {
    throw createError;
  }

  return created;
};

export const getWeekendStats = async (supabase, weekendId) => {
  const countFor = async (status) => {
    let query = supabase
      .from('accreditations')
      .select('id', { count: 'exact', head: true })
      .eq('weekend_id', weekendId);

    if (status) query = query.eq('status', status);

    const { count, error } = await query;
    if (error) throw error;
    return count ?? 0;
  };

  const total = await countFor();
  const saturday = await countFor('used_saturday');
  const sunday = await countFor('used_sunday');

  return { total, saturday, sunday, noShow: Math.max(total - sunday, 0) };
};
