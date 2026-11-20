"use client";

import { useEffect, useState } from "react";
import { YEAR } from "@/lib/year";

export type DayActivity = { count: number; amount: number };

const DAY = 86_400_000;
const MONTHS = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];

/**
 * السنة كلها مربعات، زي جدول المساهمات بتاع GitHub بس متقسمة شهور عشان تتقري على الموبايل:
 * اللي عدّى متلوّن، والنهارده بينبض، واليوم اللي اتنشر فيه حاجة بينوّر بلونها.
 */
export function YearGrid({ activity }: { activity: Record<string, DayActivity> }) {
  const [today, setToday] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => {
      const d = new Date();
      setToday(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    };
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, []);

  const start = Date.UTC(YEAR, 0, 1);
  const days = (Date.UTC(YEAR + 1, 0, 1) - start) / DAY;

  const passed = today === null ? 0 : Math.max(0, Math.min(days, Math.floor((today - start) / DAY) + (today >= start ? 1 : 0)));
  const untilStart = today !== null && today < start ? Math.ceil((start - today) / DAY) : 0;

  // كل شهر نتيجة صغيرة: ٧ عواميد (السبت الأول) ومربعات فاضية لحد أول يوم في الشهر
  const months = MONTHS.map((name, m) => {
    const first = Date.UTC(YEAR, m, 1);
    const count = (Date.UTC(YEAR, m + 1, 1) - first) / DAY;
    const lead = (new Date(first).getUTCDay() + 1) % 7;
    return {
      name,
      lead,
      days: Array.from({ length: count }, (_, d) => {
        const at = first + d * DAY;
        return { key: new Date(at).toISOString().slice(0, 10), index: (at - start) / DAY };
      }),
    };
  });

  return (
    <div>
      <div className="grid grid-cols-3 gap-x-4 gap-y-5 sm:grid-cols-4">
        {months.map((month) => (
          <div key={month.name}>
            <p className="mb-1.5 text-xs font-bold text-muted">{month.name}</p>
            <div className="grid grid-cols-7 gap-[3px]">
              {Array.from({ length: month.lead }, (_, i) => (
                <span key={`lead-${i}`} />
              ))}
              {month.days.map((c) => {
                const a = activity[c.key];
                const isToday = today !== null && today >= start && c.index === passed - 1;
                const past = c.index < passed;
                return (
                  <span
                    key={c.key}
                    title={a ? `${c.key}: ${a.count} حاجة` : c.key}
                    className={`aspect-square rounded-[3px] transition-colors duration-700 ${
                      a && a.amount > 0
                        ? "bg-green"
                        : a
                          ? "bg-gold"
                          : isToday
                            ? "animate-pulse bg-gold/80"
                            : past
                              ? "bg-gold/25"
                              : "bg-surface-2"
                    } ${isToday ? "ring-2 ring-gold ring-offset-1 ring-offset-background" : ""}`}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[11px] text-muted">
        <span className="flex items-center gap-1">
          <span className="size-2.5 rounded-[2px] bg-surface-2" /> جاي
        </span>
        <span className="flex items-center gap-1">
          <span className="size-2.5 rounded-[2px] bg-gold/25" /> عدّى
        </span>
        <span className="flex items-center gap-1">
          <span className="size-2.5 rounded-[2px] bg-gold" /> عملت حاجة
        </span>
        <span className="flex items-center gap-1">
          <span className="size-2.5 rounded-[2px] bg-green" /> فلوس دخلت
        </span>
      </div>

      <p className="mt-8 text-center text-lg leading-relaxed">
        {today === null ? (
          " "
        ) : untilStart > 0 ? (
          <>
            السنة لسه مابدأتش. فاضل <span className="font-black text-gold tabular-nums">{untilStart}</span> يوم وتبدأ.
          </>
        ) : passed >= days ? (
          <>سنة {YEAR} خلصت.</>
        ) : (
          <>
            عدّى <span className="font-black text-gold tabular-nums">{passed}</span> يوم من {YEAR}. فاضل{" "}
            <span className="font-black tabular-nums">{days - passed}</span>.
          </>
        )}
      </p>
      <p className="mt-1 text-center text-muted">كل مربع يوم. متسيبش يوم يعدّي فاضي.</p>
    </div>
  );
}
