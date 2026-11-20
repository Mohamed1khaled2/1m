"use client";

import { useState, useTransition } from "react";
import { savePlan } from "@/app/admin/actions";
import { Paper } from "@/components/paper";
import { celebrate } from "@/lib/fx";
import type { Step } from "@/lib/journey";

/** الخطة اللي بتظهر للناس في الصفحة الرئيسية: الإجابة والخطوات (تعلّم عليها لما تخلّصها). */
export function PlanForm({ initialAnswer, initialSteps }: { initialAnswer: string; initialSteps: Step[] }) {
  const [answer, setAnswer] = useState(initialAnswer);
  const [steps, setSteps] = useState(initialSteps);
  const [draft, setDraft] = useState("");
  const [status, setStatus] = useState<"idle" | "dirty" | "saved" | string>("idle");
  const [pending, start] = useTransition();

  const dirty = () => setStatus("dirty");

  function add() {
    const text = draft.trim();
    if (!text) return;
    setSteps((s) => [...s, { id: crypto.randomUUID().slice(0, 8), text, done: false }]);
    setDraft("");
    dirty();
  }

  function save() {
    start(async () => {
      const res = await savePlan({ answer, steps });
      if (res.error) return setStatus(res.error);
      setStatus("saved");
      celebrate();
    });
  }

  return (
    <div>
      <Paper>
        <p className="font-sans text-xs font-bold text-[#2b1a10]/50">هعمل إيه عشان أجمع مليون؟</p>
        <textarea
          value={answer}
          onChange={(e) => (setAnswer(e.target.value), dirty())}
          rows={5}
          maxLength={4000}
          placeholder="اكتب خطتك..."
          className="hand block w-full resize-none bg-transparent text-2xl leading-[var(--line)] placeholder:text-[#2b1a10]/30 focus:outline-none"
        />

        <p className="mt-2 font-sans text-xs font-bold text-[#2b1a10]/50">الخطوات</p>
        <ul>
          {steps.map((s) => (
            <li key={s.id} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={s.done}
                onChange={() => (setSteps((all) => all.map((x) => (x.id === s.id ? { ...x, done: !x.done } : x))), dirty())}
                className="size-5 shrink-0 accent-[#2b3a67]"
                aria-label="خلصت"
              />
              <input
                value={s.text}
                onChange={(e) => (setSteps((all) => all.map((x) => (x.id === s.id ? { ...x, text: e.target.value } : x))), dirty())}
                maxLength={300}
                className={`hand h-[var(--line)] flex-1 bg-transparent text-xl focus:outline-none ${s.done ? "text-[#2b1a10]/40 line-through" : ""}`}
              />
              <button
                onClick={() => (setSteps((all) => all.filter((x) => x.id !== s.id)), dirty())}
                className="px-2 text-[#2b1a10]/40 hover:text-[#e85d4a]"
                aria-label="امسح"
              >
                ✕
              </button>
            </li>
          ))}
          <li className="flex items-center gap-2">
            <span className="hand w-5 text-center text-xl text-[#e85d4a]">+</span>
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), add())}
              onBlur={add}
              maxLength={300}
              placeholder="خطوة جديدة..."
              className="hand h-[var(--line)] flex-1 bg-transparent text-xl placeholder:text-[#2b1a10]/30 focus:outline-none"
            />
          </li>
        </ul>
      </Paper>

      <div className="mt-6 flex items-center gap-3">
        <button onClick={save} disabled={pending || status === "idle" || status === "saved"} className="btn px-8">
          {pending ? "بيتحفظ..." : "احفظ الخطة"}
        </button>
        {status === "saved" && <span className="text-sm text-green">اتحفظت ✓ وظهرت في الموقع</span>}
        {status === "dirty" && <span className="text-sm text-muted">في تعديلات مش محفوظة</span>}
        {!["idle", "dirty", "saved"].includes(status) && <span className="text-sm text-red-400">{status}</span>}
      </div>
    </div>
  );
}
