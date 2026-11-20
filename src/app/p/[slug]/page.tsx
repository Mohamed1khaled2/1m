import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { BrowserFrame } from "@/components/browser-frame";
import { Delta, EntryItem } from "@/components/entry-item";
import { FollowLinks } from "@/components/follow-links";
import { ProjectDetails } from "@/components/project-details";
import { Reveal } from "@/components/reveal";
import { StageTrack } from "@/components/stage-track";
import { coverOf } from "@/lib/covers";
import { CREATOR } from "@/lib/creator";
import { STAGES, loadProject } from "@/lib/journey";
import { PROJECT_DETAILS } from "@/lib/project-details";

export const dynamic = "force-dynamic";

const getProject = cache(loadProject);

export async function generateMetadata({ params }: PageProps<"/p/[slug]">): Promise<Metadata> {
  const data = await getProject((await params).slug);
  if (!data) return {};
  return {
    title: `${data.project.name} — من قصة ${CREATOR.name} للمليون`,
    description: data.project.tagline || undefined,
  };
}

/** قصة مشروع واحد: وصل لأنهي مرحلة، جاب كام، وكل اللي حصل فيه من الأول. */
export default async function ProjectPage({ params }: PageProps<"/p/[slug]">) {
  const data = await getProject((await params).slug);
  if (!data) notFound();
  const { project: p, entries } = data;
  const stage = STAGES.find((s) => s.key === p.stage)!;
  const cover = coverOf(p.slug);
  // المكان اللي بيشتغل فيه مالوش مراحل منتج
  const work = p.kind === "work";
  const details = PROJECT_DETAILS[p.slug];

  return (
    <main className="money-glow flex-1 overflow-x-clip">
      <div className="mx-auto max-w-2xl px-5 pt-8 pb-28">
        <Link href="/" className="text-sm text-muted hover:text-foreground">
          → قصة {CREATOR.name} للمليون
        </Link>

        <header className="mt-10 text-center">
          <p className="text-xs font-bold tracking-widest text-gold">{work ? `💼 بشتغل فيها ${CREATOR.role}` : "مشروع"}</p>
          <h1 className="mt-2 text-4xl font-black sm:text-5xl">{p.name}</h1>
          {p.tagline && <p className="mx-auto mt-3 max-w-md text-lg text-muted">{p.tagline}</p>}
          {p.url && (
            <a
              href={p.url}
              target="_blank"
              rel="noopener noreferrer"
              dir="ltr"
              className="mt-4 inline-block text-sm font-bold text-gold hover:underline"
            >
              {p.url.replace(/^https?:\/\//, "").replace(/\/$/, "")} ↗
            </a>
          )}
        </header>

        {cover && (
          <div className="relative mt-10">
            <div className="pointer-events-none absolute inset-x-10 -top-6 -bottom-6 rounded-full bg-gold/15 blur-3xl" />
            <BrowserFrame src={cover} url={p.url} alt={p.name} priority className="relative -rotate-1" />
          </div>
        )}

        {work ? (
          p.earned !== 0 && (
            <section className="mt-12 rounded-2xl border border-border bg-surface p-5 text-center">
              <p className="text-sm text-muted">دخل من الشغل لحد دلوقتي</p>
              <Delta amount={p.earned} className="mt-1 block text-3xl" />
            </section>
          )
        ) : (
          <section className="mt-12 rounded-2xl border border-border bg-surface p-5">
            <StageTrack stage={p.stage} size="lg" />
            {p.earned !== 0 && (
              <p className="mt-4 text-sm text-muted">
                جاب لحد دلوقتي: <Delta amount={p.earned} className="text-lg" /> جنيه
              </p>
            )}
          </section>
        )}

        {details && (
          <div className="mt-20">
            <ProjectDetails details={details} name={p.name} />
          </div>
        )}

        <section className="mt-20">
          <Reveal className="mb-10 text-center">
            <h2 className="text-3xl font-black">{work ? "شغلي فيها" : "قصته"}</h2>
            <p className="mt-1 text-muted">من الأول للآخر.</p>
          </Reveal>

          {entries.length === 0 ? (
            <p className="text-center text-muted">
              {work
                ? "أول ما أنشر حاجة عن شغلي هنا هتلاقيها."
                : `لسه في مرحلة ${stage.icon} ${stage.label}. أول ما يحصل فيه حاجة هتلاقيها هنا.`}
            </p>
          ) : (
            <ol className="relative border-r-2 border-border pr-6">
              {entries.map((e, i) => (
                <EntryItem key={e.id} entry={e} index={i} />
              ))}
            </ol>
          )}
        </section>

        <section className="mt-20 text-center">
          <p className="hand text-4xl text-gold">يتبع...</p>
          <div className="mt-6">
            <FollowLinks />
          </div>
        </section>
      </div>
    </main>
  );
}
