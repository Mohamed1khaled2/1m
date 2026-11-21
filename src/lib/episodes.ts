import { createAdminClient } from "@/lib/supabase/server";

/** لينكات حلقات كل مشروع في جدول settings: { "3": "https://youtu.be/..." } (رقم الأسبوع ← اللينك). */
export const episodesKey = (slug: string) => `episodes_${slug}`;

export async function loadEpisodeLinks(slug: string): Promise<Record<string, string>> {
  try {
    const { data } = await createAdminClient().from("settings").select("value").eq("key", episodesKey(slug)).maybeSingle();
    return data?.value ? (JSON.parse(data.value) as Record<string, string>) : {};
  } catch {
    // لو جدول settings لسه مااتعملش، كل الحلقات بتبان مقفولة بدل ما الصفحة تقع
    return {};
  }
}
