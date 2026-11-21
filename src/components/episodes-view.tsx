import { Reveal } from "@/components/reveal";
import { weekStart } from "@/lib/quarter-plan";

const DAY_MONTH = new Intl.DateTimeFormat("ar-EG", { day: "numeric", month: "long", timeZone: "UTC" });

/**
 * حلقات الربع زي منصة: الحلقة مقفولة لحد ما ميعادها ييجي، وأول ما لينكها يتحط من الأدمن بتتفتح.
 * لو ميعادها جه ولسه مفيش لينك: "بتتصوّر".
 */
export function EpisodesView({
  year,
  q,
  videos,
  links,
  at,
}: {
  year: number;
  q: number;
  videos: { week: number; title: string }[];
  links: Record<string, string>;
  at: Date;
}) {
  const released = videos.filter((v) => links[v.week]).length;

  return (
    <div className="mt-12">
      <Reveal className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-2xl font-black">حلقات يوتيوب</h3>
        <p className="text-sm text-muted">
          <span className="font-bold text-foreground tabular-nums">{released}</span> من <span className="tabular-nums">{videos.length}</span> نزلوا
        </p>
        <p className="w-full text-sm text-muted">حلقة كل أسبوع على يوتيوب، وفيديو كل يومين على تيك توك من نفس الرحلة.</p>
      </Reveal>

      <ol className="space-y-2">
        {videos.map((v) => {
          const url = links[v.week];
          const opens = weekStart(year, q, v.week);
          const started = at >= opens;
          const number = (
            <span
              className={`flex size-10 shrink-0 items-center justify-center rounded-xl text-sm font-black tabular-nums ${
                url ? "bg-gold text-black" : "bg-surface-2 text-muted"
              }`}
            >
              {url ? "▶" : started ? "●" : "🔒"}
            </span>
          );
          const body = (
            <span className="min-w-0 flex-1">
              <span className="block text-xs text-muted tabular-nums">الحلقة {v.week}</span>
              <span className={`block leading-snug font-bold ${url ? "" : started ? "" : "text-muted"}`}>{v.title}</span>
            </span>
          );
          const status = url ? (
            <span className="shrink-0 text-sm font-bold text-gold">اتفرج ←</span>
          ) : started ? (
            <span className="shrink-0 text-xs text-gold">بتتصوّر</span>
          ) : (
            <span className="shrink-0 text-xs text-muted">يفتح {DAY_MONTH.format(opens)}</span>
          );

          return (
            <li key={v.week}>
              {url ? (
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 rounded-2xl border border-gold/40 bg-surface p-3 transition hover:border-gold"
                >
                  {number}
                  {body}
                  {status}
                </a>
              ) : (
                <div className={`flex items-center gap-3 rounded-2xl border border-border p-3 ${started ? "bg-surface" : "bg-surface/40"}`}>
                  {number}
                  {body}
                  {status}
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
