"use client";

import { useState, useTransition } from "react";
import { saveEpisodeLink } from "@/app/admin/actions";

export type QuarterVideo = { week: number; month: string; title: string; idea: string; tiktok: string[] };
export type VideoFormat = "tiktok" | "youtube";

const STEPS = [
  "اشتغل على مهمة من الخطة",
  "صوّر وانت بتعملها، حتى لو لقطات صغيرة",
  "اكتب يومية في «انشر»",
  "اختار اليومية تحت، والمخرج يعملك السكريبت واللقطات",
  "صوّر الكلام وانزل، وحط لينك الفيديو في اليومية",
];

const SOURCES = [
  { title: "الشغل نفسه", text: "أي يوم اشتغلت فيه على المشروع فيه لقطات." },
  { title: "الوقعات", text: "حاجة باظت أو رقم طلع غلط بتتشاف أكتر من النجاح." },
  { title: "الكومنتات", text: "أي سؤال يتكرر رد عليه بفيديو." },
  { title: "الأرقام", text: "الرصيد والتكلفة والحجوزات، أول بأول." },
];

/**
 * فيديوهات الربع في المخرج: كل أسبوع حلقة يوتيوب و٣ تيك توك (فيديو كل يومين تقريباً)، والأسبوع ده منوّر.
 * دوسة على أي فيديو بتحطه في خانة الفكرة بنوعه. وفوقهم إزاي الشغل بيتحول لفيديو.
 */
export function QuarterVideos({
  slug,
  project,
  q,
  current,
  videos,
  links,
  onPick,
}: {
  slug: string;
  project: string;
  q: number;
  /** الأسبوع ده (٠ لو الربع لسه مابدأش) */
  current: number;
  videos: QuarterVideo[];
  /** لينكات الحلقات اللي نزلت (رقم الأسبوع ← اللينك) */
  links: Record<string, string>;
  onPick: (idea: string, format: VideoFormat) => void;
}) {
  const months = [...new Set(videos.map((v) => v.month))];

  return (
    <div className="space-y-4">
      <div className="rounded-3xl border border-border bg-surface p-5">
        <p className="text-lg font-black">إزاي الشغل بيبقى فيديو</p>
        <ol className="mt-3 space-y-2 text-sm">
          {STEPS.map((s, i) => (
            <li key={s} className="flex gap-3">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-gold/15 text-xs font-black text-gold tabular-nums">{i + 1}</span>
              <span className="pt-0.5 leading-relaxed">{s}</span>
            </li>
          ))}
        </ol>
        <p className="mt-5 text-sm font-black">الأفكار بتيجي منين</p>
        <ul className="mt-2 grid gap-2 sm:grid-cols-2">
          {SOURCES.map((s) => (
            <li key={s.title} className="rounded-xl border border-border bg-background/50 px-3 py-2 text-sm">
              <span className="font-bold">{s.title}: </span>
              <span className="text-muted">{s.text}</span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-sm text-muted">وكل يوم: ستوري على إنستجرام من الشغل، حتى لو ١٠ ثواني.</p>
      </div>

      <div className="rounded-3xl border border-gold/30 bg-gradient-to-b from-surface-2 to-surface p-5">
        <p className="text-xs font-bold text-gold">Q{q} · {project}</p>
        <p className="mt-1 text-lg font-black">فيديوهات كل أسبوع</p>
        <ul className="mt-2 space-y-1 text-sm">
          <li>
            <span className="font-bold text-gold">يوتيوب:</span> حلقة واحدة طويلة في الأسبوع (٥–٨ دقايق).
          </li>
          <li>
            <span className="font-bold text-gold">تيك توك:</span> ٣ في الأسبوع، يعني فيديو كل يومين تقريباً (٣٠–٧٥ ثانية).
          </li>
        </ul>
        <p className="mt-2 text-sm text-muted">
          {current === 0 ? "الربع لسه مابدأش. أول فيديو يوم ١ يناير." : `إحنا في الأسبوع ${current}.`} دوس على أي فيديو يتحط في الفكرة تحت بنوعه.
          حلقات يوتيوب بتظهر للناس في الصفحة الرئيسية مقفولة 🔒، ولما تحط لينك الحلقة هنا بتتفتح ▶.
        </p>
        <div className="mt-4 space-y-5">
          {months.map((m) => (
            <div key={m}>
              <p className="mb-2 text-sm font-black">{m}</p>
              <ul className="space-y-2">
                {videos
                  .filter((v) => v.month === m)
                  .map((v) => {
                    const now = v.week === current;
                    const past = current > 0 && v.week < current;
                    const live = !!links[v.week];
                    return (
                      <li
                        key={v.week}
                        className={`rounded-xl border ${now ? "border-gold bg-gold/10" : "border-border bg-background/50"} ${past && !live ? "opacity-60" : ""}`}
                      >
                        <p className="px-3 pt-2.5 text-xs text-muted tabular-nums">
                          أسبوع {v.week}
                          {now && <span className="mr-2 rounded-full bg-gold px-2 py-0.5 text-[10px] font-black text-black">الأسبوع ده</span>}
                        </p>
                        <button
                          onClick={() => onPick(`${v.title}: ${v.idea}`, "youtube")}
                          className="flex w-full items-start gap-2 px-3 pt-1 pb-1 text-right transition hover:text-gold"
                        >
                          <span className="shrink-0 rounded bg-red-500/15 px-1.5 py-0.5 text-[10px] font-black text-red-400">يوتيوب</span>
                          <span className="min-w-0">
                            <span className="block font-bold">
                              {live ? "▶ " : "🔒 "}
                              {v.title}
                            </span>
                            <span className="block text-sm leading-relaxed text-muted">{v.idea}</span>
                          </span>
                        </button>
                        <EpisodeLink slug={slug} week={v.week} initial={links[v.week] ?? ""} />
                        <ul className="space-y-1 border-t border-border px-3 py-2">
                          {v.tiktok.map((t) => (
                            <li key={t}>
                              <button onClick={() => onPick(t, "tiktok")} className="flex w-full items-start gap-2 text-right text-sm transition hover:text-gold">
                                <span className="shrink-0 rounded bg-foreground/10 px-1.5 py-0.5 text-[10px] font-black">تيك توك</span>
                                <span className="leading-relaxed">{t}</span>
                              </button>
                            </li>
                          ))}
                        </ul>
                      </li>
                    );
                  })}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** خانة لينك الحلقة: لما تتحفظ الحلقة بتتفتح للناس، ولو اتمسحت بترجع مقفولة. */
function EpisodeLink({ slug, week, initial }: { slug: string; week: number; initial: string }) {
  const [url, setUrl] = useState(initial);
  const [saved, setSaved] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function save() {
    start(async () => {
      const res = await saveEpisodeLink(slug, week, url);
      setError(res.error ?? null);
      if (!res.error) setSaved(url.trim());
    });
  }

  return (
    <div className="px-3 pb-2.5">
      <div className="flex gap-2">
        <input
          id={`episode-${week}`}
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          dir="ltr"
          inputMode="url"
          placeholder="لينك الحلقة لما تنزل"
          aria-label={`لينك الحلقة ${week}`}
          className="input min-w-0 flex-1 py-1.5 text-sm"
        />
        <button onClick={save} disabled={pending || url.trim() === saved} className="btn-ghost shrink-0 text-xs">
          {pending ? "..." : url.trim() ? "افتحها" : "اقفلها"}
        </button>
      </div>
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
}
