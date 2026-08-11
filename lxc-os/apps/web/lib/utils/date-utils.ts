
/**
 * Utility functions for handling dates across different timezones.
 * The institution default is Asia/Kolkata (IST, UTC+05:30).
 *
 * IMPORTANT: All functions return proper UTC Date objects. The internal
 * UTC timestamp is correct — when Prisma saves to DB, the stored value
 * will be accurate. Use timeZone: "Asia/Kolkata" when displaying.
 *
 * WHY THIS FILE EXISTS:
 * Vercel and other cloud hosts run in UTC. Using raw new Date(), .setHours(),
 * .getHours(), or .getDay() produces UTC-based results which are 5h30m off from
 * Indian Standard Time. Always use the helpers below in server-side code.
 */

export const INSTITUTION_TIMEZONE = "Asia/Kolkata";
const IST_OFFSET = "+05:30";

/**
 * Helper to extract date/time parts in IST from a Date object.
 */
function getISTParts(date: Date): Record<string, number> {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: INSTITUTION_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  const parts = formatter.formatToParts(date);
  const dateMap: Record<string, number> = {};
  parts.forEach(part => {
    if (part.type !== "literal") {
      dateMap[part.type] = parseInt(part.value);
    }
  });
  return dateMap;
}

/**
 * Extract date/time parts in IST from a specific Date.
 * (year, month, day, hour, minute, second)
 */
export function getISTDateParts(date: Date): Record<string, number> {
  return getISTParts(date);
}

/**
 * IST parts for "now" (year/month/day/hour/minute/second).
 */
export function getISTNowParts(): Record<string, number> {
  return getISTParts(new Date());
}

/**
 * Returns YYYY-MM-DD in IST for any given Date (stable key for "calendar day").
 */
export function formatISTDateKey(date: Date): string {
  const p = getISTParts(date);
  return `${p.year}-${String(p.month).padStart(2, "0")}-${String(p.day).padStart(2, "0")}`;
}

/**
 * Returns a Date object representing the start of the current day in IST.
 * The returned Date has the correct UTC timestamp (IST midnight = UTC 18:30 previous day).
 */
export function getInstitutionalToday(): Date {
  const dateMap = getISTParts(new Date());

  // Build an ISO string with IST offset so the Date constructor computes correct UTC
  const isoStr = `${dateMap.year}-${String(dateMap.month).padStart(2, '0')}-${String(dateMap.day).padStart(2, '0')}T00:00:00${IST_OFFSET}`;
  return new Date(isoStr);
}

/**
 * Returns a Date object representing the end of the current day in IST (23:59:59.999).
 * Use this for the upper bound of "today" range queries alongside getInstitutionalToday().
 */
export function getInstitutionalEndOfDay(): Date {
  const dateMap = getISTParts(new Date());
  const isoStr = `${dateMap.year}-${String(dateMap.month).padStart(2, '0')}-${String(dateMap.day).padStart(2, '0')}T23:59:59${IST_OFFSET}`;
  const d = new Date(isoStr);
  d.setMilliseconds(999);
  return d;
}

/**
 * Returns the current date and time as a Date object with correct UTC timestamp.
 * The IST parts are embedded via the offset, so no double-shifting occurs.
 */
export function getInstitutionalNow(): Date {
  const dateMap = getISTParts(new Date());

  // Handle hour 24 (midnight) which Intl may return
  const hour = dateMap.hour === 24 ? 0 : dateMap.hour;

  const isoStr = `${dateMap.year}-${String(dateMap.month).padStart(2, '0')}-${String(dateMap.day).padStart(2, '0')}T${String(hour).padStart(2, '0')}:${String(dateMap.minute).padStart(2, '0')}:${String(dateMap.second).padStart(2, '0')}${IST_OFFSET}`;
  return new Date(isoStr);
}

/**
 * Parse "date-only" inputs as an IST calendar date (IST midnight).
 *
 * - "YYYY-MM-DD" is interpreted as that day in Asia/Kolkata (NOT UTC).
 * - ISO strings with a timezone ("Z" or "+05:30") are respected as-is.
 */
