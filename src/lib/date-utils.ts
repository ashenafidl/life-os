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

const AMBIGUOUS_HOUR_FORMAT = /^hh(?!.*\ba\b)/i; // "hh" without a trailing "a" token — 12-hour digits, no meridiem

function resolveAmbiguous12Hour(
  rawHour: number,
  minutes: number,
  seconds: number,
  year: number,
  month: number,
  day: number,
  fallback: Date,
): { hours: number } {
  // "hh" is 1–12 with no AM/PM marker, so rawHour alone can't tell us which
  // half of the day it's in. Build both candidates and keep whichever is
  // closer to the fallback (the phone's actual SMS receipt time) — the real
  // transaction and its notification happen close together, so the wrong
  // half of the day will be off by roughly 12 hours (give or take the
  // genuine minutes/seconds gap between the transaction and the SMS
  // landing), while the right one will only be off by that small gap.
  const amHour = rawHour === 12 ? 0 : rawHour;
  const pmHour = rawHour === 12 ? 12 : rawHour + 12;

  const pad = (n: number) => String(n).padStart(2, "0");
  const buildCandidate = (hour: number) =>
    fromZonedTime(
      `${year}-${pad(month + 1)}-${pad(day)} ${pad(hour)}:${pad(minutes)}:${pad(seconds)}`,
      SMS_TIMEZONE,
    );

  const amDiff = Math.abs(
    buildCandidate(amHour).getTime() - fallback.getTime(),
  );
  const pmDiff = Math.abs(
    buildCandidate(pmHour).getTime() - fallback.getTime(),
  );

  return { hours: amDiff <= pmDiff ? amHour : pmHour };
}

export function extractMessageDatetime({
  fallback,
  date,
  time,
  dateFormat,
  timeFormat,
}: {
  fallback: Date;
  date?: string;
  time?: string;
  dateFormat?: string | null;
  timeFormat?: string | null;
}): Date {
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
    if (timeFormat && AMBIGUOUS_HOUR_FORMAT.test(timeFormat.trim())) {
      // 12-hour digits with no AM/PM in the string — parse the raw numbers
      // only (don't trust date-fns' own AM/PM assumption for a bare "hh"),
      // then disambiguate against the fallback.
      const match = time.match(/(\d{1,2}):(\d{2}):(\d{2})/);
      if (!match) return fallback;
      const [, h, m, s] = match;
      minutes = Number(m);
      seconds = Number(s);
      hours = resolveAmbiguous12Hour(
        Number(h),
        minutes,
        seconds,
        year,
        month,
        day,
        fallback,
      ).hours;
    } else {
      const parsedTime = timeFormat
        ? parse(time, timeFormat, REFERENCE_DATE)
        : new Date(`1970-01-01T${time}`);
      if (!isValid(parsedTime)) return fallback;
      hours = parsedTime.getHours();
      minutes = parsedTime.getMinutes();
      seconds = parsedTime.getSeconds();
    }
  }

  const pad = (n: number) => String(n).padStart(2, "0");
  const literal = `${year}-${pad(month + 1)}-${pad(day)} ${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;

  const result = fromZonedTime(literal, SMS_TIMEZONE);

  return isValid(result) ? result : fallback;
}
