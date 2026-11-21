import { CREATOR } from "@/lib/creator";
import { createAdminClient } from "@/lib/supabase/server";
import { YEAR } from "@/lib/year";

export type Step = { id: string; text: string; done: boolean; kind?: "milestone" | "ongoing" };

export type EntryKind = "step" | "money" | "fail" | "lesson";

export type Entry = {
  id: number;
  happened_on: string;
  kind: EntryKind;
  title: string;
  body: string;
  amount: number;
  video_url: string | null;
  /** روابط توثيق (يوتيوب، إنستجرام، تيك توك...) */
  links: string[];
  project_id: number | null;
};

export type Stage = "idea" | "building" | "ready" | "launched" | "earning" | "sold";

export type Project = {
  id: number;
  slug: string;
  name: string;
  tagline: string;
  url: string | null;
  stage: Stage;
  kind: "mine" | "work";
  /** صافي الفلوس اللي جت من المشروع ده (من اليوميات المربوطة بيه) */
  earned: number;
  entries: number;
};

export type Journey = {
  answer: string;
  steps: Step[];
  entries: Entry[];
  projects: Project[];
  /** كام واحد قال "عاش" */
  cheers: number;
  /** آخر اللي قالوا عاش (فاضي = مشجّع) */
  recentCheers: string[];
  /** معايا كام دلوقتي: فلوس البداية + كل التغييرات */
  balance: number;
  /** الرصيد مضروب في كام من البداية (50 ألف ← 100 ألف = ×2) */
  multiple: number;
  /** صافي التغيير في كل ربع من السنة، بالترتيب Q1..Q4 (ممكن يبقى سالب) */
  byQuarter: [number, number, number, number];
  stats: {
    steps: number;
    wins: number;
    falls: number;
    lessons: number;
    /** أكبر مبلغ دخل مرة واحدة */
    bestWin: number;
  };
};

export const KINDS: Record<EntryKind, { label: string; icon: string }> = {
  step: { label: "خطوة", icon: "👣" },
  money: { label: "فلوس", icon: "💰" },
  fail: { label: "وقعة", icon: "🤕" },
  lesson: { label: "درس", icon: "💡" },
};

/** مراحل قصة المشروع بالترتيب. */
export const STAGES: { key: Stage; label: string; icon: string }[] = [
  { key: "idea", label: "فكرة", icon: "💡" },
  { key: "building", label: "بيتبني", icon: "🛠️" },
  { key: "ready", label: "جاهز", icon: "📦" },
  { key: "launched", label: "اتطلق", icon: "🚀" },
  { key: "earning", label: "بيكسب", icon: "💰" },
  { key: "sold", label: "اتباع", icon: "🤝" },
];

const ENTRY_FIELDS = "id, happened_on, kind, title, body, amount, video_url, links, project_id";
const LEGACY_ENTRY_FIELDS = "id, happened_on, kind, title, body, amount, video_url, project_id";

type EntryQuery = (fields: string) => PromiseLike<{ data: unknown[] | null; error: { message: string } | null }>;

/**
 * بيقرا اليوميات، ولو عمود links لسه مااتضافش في الداتابيز بيقرا من غيره
 * (عشان الموقع مايقعش بين ما الكود يتحدّث وما الـ SQL يتشغّل).
 */
async function selectEntries(query: EntryQuery): Promise<Entry[]> {
  let res = await query(ENTRY_FIELDS);
  if (res.error?.message.includes("links")) res = await query(LEGACY_ENTRY_FIELDS);
  if (res.error) throw new Error(`entries: ${res.error.message}`);
  return (res.data ?? []).map((e) => {
    const row = e as Entry;
    return { ...row, amount: Number(row.amount), links: row.links ?? [] };
  });
}
const PROJECT_FIELDS = "id, slug, name, tagline, url, stage, kind";

/** الرحلة كلها: الخطة واليوميات (الأحدث الأول) والمشاريع والمجاميع. */
export async function loadJourney(): Promise<Journey> {
  const db = createAdminClient();
  const [plan, list, projects, cheers] = await Promise.all([
    db.from("plan").select("answer, steps").eq("id", 1).maybeSingle(),
    selectEntries((f) => db.from("entries").select(f).order("happened_on", { ascending: false }).order("id", { ascending: false })),
    db.from("projects").select(PROJECT_FIELDS).order("sort").order("id"),
    db.from("cheers").select("name", { count: "exact" }).order("created_at", { ascending: false }).limit(24),
  ]);
  if (plan.error) throw new Error(`plan: ${plan.error.message}`);
  if (projects.error) throw new Error(`projects: ${projects.error.message}`);


  const byQuarter: Journey["byQuarter"] = [0, 0, 0, 0];
  for (const e of list) {
    const d = new Date(e.happened_on);
    if (d.getUTCFullYear() === YEAR) byQuarter[Math.floor(d.getUTCMonth() / 3)] += e.amount;
  }

  const balance = CREATOR.start + list.reduce((sum, e) => sum + e.amount, 0);
  const stats = {
    steps: list.filter((e) => e.kind === "step").length,
    wins: list.filter((e) => e.amount > 0).length,
    falls: list.filter((e) => e.amount < 0 || e.kind === "fail").length,
    lessons: list.filter((e) => e.kind === "lesson").length,
    bestWin: Math.max(0, ...list.map((e) => e.amount)),
  };

  return {
    answer: plan.data?.answer ?? "",
    steps: (plan.data?.steps as Step[] | null) ?? [],
    entries: list,
    projects: (projects.data ?? []).map((p) => {
      const mine = list.filter((e) => e.project_id === p.id);
      return { ...p, earned: mine.reduce((s, e) => s + e.amount, 0), entries: mine.length } as Project;
    }),
    // لو جدول عاش لسه مااتعملش، العداد بيبقى صفر بدل ما الصفحة كلها تقع
    cheers: cheers.count ?? 0,
    recentCheers: (cheers.data ?? []).map((c) => c.name || "مشجّع"),
    balance,
    multiple: balance / CREATOR.start,
    byQuarter,
    stats,
  };
}

/** مشروع واحد بقصته (اليوميات بتاعته من الأقدم للأحدث). null لو مش موجود. */
export async function loadProject(slug: string): Promise<{ project: Project; entries: Entry[] } | null> {
  const db = createAdminClient();
  const { data: p, error } = await db.from("projects").select(PROJECT_FIELDS).eq("slug", slug).maybeSingle();
  if (error) throw new Error(`projects: ${error.message}`);
  if (!p) return null;

  const entries = await selectEntries((f) =>
    db.from("entries").select(f).eq("project_id", p.id).order("happened_on", { ascending: true }).order("id", { ascending: true }),
  );
  return {
    project: { ...p, earned: entries.reduce((s, e) => s + e.amount, 0), entries: entries.length } as Project,
    entries,
  };
}
