import { format } from "date-fns";

/** Short display form used everywhere by default, e.g. "Dec 20, 2025" */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return format(d, "MMM d, yyyy");
}

/**
 * Full date + time (24-hour) + timezone offset, for the hover state.
 * `OOOO` gives the full GMT offset (e.g. "GMT+03:00"). Plain date-fns
 * can't produce a named abbreviation like "EAT" — that requires knowing
 * IANA timezone rules, which the `date-fns-tz` package adds on top of
 * date-fns if you want that specific format instead of an offset.
 */
export function formatFullDateTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return format(d, "EEEE, MMMM d, yyyy 'at' HH:mm:ss");
}

function parseDate(date: string): { day: number; month: number; year: number } {
  const match = date.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!match) throw new Error(`Unrecognized date format: "${date}"`);
  const [, day, month, year] = match;
  return { day: Number(day), month: Number(month), year: Number(year) };
}

function parseTime(time: string): {
  hour: number;
  minute: number;
  second: number;
} {
  const trimmed = time.trim();

  // 12-hour with AM/PM, e.g. "09:18:51 PM" (also tolerates no space before AM/PM, lowercase)
  const meridiemMatch = trimmed.match(/^(\d{1,2}):(\d{2}):(\d{2})\s*(AM|PM)$/i);
  if (meridiemMatch) {
    const [, h, m, s, meridiem] = meridiemMatch;
    let hour = Number(h);
    const isPM = meridiem.toUpperCase() === "PM";
    if (hour === 12) hour = 0; // 12 AM -> 0 hundred hours
    if (isPM) hour += 12; // 12 PM -> back to 12; 9 PM -> 21
    return { hour, minute: Number(m), second: Number(s) };
  }

  // Plain 24-hour, e.g. "14:03:40"
  const plainMatch = trimmed.match(/^(\d{1,2}):(\d{2}):(\d{2})$/);
  if (plainMatch) {
    const [, h, m, s] = plainMatch;
    return { hour: Number(h), minute: Number(m), second: Number(s) };
  }

  throw new Error(`Unrecognized time format: "${time}"`);
}

/**
 * Converts a bank SMS's date and time (captured as separate regex groups)
 * into epoch milliseconds. Handles both 24-hour ("14:03:40") and 12-hour
 * with AM/PM ("09:18:51 PM") time formats — pass just the time portion;
 * strip any literal "at" in your regex's non-capturing text, not here.
 */
export function toEpoch(date: string, time: string) {
  const { day, month, year } = parseDate(date);
  const { hour, minute, second } = parseTime(time);
  return new Date(year, month - 1, day, hour, minute, second);
}
