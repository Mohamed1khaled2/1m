import Link from "next/link";
import { logout } from "@/app/admin/actions";
import { CheersList, type Cheer } from "@/components/admin/cheers-list";
import { DeleteButton } from "@/components/admin/delete-button";
import { EntryForm } from "@/components/admin/entry-form";
import { PlanForm } from "@/components/admin/plan-form";
import { ProjectsAdmin } from "@/components/admin/projects-admin";
import { VideoAssistant } from "@/components/admin/video-assistant";
import { loadStyleSamples } from "@/app/admin/ai-actions";
import { requireAdmin } from "@/lib/admin-auth";
import { KINDS, loadJourney } from "@/lib/journey";
import { createAdminClient } from "@/lib/supabase/server";
import { formatEGP } from "@/lib/year";

export const metadata = { robots: { index: false } };

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
        <header className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gold">الأدمن</p>
            <p className="text-2xl font-black">
              {formatEGP(journey.balance)} <span className="text-sm text-muted">جنيه معايا · ×{journey.multiple.toFixed(1)}</span>
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/" className="btn-ghost">
              شوف الموقع
            </Link>
            <form action={logout}>
              <button className="btn-ghost">خروج</button>
            </form>
          </div>
        </header>

        <section className="mt-12">
          <h2 className="mb-1 text-xl font-black">
            عاش ❤️ <span className="text-sm font-normal text-muted">({journey.cheers})</span>
          </h2>
          <p className="mb-5 text-sm text-muted">آخر اللي قالوا عاش. لو في اسم مش لطيف امسحه.</p>
          <CheersList cheers={(cheers ?? []) as Cheer[]} />
        </section>

        <section className="mt-16">
          <h2 className="mb-1 text-xl font-black">🎬 مساعد الفيديوهات</h2>
          <p className="mb-5 text-sm text-muted">عارف قصتك كلها من الموقع، وبيكتب بأسلوبك. ببلاش بـ Gemini.</p>
          <VideoAssistant
            entries={journey.entries.slice(0, 40).map((e) => ({ id: e.id, title: e.title, happened_on: e.happened_on }))}
            initialStyle={style}
          />
        </section>

        <section className="mt-16">
          <h2 className="mb-1 text-xl font-black">اكتب حاجة جديدة</h2>
          <p className="mb-5 text-sm text-muted">بتظهر للناس في القصة على طول. المبلغ بيزوّد أو ينقّص الرصيد.</p>
          <EntryForm projects={journey.projects.map((p) => ({ id: p.id, name: p.name }))} />
        </section>

        <section className="mt-16">
          <h2 className="mb-1 text-xl font-black">المشاريع</h2>
          <p className="mb-5 text-sm text-muted">كل مشروع قصة نجاح لوحده. غيّر المرحلة بدوسة، والناس بتشوفها على طول.</p>
          <ProjectsAdmin projects={journey.projects} />
        </section>

        <section className="mt-16">
          <h2 className="mb-6 text-xl font-black">الخطة</h2>
          <PlanForm initialAnswer={journey.answer} initialSteps={journey.steps} />
        </section>

        <section className="mt-16">
          <h2 className="text-xl font-black">اللي نشرته ({journey.entries.length})</h2>
          <p className="mb-4 text-sm text-muted">ده اللي ظاهر للناس في فصل &quot;اللي حصل&quot;. لو كتبت حاجة غلط امسحها من هنا.</p>
          {journey.entries.length === 0 ? (
            <p className="text-muted">لسه ما نشرتش حاجة. اكتب أول حاجة من الفورم اللي فوق.</p>
          ) : (
            <ul className="divide-y divide-border">
              {journey.entries.map((e) => (
                <li key={e.id} className="flex items-start justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="text-xs text-muted">
                      {KINDS[e.kind].icon} {e.happened_on}
                      {e.amount !== 0 && (
                        <span className={`mr-2 font-bold ${e.amount > 0 ? "text-green" : "text-red-400"}`}>
                          {e.amount > 0 ? "+" : "−"}
                          {formatEGP(Math.abs(e.amount))}
                        </span>
                      )}
                    </p>
                    <p className="truncate font-bold">{e.title}</p>
                  </div>
                  <DeleteButton id={e.id} title={e.title} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
