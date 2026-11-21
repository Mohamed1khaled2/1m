export const YEAR = 2027;
export const GOAL = 1_000_000;

/** كل ربع مشروع واحد بس (slug من جدول projects)، عشان محدش يتشتت. */
export const QUARTERS = [
  { q: 1, label: "الربع الأول", months: "يناير – مارس", project: "nileband" },
  { q: 2, label: "الربع التاني", months: "أبريل – يونيو", project: "centerid" },
  { q: 3, label: "الربع التالت", months: "يوليو – سبتمبر", project: "trendo" },
  { q: 4, label: "الربع الأخير", months: "أكتوبر – ديسمبر", project: "ethbat" },
] as const;

/**
 * الوقت الحالي. APP_NOW بيسمح نجرّب كأننا في 2027 (مثلاً APP_NOW=2027-05-10)
 * عشان التصوير والتيست قبل ما السنة تبدأ.
 */
export function now(): Date {
  const override = process.env.APP_NOW;
  return override ? new Date(override) : new Date();
}

/** الربع ده بدأ ولا لسه؟ التسجيل بيفتح من أول يوم في الربع لحد آخر السنة وبعدها. */
export function isQuarterOpen(q: number, at: Date = now()): boolean {
  const start = new Date(Date.UTC(YEAR, (q - 1) * 3, 1));
  return at >= start;
}

/** الربع اللي شغالين على مشروعه دلوقتي: قبل السنة الأول، وبعدها الأخير. */
export function focusQuarter(at: Date = now()): number {
  if (at.getUTCFullYear() < YEAR) return 1;
  if (at.getUTCFullYear() > YEAR) return 4;
  return Math.floor(at.getUTCMonth() / 3) + 1;
}

/** الربع اللي خلص يوم `at` (بيستخدمه الكرون في أول يوم من كل ربع). */
export function endedQuarter(at: Date = now()): { year: number; quarter: number } {
  const month = at.getUTCMonth(); // 0..11
  const current = Math.floor(month / 3) + 1;
  return current === 1
    ? { year: at.getUTCFullYear() - 1, quarter: 4 }
    : { year: at.getUTCFullYear(), quarter: current - 1 };
}

/** الدرجة اللي الشخص وصلها على سلّم المليون: كل ٢٠٠ ألف درجة، من 0 (الأرض) لـ 5 (الشنطة). */
export function stepFor(total: number): number {
  return Math.max(0, Math.min(5, Math.floor(total / (GOAL / 5))));
}

export function formatEGP(n: number): string {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(n);
}

export function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
}

const DAY = 86_400_000;

/**
 * عشان يوصل المليون في آخر السنة: محتاج يكسب كام في اليوم وفي الساعة من النهارده.
 * قبل ما السنة تبدأ بنحسب على السنة كلها.
 */
export function paceFor(balance: number, at: number = Date.now()) {
  const yearStart = new Date(YEAR, 0, 1).getTime();
  const yearEnd = new Date(YEAR + 1, 0, 1).getTime();
  const daysLeft = Math.max(1, (yearEnd - Math.max(at, yearStart)) / DAY);
  const remaining = Math.max(0, GOAL - balance);
  return {
    remaining,
    daysLeft: Math.ceil(daysLeft),
    perDay: remaining / daysLeft,
    perHour: remaining / daysLeft / 24,
  };
}
