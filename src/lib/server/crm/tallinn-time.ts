const tallinnFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Europe/Tallinn',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23'
});

const tallinnDateFormatter = new Intl.DateTimeFormat('sv-SE', {
  timeZone: 'Europe/Tallinn',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit'
});

type WallParts = { year: number; month: number; day: number; hour: number; minute: number };

const formatParts = (date: Date): WallParts => {
  const parts = tallinnFormatter.formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value ?? '0');
  return {
    year: get('year'),
    month: get('month'),
    day: get('day'),
    hour: get('hour'),
    minute: get('minute')
  };
};

const sameWallTime = (left: WallParts, right: WallParts) =>
  left.year === right.year &&
  left.month === right.month &&
  left.day === right.day &&
  left.hour === right.hour &&
  left.minute === right.minute;

/** Parses an HTML datetime-local value as a real Europe/Tallinn instant. */
export function parseTallinnDateTimeLocal(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value);
  if (!match) return null;
  const [year, month, day, hour, minute] = match.slice(1).map(Number);
  const desired = { year, month, day, hour, minute };
  const desiredWallMs = Date.UTC(year, month - 1, day, hour, minute);
  const normalized = new Date(desiredWallMs);
  if (
    normalized.getUTCFullYear() !== year ||
    normalized.getUTCMonth() !== month - 1 ||
    normalized.getUTCDate() !== day ||
    normalized.getUTCHours() !== hour ||
    normalized.getUTCMinutes() !== minute
  ) return null;

  let candidateMs = desiredWallMs;
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const represented = formatParts(new Date(candidateMs));
    const representedWallMs = Date.UTC(
      represented.year,
      represented.month - 1,
      represented.day,
      represented.hour,
      represented.minute
    );
    candidateMs += desiredWallMs - representedWallMs;
  }
  const candidate = new Date(candidateMs);
  return sameWallTime(formatParts(candidate), desired) ? candidate : null;
}

export function formatTallinnDate(date: Date): string {
  return tallinnDateFormatter.format(date);
}

export function shiftCalendarDate(value: string, days: number): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match || !Number.isInteger(days)) throw new Error('Invalid calendar date shift');
  const [year, month, day] = match.slice(1).map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + days));
  return date.toISOString().slice(0, 10);
}

export function tallinnReportingPeriod(now = new Date(), days = 30) {
  if (!Number.isInteger(days) || days < 1 || days > 366) throw new Error('Invalid report length');
  const toKey = formatTallinnDate(now);
  const fromKey = shiftCalendarDate(toKey, -(days - 1));
  const from = parseTallinnDateTimeLocal(`${fromKey}T00:00`);
  if (!from) throw new Error('Could not resolve Tallinn report start');
  return { from, to: now, fromKey, toKey };
}
