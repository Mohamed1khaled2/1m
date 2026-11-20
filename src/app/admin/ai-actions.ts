"use server";

import { GoogleGenAI, Type } from "@google/genai";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-auth";
import { SYSTEM_INSTRUCTION, buildContext } from "@/lib/ai-context";
import { CREATOR, GEAR } from "@/lib/creator";
import { KINDS, loadJourney } from "@/lib/journey";
import { createAdminClient } from "@/lib/supabase/server";
import { formatEGP } from "@/lib/year";

export type AiResult = { text?: string; error?: string };

const STYLE_KEY = "style_samples";

export async function loadStyleSamples(): Promise<string> {
  await requireAdmin();
  const { data } = await createAdminClient().from("settings").select("value").eq("key", STYLE_KEY).maybeSingle();
  return data?.value ?? "";
}

export async function saveStyleSamples(value: string): Promise<{ ok?: boolean; error?: string }> {
  await requireAdmin();
  const text = z.string().max(8000).safeParse(value);
  if (!text.success) return { error: "الأمثلة طويلة شوية (٨ آلاف حرف بالكتير)" };
  const { error } = await createAdminClient()
    .from("settings")
    .upsert({ key: STYLE_KEY, value: text.data, updated_at: new Date().toISOString() });
  return error ? { error: error.message } : { ok: true };
}

const requestSchema = z.discriminatedUnion("mode", [
  z.object({ mode: z.literal("tiktok"), entryId: z.number().int().positive() }),
  z.object({ mode: z.literal("week") }),
  z.object({ mode: z.literal("ideas") }),
  z.object({ mode: z.literal("ask"), prompt: z.string().trim().min(3).max(2000) }),
]);

/** المطلوب في كل نوع. الداتا كلها بتتبعت في السياق، فالطلب نفسه قصير. */
async function taskFor(req: z.infer<typeof requestSchema>, journey: Awaited<ReturnType<typeof loadJourney>>): Promise<string | null> {
  if (req.mode === "tiktok") {
    const e = journey.entries.find((x) => x.id === req.entryId);
    if (!e) return null;
    const money = e.amount ? ` (${e.amount > 0 ? "+" : "−"}${formatEGP(Math.abs(e.amount))} جنيه)` : "";
    return `اكتب سكريبت فيديو تيك توك (30 لـ 60 ثانية) عن اليومية دي:
${e.happened_on} · ${KINDS[e.kind].label}: ${e.title}${money}
${e.body}

الرد بالشكل ده:
## Hook (أول ٣ ثواني)
- الكلام اللي هقوله
- الكلام المكتوب على الشاشة
## السكريبت
مقسم لقطات قصيرة، وجنب كل لقطة أصوّر إيه
## النهاية
جملة تخلّي الناس تتابع الحلقة الجاية
## الكابشن
## هاشتاجات (٥ بس)
اعمل ٢ Hook بديلين كمان.`;
  }
  if (req.mode === "week") {
    const since = new Date(Date.now() - 7 * 86_400_000).toISOString().slice(0, 10);
    const week = journey.entries.filter((e) => e.happened_on >= since);
    return `اعمل خطة فيديو اليوتيوب الأسبوعي من اللي حصل في آخر ٧ أيام (من ${since}).
${week.length === 0 ? "مفيش يوميات الأسبوع ده: اعمل فيديو صريح عن أسبوع ماحصلش فيه حاجة وليه، ومن غير ما تألف أحداث." : `اليوميات: ${week.length}`}

الرد بالشكل ده:
## ٣ عناوين
## كلام الـ Thumbnail (٣ اختيارات، ٣ كلمات بالكتير)
## أول ٣٠ ثانية (كلمة بكلمة)
## أجزاء الفيديو
كل جزء: عنوانه، والنقط اللي هقولها، والمدة تقريباً
## النهاية
## وصف الفيديو`;
  }
  if (req.mode === "ideas") {
    return `اقترح ٥ أفكار فيديوهات تيك توك جاية من القصة لحد دلوقتي (مشاريعه، رقمه، اللي حصل، الخطة).
لكل فكرة: العنوان، الـ Hook في جملة، وليه هتشد الناس. رتّبها من الأقوى للأضعف.`;
  }
  return req.prompt;
}

