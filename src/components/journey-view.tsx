import Link from "next/link";
import { Fragment } from "react";
import { AnimatedNumber } from "@/components/animated-number";
import { BoxIcon } from "@/components/art/box-icon";
import { Staircase } from "@/components/art/staircase";
import { CountdownInline } from "@/components/countdown-inline";
import { Delta, EntryItem } from "@/components/entry-item";
import { FollowLinks } from "@/components/follow-links";
import { HeroAvatar } from "@/components/hero-avatar";
import { HowSection } from "@/components/how-section";
import { PlanBoard } from "@/components/plan-board";
import { Reveal } from "@/components/reveal";
import { ProjectCard } from "@/components/project-card";
import { Terminal } from "@/components/terminal";
import { YearGrid, type DayActivity } from "@/components/year-grid";
import { CREATOR, lineOfTheDay } from "@/lib/creator";
import { type Entry, type Journey } from "@/lib/journey";
import { GOAL, QUARTERS, YEAR, formatEGP, isQuarterOpen, paceFor, stepFor } from "@/lib/year";

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
export function JourneyView({ journey }: { journey: Journey }) {
  const pct = Math.max(0, Math.min(100, (journey.balance / GOAL) * 100));
  const target = GOAL / CREATOR.start;
  const pace = paceFor(journey.balance);
  const todayLine = lineOfTheDay();
  const { stats } = journey;
  const hasPlan = !!journey.answer || journey.steps.length > 0;
  const groups = groupEntries(journey.entries);
  const projectOf = new Map(journey.projects.map((p) => [p.id, { slug: p.slug, name: p.name }]));
  const chapters = ["progress", hasPlan && "plan", "how", journey.projects.length > 0 && "projects", "story"].filter(Boolean);
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
      <div className="mx-auto max-w-2xl px-5">
        {/* المقدمة */}
        <section className="flex flex-col items-center pt-10 text-center sm:pt-16">
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
            <FollowLinks />
          </div>
        </section>

        {/* وصل لفين */}
        <section className="mt-24">
          <Chapter n={chapterOf("progress")} title="وصل لفين؟" />
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 text-center">
            <div>
              <p className="text-sm text-muted">بدأ بـ</p>
              <p className="mt-1 text-2xl font-black text-muted sm:text-3xl">{formatEGP(CREATOR.start)}</p>
            </div>
            <span className="text-3xl text-muted/50">←</span>
            <div>
              <p className="text-sm text-muted">معاه دلوقتي</p>
              <p className="mt-1 text-4xl font-black text-gold sm:text-5xl">
                <AnimatedNumber value={journey.balance} />
              </p>
            </div>
          </div>
          <p className="mt-6 text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-4 py-1.5">
              <span className="text-2xl font-black text-gold">×{journey.multiple.toFixed(1)}</span>
              <span className="text-sm text-muted">
                من ×{target} · {pct.toFixed(pct < 10 ? 1 : 0)}% من المليون
              </span>
            </span>
          </p>
          <div className="mt-12">
            <Staircase step={stepFor(journey.balance)} />
          </div>
          <div className="mt-4 text-center">
            <CountdownInline />
          </div>

          <Reveal className="mt-14">
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
          </Reveal>
        </section>

        {/* جملة النهارده */}
        <section className="mt-28">
          <Reveal className="text-center">
            <p className="text-xs font-bold tracking-widest text-gold">جملة النهارده</p>
            <p className="hand mx-auto mt-4 max-w-md text-4xl leading-[1.6] sm:text-5xl">“{todayLine}”</p>
          </Reveal>
        </section>

        {/* السنة: ٣٦٥ مربع */}
        <section className="mt-28">
          <Reveal className="mb-10 text-center">
            <h2 className="text-3xl font-black">السنة فيها ٣٦٥ يوم</h2>
            <p className="mt-1 text-muted">ودي {YEAR}، يوم يوم.</p>
          </Reveal>
          <Reveal>
            <YearGrid activity={activity} />
          </Reveal>
        </section>

        {/* الخطة */}
        {hasPlan && (
          <section className="mt-28">
            <Chapter n={chapterOf("plan")} title="الخطة" sub="هعمل إيه عشان أوصل للمليون." />
            <PlanBoard answer={journey.answer} steps={journey.steps} projects={journey.projects} />
          </section>
        )}

        {/* إزاي هيحصل */}
        <section className="mt-28">
          <Chapter n={chapterOf("how")} title="إزاي هيحصل؟" sub="مش حظ. دي الطريقة والعدّة." />
          <HowSection />
        </section>

        {/* المشاريع: على الموبايل بتتقلب بالعرض، وعلى الكبير جنب بعض */}
        {journey.projects.length > 0 && (
          <section className="mt-28">
            <Chapter n={chapterOf("projects")} title="المشاريع" sub="كل مشروع قصة لوحده. دوس على أي واحد وشوف قصته." />
            <Reveal>
              <div className="-mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-4 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0">
                {journey.projects.map((p) => (
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
        <section className="mt-28">
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

            {QUARTERS.map(({ q, label, months }, i) => {
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
        <section className="mt-28 pb-28 text-center">
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
