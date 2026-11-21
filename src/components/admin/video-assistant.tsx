"use client";

import { useState, useTransition } from "react";
import { generateVideoPackage, saveStyleSamples, suggestIdeas, type VideoPackage } from "@/app/admin/ai-actions";
import { VideoPackageView } from "@/components/admin/video-package-view";
import { LottieAnimation } from "@/components/lottie-animation";

type Source = { kind: "idea" } | { kind: "entry"; id: number; title: string } | { kind: "week" };

/**
 * المساعد: تقوله الفكرة بكلامك (أو تختار يومية / الأسبوع)، ودوسة واحدة بيعمل الفيديو كامل:
 * السكريبت وورقة التصوير والنشر. عارف القصة كلها من الموقع، وأسلوبك من الأمثلة.
 */
export function VideoAssistant({
  entries,
  initialStyle,
}: {
  entries: { id: number; title: string; happened_on: string }[];
  initialStyle: string;
}) {
  const [idea, setIdea] = useState("");
  const [source, setSource] = useState<Source>({ kind: "idea" });
  const [pkg, setPkg] = useState<VideoPackage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ideas, setIdeas] = useState<string[]>([]);
  const [making, startMaking] = useTransition();
  const [thinking, startThinking] = useTransition();

  const [style, setStyle] = useState(initialStyle);
  const [styleOpen, setStyleOpen] = useState(false);
  const [styleSaved, setStyleSaved] = useState<string | null>(null);

  const ready = source.kind !== "idea" || idea.trim().length >= 3;

  function make() {
    setError(null);
    setPkg(null);
    startMaking(async () => {
      const res = await generateVideoPackage(
        source.kind === "entry" ? { entryId: source.id } : source.kind === "week" ? { week: true } : { idea },
      );
      if (res.error) return setError(res.error);
      setPkg(res.pkg ?? null);
    });
  }

  function inspire() {
    setError(null);
    startThinking(async () => {
      const res = await suggestIdeas();
      if (res.error) return setError(res.error);
      setIdeas(res.ideas ?? []);
    });
  }

  const chip = (active: boolean) =>
    `shrink-0 rounded-full border px-3 py-1.5 text-sm transition ${active ? "border-gold bg-gold/15 font-bold text-gold" : "border-border text-muted hover:border-gold/40 hover:text-foreground"}`;

  return (
    <div className="space-y-6">
      {/* ١. الفكرة */}
      <div className="rounded-3xl border border-gold/30 bg-gradient-to-b from-surface-2 to-surface p-5">
        <label htmlFor="idea" className="text-lg font-black">
          عندك فكرة فيديو؟
        </label>
        <p className="mt-1 text-sm text-muted">اكتبها بكلامك، وهو يعمل الباقي: السكريبت، واللقطات، والكابشن.</p>

        {source.kind === "idea" ? (
          <textarea
            id="idea"
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            rows={3}
            maxLength={1500}
            placeholder="مثلاً: خسرت ١٠ آلاف في بضاعة ماتباعتش / أول يوم أشتغل على NileBand"
            className="input mt-4 resize-y text-lg leading-relaxed"
          />
        ) : (
          <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-gold/40 bg-gold/5 px-4 py-3">
            <p className="font-bold">{source.kind === "week" ? "📺 فيديو الأسبوع (من اللي نشرته آخر ٧ أيام)" : `📌 ${source.title}`}</p>
            <button onClick={() => setSource({ kind: "idea" })} className="shrink-0 text-sm text-muted hover:text-foreground">
              ✕ اكتب فكرة بدالها
            </button>
          </div>
        )}

        {/* اختصارات */}
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
          <button onClick={inspire} disabled={thinking} className={chip(false)}>
            {thinking ? "بيفكر..." : "💡 مش عارف؟ اقترحلي"}
          </button>
          <button onClick={() => setSource({ kind: "week" })} className={chip(source.kind === "week")}>
            📺 فيديو الأسبوع
          </button>
          {entries.slice(0, 8).map((e) => (
            <button
              key={e.id}
              onClick={() => setSource({ kind: "entry", id: e.id, title: e.title })}
              className={chip(source.kind === "entry" && source.id === e.id)}
            >
              📌 {e.title}
            </button>
          ))}
        </div>

        {ideas.length > 0 && (
          <div className="mt-3 space-y-2">
            <p className="text-xs text-muted">دوس على أي فكرة:</p>
            {ideas.map((it) => (
              <button
                key={it}
                onClick={() => {
                  setSource({ kind: "idea" });
                  setIdea(it);
                  setIdeas([]);
                }}
                className="block w-full rounded-xl border border-border bg-background/50 px-4 py-2.5 text-right text-sm transition hover:border-gold/50"
              >
                💡 {it}
              </button>
            ))}
          </div>
        )}

        <button onClick={make} disabled={making || !ready} className="btn mt-5 w-full py-4 text-lg">
          {making ? "بيكتب ويخرج... (ثواني)" : "اعمل الفيديو كامل ✨"}
        </button>
      </div>

      {error && <p className="rounded-xl border border-red-400/30 bg-red-400/5 px-4 py-3 text-sm text-red-400">{error}</p>}

      {(making || thinking) && (
        <div role="status" className="flex flex-col items-center rounded-2xl border border-gold/30 bg-surface p-5 text-center">
          <LottieAnimation name="ai-loading" fallback="🤖" loop className="size-32" />
          <p className="mt-2 font-bold text-gold">{making ? "بيجهّز الفيديو بتاعك..." : "بيدوّر لك على أفكار..."}</p>
          <p className="mt-1 text-sm text-muted">{making ? "بيكتب السكريبت ويرتّب اللقطات ويجهّز كلام النشر." : "بيختار أفكار تناسب قصتك واللي بتشتغل عليه."}</p>
        </div>
      )}

      {/* ٢. الفيديو */}
      {pkg && <VideoPackageView pkg={pkg} />}

      {/* ٣. أسلوبك (اختياري) */}
      <div className="rounded-2xl border border-border bg-surface p-4">
        <button onClick={() => setStyleOpen((o) => !o)} className="flex w-full items-center justify-between text-right">
          <span>
            <span className="font-bold">🗣️ علّمه أسلوبك</span>
            <span className="mr-2 text-xs text-muted">{initialStyle ? "متحفظ ✓" : "اختياري، بس بيفرق"}</span>
          </span>
          <span className="text-muted">{styleOpen ? "▲" : "▼"}</span>
        </button>
        {styleOpen && (
          <div className="mt-3 space-y-2">
            <p className="text-sm text-muted">الصق ٣–٥ أمثلة من كلامك في فيديوهاتك أو كابشناتك القديمة، وهو هيكتب زيك.</p>
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
                احفظ
              </button>
              {styleSaved && <span className={`text-sm ${styleSaved.startsWith("اتحفظ") ? "text-green" : "text-red-400"}`}>{styleSaved}</span>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
