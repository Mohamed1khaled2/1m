"use client";

import { useState } from "react";
import type { ShotList } from "@/app/admin/ai-actions";

/** قايمة اللقطات زي ورقة التصوير: كل لقطة كارت، وتعلّم على اللي صوّرته. */
export function ShotListView({ list }: { list: ShotList }) {
  const [done, setDone] = useState<Set<number>>(new Set());
  const [copied, setCopied] = useState(false);
  const total = list.shots.reduce((s, x) => s + (x.seconds || 0), 0);

  function toggle(n: number) {
    setDone((d) => {
      const next = new Set(d);
      if (next.has(n)) next.delete(n);
      else next.add(n);
      return next;
    });
  }

  async function copy() {
    const text = [
      `🎬 ${list.title}`,
      list.idea,
      "",
      "قبل ما تصوّر:",
      ...list.prep.map((p) => `- ${p}`),
      "",
      ...list.shots.map(
        (s) =>
          `#${s.n} · ${s.shot} · ${s.seconds} ث\nالكاميرا: ${s.camera}\nالمكان: ${s.where}\nتعمل: ${s.action}\nوشك: ${s.face}${s.line ? `\nتقول: "${s.line}"` : ""}${s.on_screen ? `\nعلى الشاشة: ${s.on_screen}` : ""}\nالمخرج: ${s.note}`,
      ),
      "",
      "B-roll:",
      ...list.broll.map((b) => `- ${b}`),
      "",
      `ترتيب التصوير: ${list.order}`,
    ].join("\n");
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-gold/30 bg-gold/5 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold text-gold">🎬 ورقة التصوير</p>
            <h3 className="mt-1 text-xl font-black">{list.title}</h3>
            <p className="mt-1 text-muted">{list.idea}</p>
          </div>
          <button onClick={copy} className="btn-ghost shrink-0 py-1 text-xs">
            {copied ? "اتنسخ ✓" : "انسخ"}
          </button>
        </div>
        <p className="mt-3 text-sm text-muted">
          {list.shots.length} لقطة · حوالي {Math.round(total)} ثانية · صوّرت {done.size} من {list.shots.length}
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-surface p-4">
        <p className="mb-2 font-bold">📋 قبل ما تصوّر</p>
        <ul className="space-y-1 text-sm text-muted">
          {list.prep.map((p, i) => (
            <li key={i}>• {p}</li>
          ))}
        </ul>
      </div>

      <ol className="space-y-3">
        {list.shots.map((s) => {
          const isDone = done.has(s.n);
          return (
            <li key={s.n} className={`rounded-2xl border p-4 transition ${isDone ? "border-green/40 bg-green/5 opacity-70" : "border-border bg-surface"}`}>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="flex size-8 items-center justify-center rounded-full bg-gold text-sm font-black text-black">{s.n}</span>
                  <span className="font-black">{s.shot}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted tabular-nums">{s.seconds} ث</span>
                  <button
                    onClick={() => toggle(s.n)}
                    className={`rounded-full border px-2.5 py-1 text-xs font-bold transition ${isDone ? "border-green bg-green text-black" : "border-border text-muted hover:border-green"}`}
                  >
                    {isDone ? "اتصوّرت ✓" : "صوّرتها"}
                  </button>
                </div>
              </div>

              <dl className="mt-3 grid gap-2 text-sm">
                <div className="flex gap-2">
                  <dt className="w-20 shrink-0 text-muted">📷 الكاميرا</dt>
                  <dd>{s.camera}</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="w-20 shrink-0 text-muted">📍 المكان</dt>
                  <dd>{s.where}</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="w-20 shrink-0 text-muted">🎭 تعمل</dt>
                  <dd>{s.action}</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="w-20 shrink-0 text-muted">👀 وشك</dt>
                  <dd>{s.face}</dd>
                </div>
                {s.line && (
                  <div className="flex gap-2">
                    <dt className="w-20 shrink-0 text-muted">🎙️ تقول</dt>
                    <dd className="font-bold">“{s.line}”</dd>
                  </div>
                )}
                {s.on_screen && (
                  <div className="flex gap-2">
                    <dt className="w-20 shrink-0 text-muted">🔤 الشاشة</dt>
                    <dd className="rounded bg-background px-2 py-0.5 font-bold text-gold">{s.on_screen}</dd>
                  </div>
                )}
              </dl>
              <p className="mt-3 rounded-xl bg-background/60 px-3 py-2 text-sm text-muted">
                <span className="font-bold text-foreground">المخرج:</span> {s.note}
              </p>
            </li>
          );
        })}
      </ol>

      {list.broll.length > 0 && (
        <div className="rounded-2xl border border-border bg-surface p-4">
          <p className="mb-2 font-bold">🎞️ لقطات B-roll تصوّرها كمان</p>
          <ul className="space-y-1 text-sm text-muted">
            {list.broll.map((b, i) => (
              <li key={i}>• {b}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="rounded-2xl border border-border bg-surface p-4">
        <p className="mb-1 font-bold">🔁 ترتيب التصوير</p>
        <p className="text-sm text-muted">{list.order}</p>
      </div>
    </div>
  );
}
