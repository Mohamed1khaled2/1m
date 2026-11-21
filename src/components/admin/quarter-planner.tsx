"use client";

import { useState, useTransition } from "react";
import { generateQuarterPlan, type QuarterPlan } from "@/app/admin/ai-actions";
import { LottieAnimation } from "@/components/lottie-animation";

export type PlanItem = { text: string; kind: "milestone" | "ongoing" };

/**
 * خطة الربع بالـ AI: بيعرف مشروع الربع وتفاصيله من الموقع، ويقترح خطة ٣ شهور.
 * مفيش حاجة بتتحفظ لوحدها: إنت بتختار أنهي جزء يدخل الخطة، وبعدين تحفظ.
 */
export function QuarterPlanner({
  quarter,
  onAdd,
}: {
  quarter: { q: number; months: string; year: number; name: string };
  onAdd: (items: PlanItem[]) => void;
}) {
  const [notes, setNotes] = useState("");
  const [plan, setPlan] = useState<QuarterPlan | null>(null);
  const [added, setAdded] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function make() {
    setError(null);
    start(async () => {
      const res = await generateQuarterPlan(notes);
      if (res.error) return setError(res.error);
      setPlan(res.plan ?? null);
      setAdded(new Set());
    });
  }

  function add(key: string, items: PlanItem[]) {
    onAdd(items);
    setAdded((s) => new Set(s).add(key));
  }

  const addButton = (key: string, items: PlanItem[]) => (
    <button onClick={() => add(key, items)} disabled={added.has(key) || items.length === 0} className="btn-ghost shrink-0 text-xs">
      {added.has(key) ? "اتضافت ✓" : "ضيفها للخطة"}
    </button>
  );

  return (
    <div className="space-y-4">
      <div className="rounded-3xl border border-gold/30 bg-gradient-to-b from-surface-2 to-surface p-5">
        <p className="text-xs font-bold text-gold">
          Q{quarter.q} · {quarter.months} {quarter.year}
        </p>
        <p className="mt-1 text-lg font-black">عاوز أفكار زيادة لخطة {quarter.name}؟</p>
        <p className="mt-1 text-sm text-muted">اختياري: Gemini يقترح خطة ٣ شهور، وإنت تضيف منها اللي يعجبك للخطة اللي فوق.</p>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          maxLength={2000}
          placeholder="ملاحظاتك (اختياري): وصلت لفين، معاك ميزانية قد إيه، إيه اللي واقف..."
          className="input mt-4 resize-y text-sm leading-relaxed"
        />
        <button onClick={make} disabled={pending} className="btn mt-4 w-full py-3">
          {pending ? "بيخطط... (ثواني)" : plan ? "اعمل خطة تانية ✨" : "اعمل خطة الربع ✨"}
        </button>
      </div>

      {error && <p className="rounded-xl border border-red-400/30 bg-red-400/5 px-4 py-3 text-sm text-red-400">{error}</p>}

      {pending && (
        <div role="status" className="flex flex-col items-center rounded-2xl border border-gold/30 bg-surface p-5 text-center">
          <LottieAnimation name="ai-loading" fallback="🤖" loop className="size-32" />
          <p className="mt-2 font-bold text-gold">بيجهّز خطة الربع...</p>
        </div>
      )}

      {plan && !pending && (
        <div className="space-y-3">
          <div className="rounded-2xl border border-gold/40 bg-gold/5 p-4">
            <p className="text-xs font-bold text-gold">هدف الربع</p>
            <p className="mt-1 text-lg font-black">{plan.goal}</p>
          </div>

          {plan.prep.length > 0 && (
            <Block title="قبل ما الربع يبدأ" action={addButton("prep", plan.prep.map((t) => ({ text: `قبل ما يبدأ: ${t}`, kind: "milestone" })))}>
              <List items={plan.prep} />
            </Block>
          )}

          {plan.months.map((m) => (
            <Block
              key={m.month}
              title={m.month}
              sub={m.focus}
              action={addButton(m.month, m.steps.map((t) => ({ text: `${m.month}: ${t}`, kind: "milestone" })))}
            >
              <List items={m.steps} />
            </Block>
          ))}

          <Block title="كل أسبوع" action={addButton("weekly", plan.weekly.map((t) => ({ text: t, kind: "ongoing" })))}>
            <List items={plan.weekly} />
          </Block>

          <Block title="هتعرف إنه نجح إزاي">
            <List items={plan.measure} />
          </Block>
          <Block title="فيديوهات الربع" sub="خد أي فكرة وحطها في المخرج.">
            <List items={plan.videos} />
          </Block>
          <Block title="اللي ممكن يوقّعك">
            <List items={plan.risks} />
          </Block>
        </div>
      )}
    </div>
  );
}

function Block({ title, sub, action, children }: { title: string; sub?: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-black">{title}</p>
          {sub && <p className="text-xs text-muted">{sub}</p>}
        </div>
        {action}
      </div>
      <div className="mt-2">{children}</div>
    </div>
  );
}

function List({ items }: { items: string[] }) {
  return (
    <ul className="list-disc space-y-1 pr-5 text-sm leading-relaxed">
      {items.map((it) => (
        <li key={it}>{it}</li>
      ))}
    </ul>
  );
}
