export function getReadSecondsFromEnv(defaultSeconds = 10, min = 3, max = 300): number {
  const raw = process.env.NEXT_PUBLIC_SECONDS_READ_PDF;
  const n = raw ? Number.parseInt(raw, 10) : NaN;
  const base = Number.isFinite(n) ? n : defaultSeconds;
  return Math.min(Math.max(base, min), max);
}