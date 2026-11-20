"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { passwordMatches, requireAdmin, signIn, signOut } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/server";

export type ActionState = { ok?: boolean; error?: string };

export async function login(_: ActionState, formData: FormData): Promise<ActionState> {
  if (!passwordMatches(String(formData.get("password") ?? ""))) return { error: "كلمة السر غلط" };
  await signIn();
  redirect("/admin");
}

export async function logout() {
  await signOut();
  redirect("/");
}

const planSchema = z.object({
  answer: z.string().max(4000),
  steps: z
    .array(z.object({ id: z.string().max(40), text: z.string().trim().min(1).max(300), done: z.boolean() }))
    .max(50),
});

export async function savePlan(input: z.input<typeof planSchema>): Promise<ActionState> {
  await requireAdmin();
  const parsed = planSchema.safeParse(input);
  if (!parsed.success) return { error: "في حاجة مش مظبوطة في الخطة" };

  const { error } = await createAdminClient()
    .from("plan")
    .upsert({ id: 1, ...parsed.data, updated_at: new Date().toISOString() });
  if (error) return { error: error.message };

  revalidatePath("/");
  return { ok: true };
}

const entrySchema = z.object({
  happened_on: z.iso.date(),
  kind: z.enum(["step", "money", "fail", "lesson"]),
  title: z.string().trim().min(1, "اكتب عنوان").max(140),
  body: z.string().trim().max(4000),
  amount: z.coerce.number().min(-1_000_000_000).max(1_000_000_000),
  links: z.array(z.url("لينك مش صحيح").max(500)).max(6),
  project_id: z.coerce.number().int().positive().nullable(),
});

export async function addEntry(_: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const parsed = entrySchema.safeParse({
    happened_on: formData.get("happened_on"),
    kind: formData.get("kind"),
    title: formData.get("title") ?? "",
    body: formData.get("body") ?? "",
    // المبلغ بيتكتب موجب دايماً، والاتجاه (دخل / خسرت) من الاختيار جنبه
    amount:
      (formData.get("direction") === "out" ? -1 : 1) *
      Math.abs(Number(String(formData.get("amount") ?? "").replace(/[,٬\s]/g, "") || 0)),
    // خانة لكل منصة + خانة لأي لينك تاني؛ الفاضي بيتشال
    links: ["link_youtube", "link_instagram", "link_tiktok", "link_other"]
      .map((k) => String(formData.get(k) ?? "").trim())
      .filter(Boolean),
    project_id: formData.get("project_id") || null,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "في حاجة ناقصة" };

  const { error } = await createAdminClient()
    .from("entries")
    .insert(parsed.data);
  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  return { ok: true };
}

export async function deleteEntry(id: number) {
  await requireAdmin();
  await createAdminClient().from("entries").delete().eq("id", id);
  revalidatePath("/", "layout");
}

const STAGE_KEYS = ["idea", "building", "ready", "launched", "earning", "sold"] as const;

const projectSchema = z.object({
  name: z.string().trim().min(1, "اكتب اسم المشروع").max(80),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9-]{2,40}$/, "الرابط: حروف إنجليزي صغيرة وأرقام و - بس"),
  tagline: z.string().trim().max(200),
  url: z.union([z.literal(""), z.url().max(300)]),
  stage: z.enum(STAGE_KEYS),
  kind: z.enum(["mine", "work"]),
});

export async function addProject(_: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const parsed = projectSchema.safeParse({
    name: formData.get("name") ?? "",
    slug: formData.get("slug") ?? "",
    tagline: formData.get("tagline") ?? "",
    url: String(formData.get("url") ?? "").trim(),
    stage: formData.get("stage"),
    kind: formData.get("kind") === "work" ? "work" : "mine",
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "في حاجة ناقصة" };

  const { error } = await createAdminClient()
    .from("projects")
    .insert({ ...parsed.data, url: parsed.data.url || null, sort: Date.now() % 1_000_000 });
  if (error) return { error: error.code === "23505" ? "الرابط ده مستخدم لمشروع تاني" : error.message };

  revalidatePath("/", "layout");
  return { ok: true };
}

/** تعديل مشروع موجود: المرحلة والوصف واللينك. */
export async function updateProject(id: number, patch: { stage?: string; tagline?: string; url?: string }) {
  await requireAdmin();
  const parsed = projectSchema.pick({ stage: true, tagline: true, url: true }).partial().safeParse(patch);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "مش مظبوط" };

  const data = { ...parsed.data, ...(parsed.data.url !== undefined ? { url: parsed.data.url || null } : {}) };
  const { error } = await createAdminClient().from("projects").update(data).eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  return { ok: true };
}

export async function deleteProject(id: number) {
  await requireAdmin();
  // اليوميات المربوطة بيه بتفضل، بس بتتفك من المشروع (on delete set null)
  await createAdminClient().from("projects").delete().eq("id", id);
  revalidatePath("/", "layout");
}

export async function deleteCheer(id: number) {
  await requireAdmin();
  await createAdminClient().from("cheers").delete().eq("id", id);
  revalidatePath("/", "layout");
}
