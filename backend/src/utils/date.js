/**
 * Returns a Date representing UTC midnight of the given date.
 *
 * - toUTCMidnight(new Date('2026-10-13T15:30:00+05:30'))
 *   → 2026-10-13T00:00:00.000Z
 * - toUTCMidnight('2026-10-13')
 *   → 2026-10-13T00:00:00.000Z
 * - toUTCMidnight()    // today in local time, converted to UTC midnight of that calendar day
 *   → 2026-10-13T00:00:00.000Z (when local date is 2026-10-13)
 */
const toUTCMidnight = (input = new Date()) => {
  // If a YYYY-MM-DD string is passed, parse as UTC to avoid shifting.
  if (typeof input === 'string') {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(input);
    if (m) return new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
    return new Date(input);
  }
  const d = input instanceof Date ? input : new Date(input);
  return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
};

/** Weekday (0..6) of a UTC-midnight Date, in the same calendar day as the Date. */
const utcWeekday = (utcMidnightDate) => utcMidnightDate.getUTCDay();

/** YYYY-MM-DD string from a UTC-midnight Date. */
const toDateString = (utcMidnightDate) => utcMidnightDate.toISOString().slice(0, 10);

module.exports = { toUTCMidnight, utcWeekday, toDateString };