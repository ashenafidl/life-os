import { format, isValid, parse, toDate } from "date-fns";

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
  if (!date && !time) {
    return fallback;
  }

  let baseDate: Date;

  if (date) {
    if (dateFormat) {
      baseDate = parse(date, dateFormat, fallback);
    } else {
      baseDate = toDate(date);
    }

    if (!isValid(baseDate)) {
      return fallback;
    }
  } else {
    baseDate = new Date(fallback);
  }

  if (time) {
    let timeDate: Date;

    if (timeFormat) {
      timeDate = parse(time, timeFormat, baseDate);
    } else {
      const dummyDateStr = `1970-01-01T${time}`;
      timeDate = new Date(dummyDateStr);
    }

    if (!isValid(timeDate)) {
      return fallback;
    }

    // Merge time into baseDate
    baseDate.setHours(
      timeDate.getHours(),
      timeDate.getMinutes(),
      timeDate.getSeconds(),
      timeDate.getMilliseconds(),
    );
  }

  return isValid(baseDate) ? baseDate : fallback;
}
