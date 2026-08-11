export const INSTITUTION_TIMEZONE = "Asia/Kolkata";
const IST_OFFSET = "+05:30";

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
  const out: Record<string, number> = {};
  for (const p of parts) {
    if (p.type !== "literal") out[p.type] = parseInt(p.value, 10);
  }
  return out;
}

export function getISTNowParts(): Record<string, number> {
  return getISTParts(new Date());
}

export function getISTDateParts(date: Date): Record<string, number> {
  return getISTParts(date);
}

export function formatISTDateKey(date: Date): string {
  const p = getISTParts(date);
  return `${p.year}-${String(p.month).padStart(2, "0")}-${String(p.day).padStart(2, "0")}`;
}

export function makeISTDateTime(dateStr: string, timeStr: string): Date {
  const d = dateStr.trim();
  const t = timeStr.trim();
  const normalizedTime = /^\d{2}:\d{2}$/.test(t) ? `${t}:00` : t;
  return new Date(`${d}T${normalizedTime}${IST_OFFSET}`);
}

export function getISTHours(date: Date): number {
  const parts = getISTParts(date);
  return parts.hour === 24 ? 0 : parts.hour;
}

export function getISTMinutes(date: Date): number {
  return getISTParts(date).minute;
}

export function getISTDayOfWeek(date: Date): number {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: INSTITUTION_TIMEZONE,
    weekday: "short",
  });
  const weekdayStr = formatter.format(date);
  const weekdayMap: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };
  return weekdayMap[weekdayStr] ?? date.getDay();
}

export function getISTCurrentDayOfWeek(): number {
  return getISTDayOfWeek(new Date());
}

