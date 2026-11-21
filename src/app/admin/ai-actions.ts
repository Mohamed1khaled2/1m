"use server";

import { GoogleGenAI, Type } from "@google/genai";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-auth";
import { SYSTEM_INSTRUCTION, buildContext } from "@/lib/ai-context";
import { CREATOR, GEAR } from "@/lib/creator";
import { KINDS, loadJourney } from "@/lib/journey";
import { createAdminClient } from "@/lib/supabase/server";
import { formatEGP } from "@/lib/year";

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

/** الفيديو كامل: الفكرة، والـ Hook، وورقة التصوير، والنشر. */
export type VideoPackage = {
  title: string;
  idea: string;
  hook: { line: string; on_screen: string; alternatives: string[] };
  prep: string[];
  shots: Shot[];
  broll: string[];
  order: string;
  caption: string;
  hashtags: string[];
  titles: string[];
  thumbnail: string[];
};

const S = (description: string) => ({ type: Type.STRING, description });
const LIST = (description: string) => ({ type: Type.ARRAY, items: { type: Type.STRING }, description });

const PACKAGE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    title: S("اسم الفيديو"),
    idea: S("الفيديو بيحكي إيه، في جملة"),
    hook: {
      type: Type.OBJECT,
      properties: {
        line: S("أول جملة يقولها في أول ٣ ثواني"),
        on_screen: S("الكلام المكتوب على الشاشة في أول ٣ ثواني"),
        alternatives: LIST("٢ Hook بديلين"),
      },
      required: ["line", "on_screen", "alternatives"],
    },
    prep: LIST("قبل ما تصوّر: تجهّز إيه، الإضاءة، المكان، اللبس"),
    shots: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          n: { type: Type.INTEGER },
          shot: S("نوع اللقطة بالعربي وجنبه الاسم الإنجليزي، مثلاً: لقطة قريبة (Close-up)"),
          camera: S("مدير التصوير: أنهي عدسة (0.5x/1x/3x)، أنهي وضع (عادي/Cinematic/Macro/Slo-mo)، أمامية ولا خلفية، الموبايل فين، ثابت ولا بيتحرك"),
          where: S("المكان"),
          action: S("الممثل بيعمل إيه بالظبط"),
          face: S("بيبص فين ووشه عامل إزاي"),
          line: S("بيقول إيه بالحرف (ده السكريبت)، أو فاضي لو لقطة من غير كلام"),
          on_screen: S("الكلام المكتوب على الشاشة، أو فاضي"),
          seconds: { type: Type.NUMBER },
          note: S("ملاحظة المخرج: ليه اللقطة دي وإيه اللي يخليها تنجح"),
        },
        required: ["n", "shot", "camera", "where", "action", "face", "line", "on_screen", "seconds", "note"],
      },
    },
    broll: LIST("لقطات B-roll إضافية تصوّرها وتحطها فوق الكلام"),
    order: S("ترتيب التصوير: تجمّع اللقطات اللي في نفس المكان عشان تخلّص أسرع"),
    caption: S("الكابشن اللي هيتحط مع الفيديو"),
    hashtags: LIST("٥ هاشتاجات"),
    titles: LIST("٣ عناوين للفيديو (لليوتيوب)"),
    thumbnail: LIST("٣ اختيارات لكلام الثامبنيل، ٣ كلمات بالكتير"),
  },
  required: ["title", "idea", "hook", "prep", "shots", "broll", "order", "caption", "hashtags", "titles", "thumbnail"],
};

const DIRECTOR_INSTRUCTION = `${SYSTEM_INSTRUCTION}

إنت كمان كاتب السكريبت والمخرج ومدير التصوير. ${CREATOR.name} هو الممثل وهو اللي بيصوّر نفسه.

العدّة اللي معاه (استغلها، ومتطلبش حاجة مش موجودة):
- الكاميرا: ${GEAR.camera}
- الصوت: ${GEAR.audio}
${GEAR.other.map((g) => `- ${g}`).join("\n")}
- الأماكن: ${GEAR.locations}

- التصوير بالطول (9:16)، وغالباً لوحده: الموبايل على حامل أو مسنود، أو في إيده.
- اللقطات اللي فيها كلام مهم: قول يسجّل بالمايك.
- استخدم لقطات اللابتوب وتسجيل الشاشة كـ B-roll للشغل والكود.
- الإضاءة طبيعية: شباك، لمبة البيت. قول يقف فين من الضوء.
- اللقطات بسيطة يقدر يعملها لوحده.
- السكريبت متوزع على اللقطات (خانة "بيقول إيه")، ولما تتقري ورا بعض تبقى حكاية كاملة.
- أول لقطة هي الـ Hook، ولازم تشد في أول ٣ ثواني.
- كلّمه في الملاحظات زي مخرج بيكلّم ممثل: "هنا عاوزك..."
- من ٦ لـ ١٢ لقطة، والفيديو كله من ٣٠ لـ ٧٥ ثانية (لو فيديو الأسبوع لليوتيوب ممكن يطول لـ ٥–٨ دقايق وأجزاء أكتر).`;

