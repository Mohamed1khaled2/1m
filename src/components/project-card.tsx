import Link from "next/link";
import { BrowserFrame } from "@/components/browser-frame";
import { Delta } from "@/components/entry-item";
import { coverOf } from "@/lib/covers";
import { CREATOR } from "@/lib/creator";
import { STAGES, type Project } from "@/lib/journey";

/**
 * كارت مشروع: المنتج نفسه في إطار متصفح فوق، والمرحلة منوّرة عليه،
 * وتحت الاسم والوصف ونقط المراحل. الكارت كله لينك لقصة المشروع.
 * المكان اللي بيشتغل فيه (kind = work) مالوش مراحل: ده شغل مش منتج هيتباع.
 */
export function ProjectCard({ project: p }: { project: Project }) {
  const cover = coverOf(p.slug);
  const at = STAGES.findIndex((s) => s.key === p.stage);
  const stage = STAGES[at];
  const work = p.kind === "work";

  return (
    <Link
      href={`/p/${p.slug}`}
      className="group relative block h-full overflow-hidden rounded-3xl border border-border bg-gradient-to-b from-surface-2 to-surface p-4 transition duration-300 hover:-translate-y-1 hover:border-gold/50 hover:shadow-2xl hover:shadow-gold/5 active:scale-[0.99]"
    >
      {/* توهج ورا الصورة */}
      <div className="pointer-events-none absolute -top-20 left-1/2 size-56 -translate-x-1/2 rounded-full bg-gold/10 blur-3xl transition group-hover:bg-gold/20" />

      <div className="relative">
        {cover ? (
          <BrowserFrame src={cover} url={p.url} alt={p.name} className="transition duration-500 group-hover:-rotate-1 group-hover:scale-[1.02]" />
        ) : (
          <div className="flex aspect-[16/10] items-center justify-center rounded-xl border border-dashed border-border text-6xl">{stage.icon}</div>
        )}

        <span className="anim-glow absolute -bottom-3 right-4 rounded-full border border-gold bg-background px-3 py-1 text-sm font-black text-gold">
          {work ? `💼 بشتغل فيها ${CREATOR.role}` : `${stage.icon} ${stage.label}`}
        </span>
      </div>

      <div className="relative mt-7">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-2xl font-black">{p.name}</h3>
          {p.earned !== 0 && <Delta amount={p.earned} className="shrink-0 text-lg" />}
        </div>
        {p.tagline && <p className="mt-1 leading-relaxed text-muted">{p.tagline}</p>}

        {/* نقط المراحل (للمشاريع بس) */}
        {!work && (
        <>
        <div className="mt-4 flex items-center gap-1" aria-label={`المرحلة: ${stage.label}`}>
          {STAGES.map((s, i) => (
            <span
              key={s.key}
              title={s.label}
              className={`h-1.5 flex-1 rounded-full ${i < at ? "bg-gold/60" : i === at ? "bg-gold" : "bg-border"}`}
            />
          ))}
        </div>
        <div className="mt-1.5 flex justify-between text-[10px] text-muted">
          <span>{STAGES[0].label}</span>
          <span>{STAGES[STAGES.length - 1].label}</span>
        </div>
        </>
        )}

        <p className="mt-4 text-sm font-bold text-gold transition group-hover:translate-x-[-4px]">
          {work ? "شغلي فيها" : "قصته"}
          {p.entries > 0 ? ` (${p.entries})` : ""} ←
        </p>
      </div>
    </Link>
  );
}