export async function generateVideo(input: z.input<typeof requestSchema>): Promise<AiResult> {
  await requireAdmin();
  const req = requestSchema.safeParse(input);
  if (!req.success) return { error: "الطلب مش مظبوط" };

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return { error: "حط GEMINI_API_KEY في .env.local (ببلاش من aistudio.google.com/apikey)" };

  const [journey, style] = await Promise.all([loadJourney(), loadStyleSamples().catch(() => "")]);
  const task = await taskFor(req.data, journey);
  if (!task) return { error: "اليومية دي مش موجودة" };

  try {
    const res = await new GoogleGenAI({ apiKey }).models.generateContent({
      model: process.env.GEMINI_MODEL || "gemini-3.5-flash",
      contents: `${buildContext(journey, style)}\n\n---\n\n# المطلوب\n${task}`,
      config: { systemInstruction: SYSTEM_INSTRUCTION, temperature: 0.8 },
    });
    const text = res.text?.trim();
    return text ? { text } : { error: "مارجعش رد، جرّب تاني" };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (/429|quota|rate/i.test(msg)) return { error: "خلصت الحد المجاني للدقيقة دي، استنى شوية وجرّب تاني" };
    if (/API key|401|403/i.test(msg)) return { error: "مفتاح Gemini مش شغال، اتأكد منه" };
    return { error: `Gemini: ${msg.slice(0, 200)}` };
  }
}

export type Shot = {
  n: number;
  shot: string;
  camera: string;
  where: string;
  action: string;
  face: string;
  line: string;
  on_screen: string;
  seconds: number;
  note: string;
};

export type ShotList = {
  title: string;
  idea: string;
  prep: string[];
  shots: Shot[];
  broll: string[];
  order: string;
};

const SHOT_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: "اسم الفيديو" },
    idea: { type: Type.STRING, description: "الفكرة في جملة: الفيديو بيحكي إيه" },
    prep: { type: Type.ARRAY, items: { type: Type.STRING }, description: "قبل ما تصوّر: تجهّز إيه، الإضاءة، المكان، اللبس" },
    shots: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          n: { type: Type.INTEGER },
          shot: { type: Type.STRING, description: "نوع اللقطة بالعربي وجنبه الاسم الإنجليزي، مثلاً: لقطة قريبة (Close-up)" },
          camera: { type: Type.STRING, description: "مدير التصوير: الموبايل فين، الزاوية، ثابت ولا بيتحرك وإزاي" },
          where: { type: Type.STRING, description: "المكان" },
          action: { type: Type.STRING, description: "الممثل بيعمل إيه بالظبط" },
          face: { type: Type.STRING, description: "بيبص فين ووشه عامل إزاي" },
          line: { type: Type.STRING, description: "بيقول إيه بالحرف، أو فاضي لو لقطة من غير كلام" },
          on_screen: { type: Type.STRING, description: "الكلام المكتوب على الشاشة، أو فاضي" },
          seconds: { type: Type.NUMBER },
          note: { type: Type.STRING, description: "ملاحظة المخرج: ليه اللقطة دي وإيه اللي يخليها تنجح" },
        },
        required: ["n", "shot", "camera", "where", "action", "face", "line", "on_screen", "seconds", "note"],
      },
    },
    broll: { type: Type.ARRAY, items: { type: Type.STRING }, description: "لقطات B-roll إضافية تصوّرها وتحطها فوق الكلام" },
    order: { type: Type.STRING, description: "ترتيب التصوير: تجمّع اللقطات اللي في نفس المكان عشان تخلّص أسرع" },
  },
  required: ["title", "idea", "prep", "shots", "broll", "order"],
};