export function parseInstitutionalDate(input: string | Date): Date {
  if (input instanceof Date) return input;
  if (typeof input !== "string") return new Date(input as any);

  const trimmed = input.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return new Date(`${trimmed}T00:00:00${IST_OFFSET}`);
  }

  // If it already contains timezone information, trust native parsing.
  if (/[zZ]|[+-]\d{2}:\d{2}$/.test(trimmed)) {
    return new Date(trimmed);
  }

  // Fallback: treat as a local datetime string; normalize via Date() (last resort).
  return new Date(trimmed);
}

/**
 * Build a DateTime from an IST calendar date ("YYYY-MM-DD") + time ("HH:mm" or "HH:mm:ss"),
 * interpreted in Asia/Kolkata and returned as a UTC timestamp.
 */
export function makeISTDateTime(dateStr: string, timeStr: string): Date {
  const d = dateStr.trim();
  const t = timeStr.trim();
  const normalizedTime = /^\d{2}:\d{2}$/.test(t) ? `${t}:00` : t;
  return new Date(`${d}T${normalizedTime}${IST_OFFSET}`);
}

/**
 * Month range boundaries in IST, returned as UTC timestamps.
 * `month` is 1-12.
 */
export function getInstitutionalMonthRange(year: number, month: number): { start: Date; end: Date } {
  const mm = String(month).padStart(2, "0");
  const start = new Date(`${year}-${mm}-01T00:00:00${IST_OFFSET}`);

  // Compute last day of month (in UTC-safe way) then re-express as IST end-of-day.
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate(); // month is 1-12 here; Date.UTC month is 0-11, but using `month` yields next month; day 0 => last day of previous month (desired).
  const dd = String(lastDay).padStart(2, "0");
  const end = new Date(`${year}-${mm}-${dd}T23:59:59${IST_OFFSET}`);
  end.setMilliseconds(999);
  return { start, end };
}

/**
 * Extracts the hour in IST from a Date object (0-23).
 * Use this instead of date.getHours() which returns local server time.
 */
export function getISTHours(date: Date): number {
  const parts = getISTParts(date);
  return parts.hour === 24 ? 0 : parts.hour;
}

/**
 * Extracts the minute in IST from a Date object (0-59).
 */
export function getISTMinutes(date: Date): number {
  return getISTParts(date).minute;
}

/**
 * Returns the day of the week in IST (0 = Sunday … 6 = Saturday).
 * Use this instead of date.getDay() which returns local server time.
 */
export function getISTCurrentDayOfWeek(): number {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: INSTITUTION_TIMEZONE,
    weekday: "short",
  });
  const weekdayStr = formatter.format(now); // e.g. "Mon", "Tue", …
  const weekdayMap: Record<string, number> = {
    Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6,
  };
  return weekdayMap[weekdayStr] ?? new Date().getDay();
}

/**
 * Returns the day of the week in IST (0 = Sunday … 6 = Saturday) for a specific Date.
 */
export function getISTDayOfWeek(date: Date): number {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: INSTITUTION_TIMEZONE,
    weekday: "short",
  });
  const weekdayStr = formatter.format(date);
  const weekdayMap: Record<string, number> = {
    Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6,
  };
  return weekdayMap[weekdayStr] ?? date.getDay();
}

/**
 * Returns the current date as a YYYY-MM-DD string in IST.
 * Use this instead of new Date().toISOString().split('T')[0] which returns the UTC date.
 */
export function getISTDateString(): string {
  const dateMap = getISTParts(new Date());
  return `${dateMap.year}-${String(dateMap.month).padStart(2, '0')}-${String(dateMap.day).padStart(2, '0')}`;
}

/**
 * Checks if a given date is in the future relative to the institutional timezone.
 */
export function isFutureDate(date: Date): boolean {
  const today = getInstitutionalToday();
  // Compare just the date portion in IST
  const checkParts = getISTParts(date);
  const checkIso = `${checkParts.year}-${String(checkParts.month).padStart(2, '0')}-${String(checkParts.day).padStart(2, '0')}T00:00:00${IST_OFFSET}`;
  const checkDate = new Date(checkIso);

  return checkDate > today;
}
