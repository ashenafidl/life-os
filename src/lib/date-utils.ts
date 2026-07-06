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

export function toEpochMs(input: string) {
  const [date, time] = input.split(" ");

  const [day, month, year] = date.split("/").map(Number);
  const [hour, minute, second] = time.split(":").map(Number);

  return new Date(year, month - 1, day, hour, minute, second);
}
