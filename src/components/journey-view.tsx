import Link from "next/link";
import { Fragment } from "react";
import { AnimatedNumber } from "@/components/animated-number";
import { ChapterNav } from "@/components/chapter-nav";
import { BoxIcon } from "@/components/art/box-icon";
import { Staircase } from "@/components/art/staircase";
import { Delta, EntryItem } from "@/components/entry-item";
import { FollowLinks } from "@/components/follow-links";
import { HeroAvatar } from "@/components/hero-avatar";
import { HowSection } from "@/components/how-section";
import { PlanBoard } from "@/components/plan-board";
import { Reveal } from "@/components/reveal";
import { ProjectCard } from "@/components/project-card";
import { EpisodesView } from "@/components/episodes-view";
import { QuarterPlanView } from "@/components/quarter-plan-view";
import { QUARTER_PLANS } from "@/lib/quarter-plan";
import { Terminal } from "@/components/terminal";
import { YearGrid, type DayActivity } from "@/components/year-grid";
import { YouTubeIcon } from "@/components/youtube-icon";
import { CREATOR, lineOfTheDay } from "@/lib/creator";
import { type Entry, type Journey } from "@/lib/journey";
import { GOAL, QUARTERS, YEAR, focusQuarter, formatEGP, isQuarterOpen, now, paceFor, stepFor } from "@/lib/year";

const ORDINALS = ["الأول", "التاني", "التالت", "الرابع", "الخامس", "السادس"];
const OPENS = ["١ يناير", "١ أبريل", "١ يوليو", "١ أكتوبر"];

/** بيقسّم اليوميات (من الأقدم للأحدث): قبل السنة، كل ربع لوحده، وبعد السنة. */
function groupEntries(entries: Entry[]) {
  const groups = { prep: [] as Entry[], quarters: [[], [], [], []] as Entry[][], after: [] as Entry[] };
  for (const e of [...entries].reverse()) {
    const d = new Date(e.happened_on);
    const y = d.getUTCFullYear();
    if (y < YEAR) groups.prep.push(e);
    else if (y > YEAR) groups.after.push(e);
    else groups.quarters[Math.floor(d.getUTCMonth() / 3)].push(e);
  }
  return groups;
}

function GroupHeader({ title, sub }: { title: string; sub?: string }) {
  return (
    <li className="relative pb-8">
      <span className="absolute top-2 -right-[31px] size-4 rounded-full border-2 border-muted bg-background" aria-hidden />
      <Reveal>
        <h3 className="text-lg font-black text-muted">{title}</h3>
        {sub && <p className="text-xs text-muted">{sub}</p>}
      </Reveal>
    </li>
  );
}

function Chapter({ n, title, sub }: { n: string; title: string; sub?: string }) {
  return (
    <Reveal className="mb-10 text-center">
      <p className="text-xs font-bold tracking-widest text-gold">الفصل {n}</p>
      <h2 className="mt-2 text-3xl font-black">{title}</h2>
      {sub && <p className="mt-1 text-muted">{sub}</p>}
    </Reveal>
  );
}

