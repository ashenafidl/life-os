import { format, isValid, parse } from "date-fns";
import { fromZonedTime } from "date-fns-tz";

const SMS_TIMEZONE = "Africa/Addis_Ababa";

// arbitrary — only used so date-fns'
// `parse()` has something to anchor against; only y/m/d or h/m/s get read back out
const REFERENCE_DATE = new Date(2000, 0, 1);

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

export function extractMessageDatetime(
  fallback: Date,
  date?: string,
  time?: string,
  dateFormat?: string | null,
  timeFormat?: string | null,
): Date {
  // If nothing provided, return fallback
  if (!date && !time) return fallback;

  let year: number, month: number, day: number;

  if (date) {
    const parsedDate = dateFormat
      ? parse(date, dateFormat, REFERENCE_DATE)
      : new Date(`${date}T00:00:00`);

    if (!isValid(parsedDate)) return fallback;

    year = parsedDate.getFullYear();
    month = parsedDate.getMonth();
    day = parsedDate.getDate();
  } else {
    year = fallback.getFullYear();
    month = fallback.getMonth();
    day = fallback.getDate();
  }

  let hours = 0;
  let minutes = 0;
  let seconds = 0;

  if (time) {
    const parsedTime = timeFormat
      ? parse(time, timeFormat, REFERENCE_DATE)
      : new Date(`1970-01-01T${time}`);
    if (!isValid(parsedTime)) return fallback;
    hours = parsedTime.getHours();
    minutes = parsedTime.getMinutes();
    seconds = parsedTime.getSeconds();
  }

  const pad = (n: number) => String(n).padStart(2, "0");
  const literal = `${year}-${pad(month + 1)}-${pad(day)} ${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;

  const result = fromZonedTime(literal, SMS_TIMEZONE);

  return isValid(result) ? result : fallback;
}
