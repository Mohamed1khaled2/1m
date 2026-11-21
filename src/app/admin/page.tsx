import Link from "next/link";
import { logout } from "@/app/admin/actions";
import { loadStyleSamples } from "@/app/admin/ai-actions";
import { AdminTabs } from "@/components/admin/admin-tabs";
import { CheersList, type Cheer } from "@/components/admin/cheers-list";
import { EntriesList } from "@/components/admin/entries-list";
import { EntryForm } from "@/components/admin/entry-form";
import { PlanForm } from "@/components/admin/plan-form";
import { ProjectsAdmin } from "@/components/admin/projects-admin";
import { VideoAssistant } from "@/components/admin/video-assistant";
import { requireAdmin } from "@/lib/admin-auth";
import { loadJourney } from "@/lib/journey";
import { createAdminClient } from "@/lib/supabase/server";
import { loadEpisodeLinks } from "@/lib/episodes";
import { QUARTER_PLANS, weekOfQuarter } from "@/lib/quarter-plan";
import { QUARTERS, YEAR, focusQuarter, formatEGP, now } from "@/lib/year";

export const metadata = { robots: { index: false } };

function Intro({ title, text }: { title: string; text: string }) {
  return (
    <div className="mb-6">
      <h2 className="text-xl font-black">{title}</h2>
      <p className="mt-1 text-sm text-muted">{text}</p>
    </div>
  );
}

export default async function AdminPage() {
  await requireAdmin();
  const journey = await loadJourney();
  // لو جدول settings لسه مااتعملش، الأسلوب بيبدأ فاضي بدل ما الصفحة تقع
  const style = await loadStyleSamples().catch(() => "");
  const { data: cheers } = await createAdminClient()
    .from("cheers")
    .select("id, name, created_at")
    .order("created_at", { ascending: false })
    .limit(100);
  // مشروع الربع ده: اليوميات بتتربط بيه لوحدها، وخطة الربع بتتعمل عليه
  const focusQ = QUARTERS[focusQuarter() - 1];
  const focus = journey.projects.find((p) => p.slug === focusQ.project);
  const episodeLinks = await loadEpisodeLinks(focusQ.project);

  return (
    <main className="money-glow flex-1">
      <div className="mx-auto max-w-2xl px-5 pt-6 pb-24">
        <header className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold text-gold">الأدمن</p>
            <p className="text-2xl font-black">
              {formatEGP(journey.balance)} <span className="text-sm font-normal text-muted">
                جنيه · <span dir="ltr">×{journey.multiple.toFixed(1)}</span>
              </span>
            </p>
            {focus && (
              <p className="mt-1 text-sm">
                <span className="text-muted">الربع ده: </span>
                <span className="font-black text-gold">{focus.name}</span>
                <span className="text-muted">
                  {" "}
                  · Q{focusQ.q} · {focusQ.months}
                </span>
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <Link href="/" className="btn-ghost">
              الموقع ↗
            </Link>
            <form action={logout}>
              <button className="btn-ghost">خروج</button>
            </form>
          </div>
        </header>

        <AdminTabs
          tabs={[
            {
              key: "publish",
              label: "انشر",
              icon: "✍️",
              content: (
                <>
                  <Intro title="حصل إيه النهارده؟" text="بيظهر للناس في القصة على طول، والمبلغ بيزوّد أو ينقّص الرصيد." />
                  <EntryForm projects={journey.projects.map((p) => ({ id: p.id, name: p.name }))} defaultProjectId={focus?.id} />

                  <div className="mt-14">
                    <Intro title={`اللي نشرته (${journey.entries.length})`} text="عدّل أي حاجة أو امسحها من هنا، والتعديل بيبان في الموقع على طول." />
                    <EntriesList entries={journey.entries} projects={journey.projects.map((p) => ({ id: p.id, name: p.name }))} />
                  </div>
                </>
              ),
            },
            {
              key: "director",
              label: "المخرج",
              icon: "🎥",
              content: (
                <>
                  <Intro title="المخرج" text="قوله الفكرة، وهو يعملك الفيديو كامل. عارف قصتك وعدّتك من الموقع. ببلاش بـ Gemini." />
                  <VideoAssistant
                    entries={journey.entries.slice(0, 40).map((e) => ({ id: e.id, title: e.title, happened_on: e.happened_on }))}
                    initialStyle={style}
                    quarter={
                      focus && QUARTER_PLANS[focus.slug]
                        ? {
                            slug: focus.slug,
                            links: episodeLinks,
                            project: focus.name,
                            q: focusQ.q,
                            current: weekOfQuarter(YEAR, focusQ.q, now()),
                            videos: QUARTER_PLANS[focus.slug].videos,
                          }
                        : undefined
                    }
                  />
                </>
              ),
            },
            {
              key: "projects",
              label: "المشاريع",
              icon: "📦",
              badge: journey.projects.length,
              content: (
                <>
                  <Intro title="المشاريع" text="كل مشروع قصة نجاح لوحده. غيّر المرحلة بدوسة، والناس بتشوفها على طول." />
                  <ProjectsAdmin projects={journey.projects} />
                </>
              ),
            },
            {
              key: "plan",
              label: "الخطة",
              icon: "🗺️",
              content: (
                <>
                  <Intro title="الخطة" text="الإجابة والخطوات. علّم على الخطوة لما تخلّصها." />
                  <PlanForm
                    initialAnswer={journey.answer}
                    initialSteps={journey.steps}
                    quarter={focus && { q: focusQ.q, months: focusQ.months, year: YEAR, name: focus.name }}
                  />
                </>
              ),
            },
            {
              key: "cheers",
              label: "عاش",
              icon: "❤️",
              badge: journey.cheers,
              content: (
                <>
                  <Intro title="اللي قالوا عاش" text="لو في اسم مش لطيف امسحه، وهيختفي من الموقع على طول." />
                  <CheersList cheers={(cheers ?? []) as Cheer[]} />
                </>
              ),
            },
          ]}
        />
      </div>
    </main>
  );
}
