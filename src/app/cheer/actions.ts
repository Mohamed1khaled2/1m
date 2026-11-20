"use server";

import { createHmac } from "node:crypto";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { createAdminClient } from "@/lib/supabase/server";

export type CheerState = { ok?: boolean; error?: string };

// الحدود: نفس الجهاز مرة كل ١٠ دقايق و٣ مرات في اليوم، والموقع كله ٣٠٠ في الساعة
const COOLDOWN_MS = 10 * 60_000;
const PER_DAY = 3;
const GLOBAL_PER_HOUR = 300;

/**
 * بصمة الجهاز: HMAC من الـ IP وتاريخ النهارده. الـ IP نفسه مابيتخزنش، والبصمة بتتغير كل يوم
 * فمحدش يقدر يتتبع زائر من يوم ليوم، بس كفاية نعرف إنه نفس الجهاز النهارده.
 */
async function deviceHash(): Promise<string> {
  const h = await headers();
  const ip = (h.get("x-forwarded-for")?.split(",")[0] ?? h.get("x-real-ip") ?? "unknown").trim();
  const day = new Date().toISOString().slice(0, 10);
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "1m";
  return createHmac("sha256", secret).update(`${ip}|${day}`).digest("hex").slice(0, 32);
}

/** الاسم: اختياري، قصير، ومن غير روابط. فاضي = "مشجّع" وقت العرض. */
function cleanName(raw: string): string | null {
  const name = raw.replace(/\s+/g, " ").trim().slice(0, 30);
  if (/https?:|www\.|\.com|\.net|@/i.test(name)) return null;
  return name;
}

export async function sendCheer(_: CheerState, formData: FormData): Promise<CheerState> {
  // خانة مستخبية: البني آدم مابيشوفهاش، فلو اتملت يبقى بوت. بنرد "تمام" عشان البوت مايعرفش
  if (String(formData.get("website") ?? "")) return { ok: true };

  const name = cleanName(String(formData.get("name") ?? ""));
  if (name === null) return { error: "الاسم من غير لينكات" };

  const db = createAdminClient();
  const hash = await deviceHash();
  const now = Date.now();

  const [mine, global] = await Promise.all([
    db
      .from("cheers")
      .select("created_at")
      .eq("ip_hash", hash)
      .gte("created_at", new Date(now - 86_400_000).toISOString())
      .order("created_at", { ascending: false }),
    db.from("cheers").select("id", { count: "exact", head: true }).gte("created_at", new Date(now - 3_600_000).toISOString()),
  ]);
  if (mine.error) return { error: "ماوصلتش، جرّب تاني" };

  const last = mine.data[0] ? new Date(mine.data[0].created_at).getTime() : 0;
  if (now - last < COOLDOWN_MS) return { error: "قولت عاش من شوية، شكراً ❤️ تعالى تاني بعد شوية" };
  if (mine.data.length >= PER_DAY) return { error: "وصلت لعاش النهارده كله ❤️ تعالى بكره" };
  if ((global.count ?? 0) >= GLOBAL_PER_HOUR) return { error: "ناس كتير بتقول عاش دلوقتي، جرّب كمان شوية" };

  const { error } = await db.from("cheers").insert({ name, ip_hash: hash });
  if (error) return { error: "ماوصلتش، جرّب تاني" };

  revalidatePath("/");
  return { ok: true };
}
