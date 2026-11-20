"use client";

import { useEffect, useRef, useState } from "react";

/**
 * كارت تيرمينال بيكتب الأمر حرف حرف لما يظهر في الشاشة، وبعدين يطلّع النتيجة سطر سطر.
 * الأرقام حقيقية (جاية من الصفحة)، الشكل بس هو اللي "برمجة".
 */
export function Terminal({
  prompt,
  command,
  output,
}: {
  prompt: string;
  command: string;
  output: { key: string; value: string; tone?: "gold" | "green" | "red" | "muted" }[];
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [typed, setTyped] = useState(0);
  const [lines, setLines] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && (setStarted(true), io.disconnect()), { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      const id = setTimeout(() => (setTyped(command.length), setLines(output.length)), 0);
      return () => clearTimeout(id);
    }
    if (typed < command.length) {
      const id = setTimeout(() => setTyped((t) => t + 1), 55);
      return () => clearTimeout(id);
    }
    if (lines < output.length) {
      const id = setTimeout(() => setLines((l) => l + 1), lines === 0 ? 350 : 140);
      return () => clearTimeout(id);
    }
  }, [started, typed, lines, command.length, output.length]);

  const tone = { gold: "text-gold", green: "text-green", red: "text-red-400", muted: "text-muted" };

  return (
    <div ref={ref} dir="ltr" className="overflow-hidden rounded-2xl border border-border bg-[#07090a] text-left font-mono text-sm shadow-2xl shadow-black/50">
      <div className="flex items-center gap-1.5 border-b border-border px-4 py-2.5">
        <span className="size-3 rounded-full bg-[#ff5f57]" />
        <span className="size-3 rounded-full bg-[#febc2e]" />
        <span className="size-3 rounded-full bg-[#28c840]" />
        <span className="ml-3 text-xs text-muted">{prompt.split("@")[1]?.split(":")[0] ?? "terminal"}</span>
      </div>
      <div className="min-h-56 px-4 py-4 leading-7">
        <p>
          <span className="text-green">{prompt}</span> <span>{command.slice(0, typed)}</span>
          {typed < command.length && <span className="animate-pulse">▋</span>}
        </p>
        {output.slice(0, lines).map((l) => (
          <p key={l.key} className="grid grid-cols-[7.5rem_1fr]">
            <span className="text-muted">{l.key}</span>
            <span className={`tabular-nums ${tone[l.tone ?? "gold"]}`}>{l.value}</span>
          </p>
        ))}
        {lines === output.length && typed === command.length && (
          <p>
            <span className="text-green">{prompt}</span> <span className="animate-pulse">▋</span>
          </p>
        )}
      </div>
    </div>
  );
}
