export const BD_TIMEZONE = "Asia/Dhaka";
export const BD_LOCALE = "en-BD";

export type DateInput = Date | string | number;

function toDate(value: DateInput): Date {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid date: ${String(value)}`);
  }
  return date;
}

function partValue(
  parts: Intl.DateTimeFormatPart[],
  type: Intl.DateTimeFormatPartTypes
) {
  return parts.find((part) => part.type === type)?.value ?? "";
}

/** Calendar parts in Asia/Dhaka (not the server's local TZ). */
export function getBdCalendarParts(value: DateInput = new Date()) {
  const date = toDate(value);
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: BD_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    hourCycle: "h23",
  }).formatToParts(date);

  return {
    year: Number(partValue(parts, "year")),
    month: Number(partValue(parts, "month")),
    day: Number(partValue(parts, "day")),
    hour: Number(partValue(parts, "hour")),
    minute: Number(partValue(parts, "minute")),
    second: Number(partValue(parts, "second")),
  };
}

/** YYYY-MM-DD key for a moment in BD time */
export function toBdDayKey(value: DateInput = new Date()) {
  const { year, month, day } = getBdCalendarParts(value);
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/**
 * Start of the Bangladesh calendar day containing `value`, as a UTC Date.
 * Asia/Dhaka is UTC+6 year-round (no DST).
 */
export function startOfBdDay(value: DateInput = new Date()) {
  const key = toBdDayKey(value);
  return new Date(`${key}T00:00:00+06:00`);
}

/** Add whole calendar days in BD time (returns start of that BD day). */
export function addBdDays(value: DateInput, days: number) {
  const start = startOfBdDay(value);
  return new Date(start.getTime() + days * 24 * 60 * 60 * 1000);
}

export function formatBdDate(
  value: DateInput,
  options: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "short",
    year: "numeric",
  }
) {
  return new Intl.DateTimeFormat(BD_LOCALE, {
    timeZone: BD_TIMEZONE,
    ...options,
  }).format(toDate(value));
}

export function formatBdDateTime(
  value: DateInput,
  options: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }
) {
  return new Intl.DateTimeFormat(BD_LOCALE, {
    timeZone: BD_TIMEZONE,
    ...options,
  }).format(toDate(value));
}

export function formatBdTime(
  value: DateInput,
  options: Intl.DateTimeFormatOptions = {
    hour: "numeric",
    minute: "2-digit",
  }
) {
  return new Intl.DateTimeFormat(BD_LOCALE, {
    timeZone: BD_TIMEZONE,
    ...options,
  }).format(toDate(value));
}

/** Current calendar year in BD (for copyright, etc.) */
export function getBdYear(value: DateInput = new Date()) {
  return getBdCalendarParts(value).year;
}