/** القصة: من غير ما تقرا الداتابيز، عشان تتعرض بأي رحلة. */
export function JourneyView({ journey, episodeLinks = {} }: { journey: Journey; episodeLinks?: Record<string, string> }) {
  const pct = Math.max(0, Math.min(100, (journey.balance / GOAL) * 100));
  const target = GOAL / CREATOR.start;
  const pace = paceFor(journey.balance);
  const todayLine = lineOfTheDay();
  const { stats } = journey;
  const hasPlan = !!journey.answer.trim();
  const personalProjects = journey.projects.filter((p) => p.kind === "mine");
  const bySlug = new Map(personalProjects.map((p) => [p.slug, p]));
  // مشروع الربع ده بس اللي بيظهر، والباقي بأساميهم في الطابور
  const focusQ = QUARTERS[focusQuarter() - 1];
  const focus = bySlug.get(focusQ.project);
  const upcoming = QUARTERS.filter((x) => x.q > focusQ.q && bySlug.has(x.project));
  const groups = groupEntries(journey.entries);
  const projectOf = new Map(journey.projects.map((p) => [p.id, { slug: p.slug, name: p.name }]));
  const chapters = ["progress", hasPlan && "plan", "how", personalProjects.length > 0 && "projects", "story"].filter(Boolean);
  const chapterOf = (key: string) => ORDINALS[chapters.indexOf(key)];
  // المكان اللي شغال فيه دلوقتي (أول مشروع متعلّم "بشتغل فيها")
  const workplace = journey.projects.find((p) => p.kind === "work");
  // كل يوم اتنشر فيه حاجة: عدد الحاجات وصافي الفلوس، لجدول السنة
  const activity: Record<string, DayActivity> = {};
  for (const e of journey.entries) {
    const day = (activity[e.happened_on] ??= { count: 0, amount: 0 });
    day.count += 1;
    day.amount += e.amount;
  }

  return (
    <main className="money-glow flex-1 overflow-x-clip">
      <ChapterNav
        items={[
          { id: "progress", label: "وصل لفين" },
          ...(hasPlan ? [{ id: "plan", label: "الخطة" }] : []),
          { id: "how", label: "إزاي" },
          ...(personalProjects.length > 0 ? [{ id: "projects", label: focus ? "المشروع" : "المشاريع" }] : []),
          { id: "story", label: "اللي حصل" },
        ]}
      />
      <div className="mx-auto max-w-2xl px-5">
        {/* المقدمة */}
        <section id="top" className="flex flex-col items-center pt-10 text-center sm:pt-16">
          {workplace && (
            <Link
              href={`/p/${workplace.slug}`}
              className="mb-8 inline-flex items-center gap-2 rounded-full border border-border bg-surface/80 px-4 py-2 text-sm backdrop-blur transition hover:border-green/50"
            >
              <span className="relative flex size-2.5">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-green opacity-75" />
                <span className="relative inline-flex size-2.5 rounded-full bg-green" />
              </span>
              <span className="text-muted">شغال دلوقتي:</span>
              <span className="font-bold">
                {CREATOR.role} في {workplace.name}
              </span>
            </Link>
          )}
          <HeroAvatar cheers={journey.cheers} />
          <h1 className="mt-8 text-4xl leading-[1.35] font-black sm:text-5xl">
            {CREATOR.name}، {CREATOR.age} سنة، {CREATOR.role}.
            <br />
            معاه {formatEGP(CREATOR.start)} جنيه.
            <br />
            <span className="text-gold">وهيحوّلهم مليون.</span>
          </h1>
          <p className="mt-5 max-w-lg text-lg text-muted">{CREATOR.tagline}</p>
          <div className="mt-8">
            <FollowLinks primaryOnly />
          </div>

          {/* جملة النهارده: سطر هادي تحت المقدمة */}
          <div className="mt-12 w-full rounded-2xl border border-gold/20 bg-gold/5 px-5 py-4">
            <p className="text-[11px] font-bold tracking-widest text-gold">جملة النهارده</p>
            <p className="hand mt-1 text-2xl leading-relaxed sm:text-3xl">“{todayLine}”</p>
          </div>
          <p className="mt-6 flex items-center justify-center gap-2 text-sm text-muted">
            <YouTubeIcon className="size-5 shrink-0 text-gold" />
            <span>فيديو على يوتيوب كل أسبوع</span>
          </p>
        </section>

        {/* وصل لفين: الفلوس والوقت */}
        <section id="progress" className="mt-20 scroll-mt-20">
          <Chapter n={chapterOf("progress")} title="وصل لفين؟" />

          <Reveal>
            <div className="rounded-3xl border border-border bg-gradient-to-b from-surface-2 to-surface p-6">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-sm text-muted">معاه دلوقتي</p>
                  <p className="mt-1 text-5xl font-black text-gold">
                    <AnimatedNumber value={journey.balance} />
                  </p>
                  <p className="mt-1 text-sm text-muted">بدأ بـ {formatEGP(CREATOR.start)} جنيه</p>
                </div>
                <div className="text-left">
                  <p className="text-3xl font-black text-gold" dir="ltr">
                    ×{journey.multiple.toFixed(1)}
                  </p>
                  <p className="text-xs text-muted">الهدف ×{target}</p>
                </div>
              </div>
              <div className="mt-6 h-3 overflow-hidden rounded-full bg-background">
                <div className="h-full rounded-full bg-gradient-to-l from-gold to-green transition-all duration-1000" style={{ width: `${Math.max(pct, 1.5)}%` }} />
              </div>
              <div className="mt-2 flex justify-between text-xs text-muted" dir="ltr">
                <span>{formatEGP(CREATOR.start / 1000)}K</span>
                <span className="font-bold text-green">{pct.toFixed(pct < 10 ? 1 : 0)}%</span>
                <span>1M</span>
              </div>
            </div>
          </Reveal>

          <div className="mt-10">
            <Staircase step={stepFor(journey.balance)} />
          </div>

          <Reveal className="mt-16 mb-6 text-center">
            <h3 className="text-xl font-black">والوقت: {YEAR} يوم يوم</h3>
          </Reveal>
          <Reveal>
            <YearGrid activity={activity} />
          </Reveal>
        </section>

        {/* الخطة */}
        {hasPlan && (
          <section id="plan" className="mt-20 scroll-mt-20">
            <Chapter n={chapterOf("plan")} title="الخطة" sub="هعمل إيه عشان أوصل للمليون." />
            <PlanBoard answer={journey.answer} />
            {focus && QUARTER_PLANS[focus.slug] && (
              <QuarterPlanView
                quarter={{ q: focusQ.q, months: focusQ.months, year: YEAR }}
                project={focus.name}
                copy={QUARTER_PLANS[focus.slug]}
              />
            )}
            {focus && QUARTER_PLANS[focus.slug] && (
              <EpisodesView year={YEAR} q={focusQ.q} videos={QUARTER_PLANS[focus.slug].videos} links={episodeLinks} at={now()} />
            )}
          </section>
        )}

        {/* إزاي هيحصل */}
        <section id="how" className="mt-20 scroll-mt-20">
          <Chapter n={chapterOf("how")} title="إزاي هيحصل؟" sub="مش حظ. دي الطريقة والعدّة." />
          <HowSection
            terminal={
              <Terminal
                prompt={CREATOR.handle + "@1m:~$"}
                command="./progress --live"
                output={[
                  { key: "start", value: formatEGP(CREATOR.start) + " EGP", tone: "muted" },
                  { key: "balance", value: formatEGP(journey.balance) + " EGP  (x" + journey.multiple.toFixed(1) + ")" },
                  { key: "target", value: formatEGP(GOAL) + " EGP  (x" + target + ")", tone: "muted" },
                  { key: "remaining", value: formatEGP(pace.remaining) + " EGP", tone: pace.remaining ? "red" : "green" },
                  { key: "wins/falls", value: stats.wins + " / " + stats.falls, tone: "green" },
                  { key: "status", value: pace.remaining ? "running... 🔥" : "DONE ✅", tone: pace.remaining ? "green" : "gold" },
                ]}
              />
            }
          />
        </section>

        {/* المشاريع: على الموبايل بتتقلب بالعرض، وعلى الكبير جنب بعض */}
        {focus ? (
          <section id="projects" className="mt-20 scroll-mt-20">
            <Chapter n={chapterOf("projects")} title="مشروع الربع ده" sub="٣ شهور على مشروع واحد بس. كل الشغل هنا لحد ما الربع يخلص." />
            <Reveal>
              <p className="mb-3 text-center text-sm">
                <span className="font-black text-gold">Q{focusQ.q}</span>
                <span className="text-muted">
                  {" "}
                  · {focusQ.months} {YEAR}
                </span>
              </p>
              <ProjectCard project={focus} />
              {upcoming.length > 0 && (
                <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-sm text-muted">
                  <span>بعده:</span>
                  {upcoming.map((x) => (
                    <span key={x.q} className="rounded-full border border-border px-3 py-1">
                      🔒 {bySlug.get(x.project)!.name} <span className="text-xs">· Q{x.q}</span>
                    </span>
                  ))}
                </div>
              )}
            </Reveal>
          </section>
        ) : personalProjects.length > 0 && (
          <section id="projects" className="mt-20 scroll-mt-20">
            <Chapter n={chapterOf("projects")} title="المشاريع" sub="كل مشروع قصة لوحده. دوس على أي واحد وشوف قصته." />
            <Reveal>
              <div className="-mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-4 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0">
                {personalProjects.map((p) => (
                  <div key={p.id} className="w-[85%] shrink-0 snap-center sm:w-auto">
                    <ProjectCard project={p} />
                  </div>
                ))}
              </div>
              <p className="mt-2 text-center text-xs text-muted sm:hidden">← اسحب عشان تشوف الباقي →</p>
            </Reveal>
          </section>
        )}

        {/* اللي حصل: ربع ربع، من الأول للآخر */}
        <section id="story" className="mt-20 scroll-mt-20">
          <Chapter n={chapterOf("story")} title="اللي حصل" sub="من الأول للآخر، ربع ربع." />

          {journey.entries.length > 0 && (
            <Reveal className="mb-12 grid grid-cols-4 gap-2 text-center">
              {[
                { n: stats.steps, label: "خطوة", icon: "👣" },
                { n: stats.wins, label: "مكسب", icon: "💰" },
                { n: stats.falls, label: "وقعة", icon: "🤕" },
                { n: stats.lessons, label: "درس", icon: "💡" },
              ].map((s) => (
                <div key={s.label} className="rounded-2xl border border-border bg-surface py-4">
                  <p className="text-xl">{s.icon}</p>
                  <p className="mt-1 text-2xl font-black tabular-nums">{s.n}</p>
                  <p className="text-xs text-muted">{s.label}</p>
                </div>
              ))}
              {stats.bestWin > 0 && (
                <p className="col-span-4 mt-2 text-sm text-muted">
                  أكبر مكسب مرة واحدة: <span className="font-black text-green">+{formatEGP(stats.bestWin)} جنيه</span>
                </p>
              )}
            </Reveal>
          )}

          <ol className="relative border-r-2 border-border pr-6">
            {/* أول القصة */}
            <li className="relative pb-12">
              <span
                className="absolute top-1 -right-[35px] flex size-8 items-center justify-center rounded-full border-2 border-gold bg-gold/15 text-base"
                aria-hidden
              >
                🏁
              </span>
              <Reveal>
                <p className="text-xs text-muted">البداية</p>
                <h3 className="mt-1 text-xl font-black">
                  {CREATOR.age} سنة و{formatEGP(CREATOR.start)} جنيه
                </h3>
                {journey.entries.length === 0 && <p className="mt-2 text-muted">{CREATOR.emptyLog}</p>}
              </Reveal>
            </li>

            {groups.prep.length > 0 && (
              <>
                <GroupHeader title="التحضير" sub={`قبل ١ يناير ${YEAR}`} />
                {groups.prep.map((e, i) => (
                  <EntryItem key={e.id} entry={e} index={i} project={projectOf.get(e.project_id ?? -1)} />
                ))}
              </>
            )}

            {QUARTERS.map(({ q, label, months, project }, i) => {
              const open = isQuarterOpen(q);
              const items = groups.quarters[i];
              const net = journey.byQuarter[i];
              return (
                <Fragment key={q}>
                  <li className="relative pt-2 pb-10">
                    <span className="absolute -top-1 -right-[52px]" aria-hidden>
                      <BoxIcon state={net > 0 ? "done" : open ? "open" : "locked"} width={58} />
                    </span>
                    <Reveal className={`pr-6 ${open ? "" : "opacity-50"}`}>
                      <p className="text-xs text-muted">
                        {months} {YEAR}
                      </p>
                      <h3 className="mt-1 text-2xl font-black">
                        <span className="text-gold">Q{q}</span> · {label}
                      </h3>
                      {bySlug.has(project) && <p className="text-sm font-bold">{bySlug.get(project)!.name}</p>}
                      <p className="mt-1 text-sm">
                        {!open ? (
                          <span className="text-muted">🔒 يفتح {OPENS[i]}</span>
                        ) : net !== 0 ? (
                          <>
                            <span className="text-muted">صافي الربع: </span>
                            <Delta amount={net} />
                          </>
                        ) : items.length === 0 ? (
                          <span className="text-muted">لسه مفيش حاجة في الربع ده.</span>
                        ) : null}
                      </p>
                    </Reveal>
                  </li>
                  {items.map((e, j) => (
                    <EntryItem key={e.id} entry={e} index={j} project={projectOf.get(e.project_id ?? -1)} />
                  ))}
                </Fragment>
              );
            })}

            {groups.after.length > 0 && (
              <>
                <GroupHeader title={`بعد ${YEAR}`} />
                {groups.after.map((e, i) => (
                  <EntryItem key={e.id} entry={e} index={i} project={projectOf.get(e.project_id ?? -1)} />
                ))}
              </>
            )}
          </ol>
        </section>

        {/* يتبع */}
        <section className="mt-20 pb-24 text-center">
          <Reveal>
            <p className="hand text-5xl text-gold">يتبع...</p>
            <p className="mt-6 text-xl font-black">عاوز تعرف هيوصل ولا لأ؟</p>
            <div className="mt-6">
              <FollowLinks />
            </div>
          </Reveal>
        </section>
      </div>
    </main>
  );
}
