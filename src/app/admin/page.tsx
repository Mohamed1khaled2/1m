import Link from "next/link";
import { logout } from "@/app/admin/actions";
import { loadStyleSamples } from "@/app/admin/ai-actions";
import { AdminTabs } from "@/components/admin/admin-tabs";
import { CheersList, type Cheer } from "@/components/admin/cheers-list";
import { DeleteButton } from "@/components/admin/delete-button";
import { EntryForm } from "@/components/admin/entry-form";
import { PlanForm } from "@/components/admin/plan-form";
import { ProjectsAdmin } from "@/components/admin/projects-admin";
import { VideoAssistant } from "@/components/admin/video-assistant";
import { requireAdmin } from "@/lib/admin-auth";
import { KINDS, loadJourney } from "@/lib/journey";
import { createAdminClient } from "@/lib/supabase/server";
import { formatEGP } from "@/lib/year";

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
                  <EntryForm projects={journey.projects.map((p) => ({ id: p.id, name: p.name }))} />

                  <div className="mt-14">
                    <Intro title={`اللي نشرته (${journey.entries.length})`} text="لو كتبت حاجة غلط امسحها من هنا." />
                    {journey.entries.length === 0 ? (
                      <p className="text-muted">لسه ما نشرتش حاجة.</p>
                    ) : (
                      <ul className="divide-y divide-border rounded-2xl border border-border bg-surface px-4">
                        {journey.entries.map((e) => (
                          <li key={e.id} className="flex items-center justify-between gap-3 py-3">
                            <div className="min-w-0">
                              <p className="text-xs text-muted">
                                {KINDS[e.kind].icon} {e.happened_on}
                                {e.amount !== 0 && (
                                  <span className={`mr-2 font-bold ${e.amount > 0 ? "text-green" : "text-red-400"}`} dir="ltr">
                                    {e.amount > 0 ? "+" : "−"}
                                    {formatEGP(Math.abs(e.amount))}
                                  </span>
                                )}
                              </p>
                              <p className="truncate font-bold">{e.title}</p>
                            </div>
                            <DeleteButton id={e.id} />
                          </li>
                        ))}
                      </ul>
                    )}
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
                  <PlanForm initialAnswer={journey.answer} initialSteps={journey.steps} />
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
