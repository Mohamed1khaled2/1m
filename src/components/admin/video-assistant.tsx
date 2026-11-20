"use client";

import { useState, useTransition } from "react";
import { generateShotList, generateVideo, saveStyleSamples, type ShotList } from "@/app/admin/ai-actions";
import { ShotListView } from "@/components/admin/shot-list-view";

type Mode = "director" | "tiktok" | "week" | "ideas" | "ask";

const MODES: { key: Mode; label: string; icon: string }[] = [
  { key: "director", label: "المخرج", icon: "🎥" },
  { key: "tiktok", label: "سكريبت", icon: "🎬" },
  { key: "week", label: "فيديو الأسبوع", icon: "📺" },
  { key: "ideas", label: "أفكار", icon: "💡" },
  { key: "ask", label: "اسأله", icon: "💬" },
];

/**
 * مساعد الفيديوهات: عارف القصة كلها من الموقع، وبيكتب بأسلوبك من الأمثلة اللي بتحطها.
 */
export function VideoAssistant({
  entries,
  initialStyle,
}: {
  entries: { id: number; title: string; happened_on: string }[];
  initialStyle: string;
}) {
  const [mode, setMode] = useState<Mode>("director");
  // المخرج: من يومية ولا من فكرة جديدة
  const [source, setSource] = useState<"entry" | "idea">(entries.length ? "entry" : "idea");
  const [idea, setIdea] = useState("");
  const [shots, setShots] = useState<ShotList | null>(null);
  const [entryId, setEntryId] = useState<number | "">(entries[0]?.id ?? "");
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState<{ text?: string; error?: string }>({});
  const [copied, setCopied] = useState(false);
  const [pending, start] = useTransition();

  const [style, setStyle] = useState(initialStyle);
  const [styleOpen, setStyleOpen] = useState(!initialStyle);
  const [styleSaved, setStyleSaved] = useState<string | null>(null);

  function run() {
    setCopied(false);
    start(async () => {
      if (mode === "director") {
        setResult({});
        setShots(null);
        const res = source === "entry" ? await generateShotList({ entryId: Number(entryId) }) : await generateShotList({ idea });
        if (res.error) return setResult({ error: res.error });
        return setShots(res.list ?? null);
      }
      setShots(null);
      if (mode === "tiktok") {
        if (!entryId) return setResult({ error: "اختار يومية الأول" });
        setResult(await generateVideo({ mode, entryId: Number(entryId) }));
      } else if (mode === "ask") {
        setResult(await generateVideo({ mode, prompt }));
      } else {
        setResult(await generateVideo({ mode }));
      }
    });
  }

  async function copy() {
    if (!result.text) return;
    await navigator.clipboard.writeText(result.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-4">
      {/* أسلوبك */}
      <div className="rounded-2xl border border-border bg-surface p-4">
        <button onClick={() => setStyleOpen((o) => !o)} className="flex w-full items-center justify-between text-right">
          <span className="font-bold">🗣️ أسلوبك {initialStyle ? "" : <span className="text-xs font-normal text-gold">(ابدأ من هنا)</span>}</span>
          <span className="text-muted">{styleOpen ? "▲" : "▼"}</span>
        </button>
        {styleOpen && (
          <div className="mt-3 space-y-2">
            <p className="text-sm text-muted">
              الصق ٣–٥ أمثلة من كلامك في فيديوهاتك أو كابشناتك القديمة. المساعد هيكتب زيك من غيرها بس هيبقى أحسن بيها.
            </p>
            <textarea
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              rows={6}
              maxLength={8000}
              placeholder={"مثلاً:\n\"النهارده هقولكم على أكبر غلطة عملتها في أول مشروع...\"\n\"بصراحة كنت فاكر إنها هتنجح، طلع العكس.\""}
              className="input resize-y text-sm leading-relaxed"
            />
            <div className="flex items-center gap-3">
              <button
                onClick={async () => {
                  const res = await saveStyleSamples(style);
                  setStyleSaved(res.error ?? "اتحفظ ✓");
                }}
                className="btn-ghost"
              >
                احفظ الأسلوب
              </button>
              {styleSaved && <span className={`text-sm ${styleSaved.startsWith("اتحفظ") ? "text-green" : "text-red-400"}`}>{styleSaved}</span>}
            </div>
          </div>
        )}
      </div>

      {/* نوع الفيديو */}
      <div className="grid grid-cols-5 gap-2">
        {MODES.map((m) => (
          <button
            key={m.key}
            onClick={() => setMode(m.key)}
            className={`flex flex-col items-center gap-1 rounded-xl border py-3 text-xs transition sm:text-sm ${
              mode === m.key ? "border-gold bg-gold/10 font-bold" : "border-border text-muted hover:border-gold/40"
            }`}
          >
            <span className="text-xl">{m.icon}</span>
            {m.label}
          </button>
        ))}
      </div>

      {mode === "director" && (
        <div className="space-y-3">
          <p className="text-sm text-muted">المخرج هيقولك كل لقطة: الكاميرا فين، تعمل إيه، تبص فين، تقول إيه، ومكتوب إيه على الشاشة.</p>
          <div className="flex gap-2 text-sm">
            <button
              onClick={() => setSource("entry")}
              disabled={!entries.length}
              className={`rounded-full border px-3 py-1.5 ${source === "entry" ? "border-gold bg-gold/10 font-bold" : "border-border text-muted"} disabled:opacity-40`}
            >
              من يومية
            </button>
            <button
              onClick={() => setSource("idea")}
              className={`rounded-full border px-3 py-1.5 ${source === "idea" ? "border-gold bg-gold/10 font-bold" : "border-border text-muted"}`}
            >
              من فكرة
            </button>
          </div>
          {source === "entry" ? (
            <select value={entryId} onChange={(e) => setEntryId(Number(e.target.value))} className="input">
              {entries.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.happened_on} · {e.title}
                </option>
              ))}
            </select>
          ) : (
            <textarea
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              rows={3}
              maxLength={1000}
              placeholder="مثلاً: يوم في حياتي وأنا بشتغل على NileBand / أول مرة أقول رقمي قدام الناس"
              className="input resize-y"
            />
          )}
        </div>
      )}

      {mode === "tiktok" &&
        (entries.length ? (
          <select value={entryId} onChange={(e) => setEntryId(Number(e.target.value))} className="input">
            {entries.map((e) => (
              <option key={e.id} value={e.id}>
                {e.happened_on} · {e.title}
              </option>
            ))}
          </select>
        ) : (
          <p className="text-sm text-muted">انشر يومية الأول وبعدين اعمل منها فيديو.</p>
        ))}
      {mode === "week" && <p className="text-sm text-muted">هيجمع اللي نشرته في آخر ٧ أيام ويطلعلك فيديو اليوتيوب بتاع الأسبوع.</p>}
      {mode === "ideas" && <p className="text-sm text-muted">٥ أفكار فيديوهات جاية من القصة لحد دلوقتي.</p>}
      {mode === "ask" && (
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={3}
          maxLength={2000}
          placeholder="مثلاً: اكتبلي فيديو عن ليه بعت إثبات / إزاي أصوّر فيديو عن الوقعة بتاعة امبارح"
          className="input resize-y"
        />
      )}

      <button
        onClick={run}
        disabled={pending || (mode === "ask" && prompt.trim().length < 3) || (mode === "director" && source === "idea" && idea.trim().length < 3)}
        className="btn w-full py-4 text-lg"
      >
        {pending ? (mode === "director" ? "المخرج بيفكر..." : "بيكتب...") : mode === "director" ? "اعملّي ورقة التصوير 🎥" : "اكتبلي ✨"}
      </button>

      {result.error && <p className="rounded-xl border border-red-400/30 bg-red-400/5 px-4 py-3 text-sm text-red-400">{result.error}</p>}
      {shots && <ShotListView list={shots} />}
      {result.text && (
        <div className="relative rounded-2xl border border-gold/30 bg-surface p-5">
          <button onClick={copy} className="btn-ghost absolute top-3 left-3 py-1 text-xs">
            {copied ? "اتنسخ ✓" : "انسخ"}
          </button>
          <div className="pt-6 text-[15px] leading-loose whitespace-pre-wrap">{result.text}</div>
        </div>
      )}
    </div>
  );
}
