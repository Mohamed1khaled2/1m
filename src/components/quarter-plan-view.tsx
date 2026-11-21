import { Reveal } from "@/components/reveal";
import type { QuarterPlanCopy } from "@/lib/quarter-plan";

/**
 * خطة الربع للناس: المواعيد اللي يستنوها، وكل شهر هيشوفوا فيه إيه وهيقدروا يعملوا إيه.
 * من غير مهام ولا تفاصيل شغل: دي في الأدمن.
 */
export function QuarterPlanView({
  quarter,
  project,
  copy,
}: {
  quarter: { q: number; months: string; year: number };
  project: string;
  copy: QuarterPlanCopy;
}) {
  return (
    <div className="mt-12 space-y-10">
      <Reveal className="space-y-1">
        <p className="text-sm text-muted">
          <span className="font-bold text-gold">Q{quarter.q}</span> · {quarter.months} {quarter.year}
        </p>
        <h3 className="text-2xl font-black">{project}: اللي جاي</h3>
        <p className="text-lg text-muted">{copy.headline}</p>
      </Reveal>

      {/* المواعيد */}
      <Reveal>
        <ol className="relative space-y-4 border-r-2 border-gold/40 pr-6">
          {copy.dates.map((d, i) => {
            const last = i === copy.dates.length - 1;
            return (
              <li key={d.what} className="relative">
                <span
                  className={`absolute top-1.5 -right-[31px] size-3.5 rounded-full border-2 ${last ? "border-gold bg-gold" : "border-gold bg-background"}`}
                  aria-hidden
                />
                <p className="text-xs font-bold text-gold">{d.when}</p>
                <p className={last ? "text-lg font-black" : "font-bold"}>{d.what}</p>
              </li>
            );
          })}
        </ol>
      </Reveal>

      {/* كل شهر: هتشوف إيه، وتقدر تعمل إيه */}
      <div className="grid gap-3 sm:grid-cols-3">
        {copy.months.map((m) => (
          <Reveal key={m.month} className="flex flex-col rounded-2xl border border-border bg-surface p-4">
            <p className="text-xs font-bold text-gold">{m.month}</p>
            <p className="text-xl font-black">{m.title}</p>
            <p className="mt-3 text-xs font-bold text-muted">هتشوف</p>
            <ul className="mt-1 space-y-1.5 text-sm leading-relaxed">
              {m.see.map((s) => (
                <li key={s} className="flex gap-2">
                  <span className="text-gold" aria-hidden>
                    ▸
                  </span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
            {m.can && (
              <div className="mt-auto pt-4">
                <p className="rounded-xl bg-gold/10 px-3 py-2 text-sm">
                  <span className="font-bold text-gold">تقدر: </span>
                  {m.can}
                </p>
              </div>
            )}
          </Reveal>
        ))}
      </div>

    </div>
  );
}