function geminiError(e: unknown): string {
  const msg = e instanceof Error ? e.message : String(e);
  if (/429|quota|rate/i.test(msg)) return "خلصت الحد المجاني للدقيقة دي، استنى شوية وجرّب تاني";
  if (/API key|401|403/i.test(msg)) return "مفتاح Gemini مش شغال، اتأكد منه";
  if (e instanceof SyntaxError) return "الرد جه ناقص، جرّب تاني";
  return `Gemini: ${msg.slice(0, 200)}`;
}

function client() {
  const apiKey = process.env.GEMINI_API_KEY;
  return apiKey ? new GoogleGenAI({ apiKey }) : null;
}

const MODEL = () => process.env.GEMINI_MODEL || "gemini-3.5-flash";
const NO_KEY = "حط GEMINI_API_KEY في .env.local (ببلاش من aistudio.google.com/apikey)";

/**
 * اعمل الفيديو كامل: من فكرة مكتوبة، أو من يومية، أو من الأسبوع كله.
 * رد واحد فيه السكريبت وورقة التصوير والنشر.
 */
export async function generateVideoPackage(input: {
  idea?: string;
  entryId?: number;
  week?: boolean;
}): Promise<{ pkg?: VideoPackage; error?: string }> {
  await requireAdmin();
  const ai = client();
  if (!ai) return { error: NO_KEY };

  const [journey, style] = await Promise.all([loadJourney(), loadStyleSamples().catch(() => "")]);

  let subject: string;
  if (input.week) {
    const since = new Date(Date.now() - 7 * 86_400_000).toISOString().slice(0, 10);
    const count = journey.entries.filter((e) => e.happened_on >= since).length;
    subject = `فيديو اليوتيوب الأسبوعي عن اللي حصل في آخر ٧ أيام (من ${since}، ${count} يومية).${
      count === 0 ? " مفيش يوميات: اعمل فيديو صريح عن أسبوع ماحصلش فيه حاجة وليه، من غير ما تألف أحداث." : ""
    }`;
  } else if (input.entryId) {
    const e = journey.entries.find((x) => x.id === input.entryId);
    if (!e) return { error: "اليومية دي مش موجودة" };
    const money = e.amount ? ` (${e.amount > 0 ? "+" : "−"}${formatEGP(Math.abs(e.amount))} جنيه)` : "";
    subject = `فيديو تيك توك عن اليومية دي:\n${e.happened_on} · ${KINDS[e.kind].label}: ${e.title}${money}\n${e.body}`;
  } else {
    const idea = z.string().trim().min(3).max(1500).safeParse(input.idea ?? "");
    if (!idea.success) return { error: "اكتب الفكرة الأول" };
    subject = `فيديو تيك توك عن الفكرة دي (بكلامه): ${idea.data}`;
  }

  try {
    const res = await ai.models.generateContent({
      model: MODEL(),
      contents: `${buildContext(journey, style)}\n\n---\n\n# المطلوب\nاعمل الفيديو كامل: السكريبت وورقة التصوير والنشر، لـ${subject}`,
      config: {
        systemInstruction: DIRECTOR_INSTRUCTION,
        temperature: 0.8,
        responseMimeType: "application/json",
        responseSchema: PACKAGE_SCHEMA,
      },
    });
    const pkg = JSON.parse(res.text ?? "{}") as VideoPackage;
    if (!Array.isArray(pkg.shots) || pkg.shots.length === 0) return { error: "مارجعش لقطات، جرّب تاني" };
    return { pkg };
  } catch (e) {
    return { error: geminiError(e) };
  }
}

/** "مش عارف أعمل فيديو عن إيه": أفكار قصيرة من القصة، كل واحدة جملة تتكتب في الخانة على طول. */
export async function suggestIdeas(): Promise<{ ideas?: string[]; error?: string }> {
  await requireAdmin();
  const ai = client();
  if (!ai) return { error: NO_KEY };
  const [journey, style] = await Promise.all([loadJourney(), loadStyleSamples().catch(() => "")]);

  try {
    const res = await ai.models.generateContent({
      model: MODEL(),
      contents: `${buildContext(journey, style)}\n\n---\n\n# المطلوب\nاقترح ٦ أفكار فيديوهات تيك توك جاية من القصة لحد دلوقتي (مشاريعه، رقمه، اللي حصل، الخطة). كل فكرة جملة واحدة قصيرة بلسانه، مرتبة من الأقوى.`,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.9,
        responseMimeType: "application/json",
        responseSchema: LIST("الأفكار"),
      },
    });
    const ideas = JSON.parse(res.text ?? "[]") as string[];
    return Array.isArray(ideas) && ideas.length ? { ideas } : { error: "مارجعش أفكار، جرّب تاني" };
  } catch (e) {
    return { error: geminiError(e) };
  }
}
