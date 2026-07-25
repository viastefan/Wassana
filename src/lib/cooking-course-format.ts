/** Client-safe date helpers (no Node crypto / fs). */

export function formatCourseDate(isoDate: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate);
  if (!match) return isoDate;
  const [, year, month, day] = match;
  const dayNum = String(Number(day));
  const monthNum = String(Number(month)).padStart(2, "0");
  const currentYear = new Date().getFullYear();
  if (Number(year) === currentYear) {
    return `${dayNum}.${monthNum}.`;
  }
  return `${dayNum}.${monthNum}.${year}`;
}
