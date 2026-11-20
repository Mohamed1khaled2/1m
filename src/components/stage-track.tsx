import { STAGES, type Stage } from "@/lib/journey";

/** مراحل قصة المشروع: اللي عدّاها دهبي، والحالية منوّرة، والجاية باهتة. */
export function StageTrack({ stage, size = "sm" }: { stage: Stage; size?: "sm" | "lg" }) {
  const at = STAGES.findIndex((s) => s.key === stage);
  const big = size === "lg";

  return (
    <div>
      <div className="flex items-center" aria-hidden>
        {STAGES.map((s, i) => (
          <div key={s.key} className="flex flex-1 items-center last:flex-none">
            <span
              className={`flex shrink-0 items-center justify-center rounded-full border-2 transition ${
                big ? "size-10 text-lg" : "size-7 text-xs"
              } ${i < at ? "border-gold/60 bg-gold/20" : i === at ? "anim-glow border-gold bg-gold text-black" : "border-border bg-surface opacity-50"}`}
            >
              {s.icon}
            </span>
            {i < STAGES.length - 1 && <span className={`h-0.5 flex-1 ${i < at ? "bg-gold/60" : "bg-border"}`} />}
          </div>
        ))}
      </div>
      <p className={`mt-2 font-bold text-gold ${big ? "text-lg" : "text-sm"}`}>
        {STAGES[at].icon} {STAGES[at].label}
      </p>
    </div>
  );
}
