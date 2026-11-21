"use client";

import { useState } from "react";
import type { VideoPackage } from "@/app/admin/ai-actions";

function CopyButton({ text, label = "انسخ" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      }}
      className="btn-ghost shrink-0 py-1 text-xs"
    >
      {copied ? "اتنسخ ✓" : label}
    </button>
  );
}

const TABS = [
  { key: "hook", label: "🎯 الفكرة" },
  { key: "shoot", label: "🎥 التصوير" },
  { key: "post", label: "📝 النشر" },
] as const;

/** الفيديو كامل في ٣ أجزاء: الفكرة والـ Hook، ورقة التصوير (لقطة لقطة)، والنشر. */
export function VideoPackageView({ pkg }: { pkg: VideoPackage }) {
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("hook");
  const [done, setDone] = useState<Set<number>>(new Set());
  const total = pkg.shots.reduce((s, x) => s + (x.seconds || 0), 0);
  const script = pkg.shots.filter((s) => s.line).map((s) => s.line).join("\n");

  function toggle(n: number) {
    setDone((d) => {
      const next = new Set(d);
      if (next.has(n)) next.delete(n);
      else next.add(n);
      return next;
    });
  }

  return (
    <div className="animate-[fade-up_0.4s_ease-out] space-y-4">
      <div className="rounded-2xl border border-gold/30 bg-gold/5 p-5">
        <p className="text-xs font-bold text-gold">🎬 الفيديو جاهز</p>
        <h3 className="mt-1 text-xl font-black">{pkg.title}</h3>
        <p className="mt-1 text-muted">{pkg.idea}</p>
        <p className="mt-2 text-xs text-muted">
          {pkg.shots.length} لقطة · حوالي {Math.round(total)} ثانية
        </p>
      </div>

      <div className="grid grid-cols-3 gap-1 rounded-2xl border border-border bg-surface p-1">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`rounded-xl py-2.5 text-sm transition ${tab === t.key ? "bg-gold font-bold text-black" : "text-muted hover:text-foreground"}`}
          >
            {t.label}
            {t.key === "shoot" && done.size > 0 && <span className="mr-1 text-xs">({done.size}/{pkg.shots.length})</span>}
          </button>
        ))}
      </div>

      {tab === "hook" && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-surface p-5">
            <p className="text-xs font-bold text-gold">أول ٣ ثواني</p>
            <p className="mt-2 text-xl leading-relaxed font-black">“{pkg.hook.line}”</p>
            {pkg.hook.on_screen && (
              <p className="mt-3 inline-block rounded-lg bg-background px-3 py-1 text-sm font-bold text-gold">على الشاشة: {pkg.hook.on_screen}</p>
            )}
          </div>
          {pkg.hook.alternatives.length > 0 && (
            <div className="rounded-2xl border border-border bg-surface p-5">
              <p className="mb-2 text-sm font-bold">بدائل للـ Hook</p>
              <ul className="space-y-2 text-muted">
                {pkg.hook.alternatives.map((a, i) => (
                  <li key={i}>• {a}</li>
                ))}
              </ul>
            </div>
          )}
          <div className="rounded-2xl border border-border bg-surface p-5">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-bold">السكريبت كله (تقرأه قبل ما تصوّر)</p>
              <CopyButton text={script} />
            </div>
            <p className="leading-loose whitespace-pre-line">{script}</p>
          </div>
          <button onClick={() => setTab("shoot")} className="btn w-full py-3">
            يلا نصوّر ←
          </button>
        </div>
      )}

      {tab === "shoot" && (
        <div className="space-y-3">
          <div className="rounded-2xl border border-border bg-surface p-4">
            <p className="mb-2 font-bold">📋 قبل ما تصوّر</p>
            <ul className="space-y-1 text-sm text-muted">
              {pkg.prep.map((p, i) => (
                <li key={i}>• {p}</li>
              ))}
            </ul>
            {pkg.order && <p className="mt-3 rounded-xl bg-background/60 px-3 py-2 text-sm">🔁 {pkg.order}</p>}
          </div>

          {pkg.shots.map((s) => {
            const isDone = done.has(s.n);
            return (
              <div key={s.n} className={`rounded-2xl border p-4 transition ${isDone ? "border-green/40 bg-green/5 opacity-70" : "border-border bg-surface"}`}>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="flex size-8 items-center justify-center rounded-full bg-gold text-sm font-black text-black">{s.n}</span>
                    <span className="font-black">{s.shot}</span>
                    <span className="text-xs text-muted tabular-nums">· {s.seconds} ث</span>
                  </div>
                  <button
                    onClick={() => toggle(s.n)}
                    className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-bold transition ${isDone ? "border-green bg-green text-black" : "border-border text-muted hover:border-green"}`}
                  >
                    {isDone ? "✓" : "صوّرتها"}
                  </button>
                </div>
                {s.line && <p className="mt-3 rounded-xl bg-background/60 px-3 py-2 text-lg leading-relaxed font-bold">🎙️ “{s.line}”</p>}
                <dl className="mt-3 grid gap-1.5 text-sm">
                  <div className="flex gap-2">
                    <dt className="w-16 shrink-0 text-muted">📷</dt>
                    <dd>{s.camera}</dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="w-16 shrink-0 text-muted">📍</dt>
                    <dd>{s.where}</dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="w-16 shrink-0 text-muted">🎭</dt>
                    <dd>
                      {s.action} <span className="text-muted">· {s.face}</span>
                    </dd>
                  </div>
                  {s.on_screen && (
                    <div className="flex gap-2">
                      <dt className="w-16 shrink-0 text-muted">🔤</dt>
                      <dd className="font-bold text-gold">{s.on_screen}</dd>
                    </div>
                  )}
                </dl>
                <p className="mt-2 text-sm text-muted">
                  <span className="font-bold text-foreground">المخرج:</span> {s.note}
                </p>
              </div>
            );
          })}

          {pkg.broll.length > 0 && (
            <div className="rounded-2xl border border-border bg-surface p-4">
              <p className="mb-2 font-bold">🎞️ صوّر كمان (B-roll)</p>
              <ul className="space-y-1 text-sm text-muted">
                {pkg.broll.map((b, i) => (
                  <li key={i}>• {b}</li>
                ))}
              </ul>
            </div>
          )}
          <button onClick={() => setTab("post")} className="btn w-full py-3">
            خلصت تصوير، يلا ننشر ←
          </button>
        </div>
      )}

      {tab === "post" && (
        <div className="space-y-3">
          <div className="rounded-2xl border border-border bg-surface p-4">
            <div className="mb-2 flex items-center justify-between">
              <p className="font-bold">الكابشن</p>
              <CopyButton text={`${pkg.caption}\n\n${pkg.hashtags.join(" ")}`} label="انسخ مع الهاشتاجات" />
            </div>
            <p className="leading-relaxed whitespace-pre-line">{pkg.caption}</p>
            <p className="mt-2 text-sm text-gold" dir="ltr">
              {pkg.hashtags.join(" ")}
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-surface p-4">
            <p className="mb-2 font-bold">عناوين (يوتيوب)</p>
            <ul className="space-y-2">
              {pkg.titles.map((t, i) => (
                <li key={i} className="flex items-center justify-between gap-3">
                  <span>{t}</span>
                  <CopyButton text={t} />
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-border bg-surface p-4">
            <p className="mb-2 font-bold">كلام الثامبنيل</p>
            <div className="flex flex-wrap gap-2">
              {pkg.thumbnail.map((t, i) => (
                <span key={i} className="rounded-xl bg-background px-3 py-2 text-lg font-black text-gold">
                  {t}
                </span>
              ))}
            </div>
          </div>
          <p className="text-center text-sm text-muted">بعد ما تنشر، ارجع تاب «انشر» وحط لينك الفيديو في اليومية ✓</p>
        </div>
      )}
    </div>
  );
}