const DIRECTOR_INSTRUCTION = `${SYSTEM_INSTRUCTION}

إنت كمان المخرج ومدير التصوير. ${CREATOR.name} هو الممثل وهو اللي بيصوّر نفسه.

العدّة اللي معاه (استغلها، ومتطلبش حاجة مش موجودة):
- الكاميرا: ${GEAR.camera}
- الصوت: ${GEAR.audio}
${GEAR.other.map((g) => `- ${g}`).join("\n")}
- الأماكن: ${GEAR.locations}

- التصوير بالطول (9:16)، وغالباً لوحده: الموبايل على حامل أو مسنود، أو في إيده.
- في خانة الكاميرا قول أنهي عدسة (0.5x / 1x / 3x) وأنهي وضع (عادي، Cinematic، Macro، Slo-mo) ولو الأمامية ولا الخلفية.
- اللقطات اللي فيها كلام مهم: قول يسجّل بالمايك.
- استخدم لقطات اللابتوب وتسجيل الشاشة كـ B-roll للشغل والكود.
- الإضاءة طبيعية: شباك، لمبة البيت. قول يقف فين من الضوء.
- اللقطات بسيطة يقدر يعملها لوحده.
- أول لقطة لازم تشد في أول ٣ ثواني.
- كلّمه في الملاحظات زي مخرج بيكلّم ممثل: "هنا عاوزك..."
- من ٦ لـ ١٢ لقطة، والفيديو كله من ٣٠ لـ ٧٥ ثانية.`;

/** المخرج: قايمة لقطات للفيديو، من يومية أو من فكرة. */
export async function generateShotList(input: { entryId?: number; idea?: string }): Promise<{ list?: ShotList; error?: string }> {
  await requireAdmin();
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return { error: "حط GEMINI_API_KEY في .env.local (ببلاش من aistudio.google.com/apikey)" };

  const [journey, style] = await Promise.all([loadJourney(), loadStyleSamples().catch(() => "")]);

  let subject: string;
  if (input.entryId) {
    const e = journey.entries.find((x) => x.id === input.entryId);
    if (!e) return { error: "اليومية دي مش موجودة" };
    const money = e.amount ? ` (${e.amount > 0 ? "+" : "−"}${formatEGP(Math.abs(e.amount))} جنيه)` : "";
    subject = `فيديو عن اليومية دي:\n${e.happened_on} · ${KINDS[e.kind].label}: ${e.title}${money}\n${e.body}`;
  } else {
    const idea = z.string().trim().min(3).max(1000).safeParse(input.idea ?? "");
    if (!idea.success) return { error: "اكتب الفكرة الأول" };
    subject = `فيديو عن الفكرة دي: ${idea.data}`;
  }

  try {
    const res = await new GoogleGenAI({ apiKey }).models.generateContent({
      model: process.env.GEMINI_MODEL || "gemini-3.5-flash",
      contents: `${buildContext(journey, style)}\n\n---\n\n# المطلوب\nاعمل قايمة لقطات (Shot List) كاملة لـ${subject}`,
      config: {
        systemInstruction: DIRECTOR_INSTRUCTION,
        temperature: 0.8,
        responseMimeType: "application/json",
        responseSchema: SHOT_SCHEMA,
      },
    });
    const list = JSON.parse(res.text ?? "{}") as ShotList;
    if (!Array.isArray(list.shots) || list.shots.length === 0) return { error: "مارجعش لقطات، جرّب تاني" };
    return { list };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (/429|quota|rate/i.test(msg)) return { error: "خلصت الحد المجاني للدقيقة دي، استنى شوية وجرّب تاني" };
    if (/API key|401|403/i.test(msg)) return { error: "مفتاح Gemini مش شغال، اتأكد منه" };
    if (e instanceof SyntaxError) return { error: "الرد جه ناقص، جرّب تاني" };
    return { error: `Gemini: ${msg.slice(0, 200)}` };
  }
}
