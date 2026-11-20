import Link from "next/link";
import { Reveal } from "@/components/reveal";
import type { Project, Step } from "@/lib/journey";

/** أول مشروع اسمه مكتوب في الخطوة (عشان نحط جنبها لينك لقصته). */
function projectIn(text: string, projects: Project[]) {
  const t = text.toLowerCase();
  return projects.find((p) => t.includes(p.name.toLowerCase()));
}

/**
 * الخطة كلوحة مهام: الإجابة فوق، وتحتها الخطوات مترقمة واللي خلص منها متعلّم،
 * وعدّاد بيقول خلّص كام. الخطوة اللي فيها اسم مشروع بتوصّل لقصته.
 */
export function PlanBoard({ answer, steps, projects }: { answer: string; steps: Step[]; projects: Project[] }) {
  const done = steps.filter((s) => s.done).length;
  const pct = steps.length ? (done / steps.length) * 100 : 0;
  const nextId = steps.find((s) => !s.done)?.id;

  return (
    <div className="overflow-hidden rounded-3xl border border-border bg-gradient-to-b from-surface-2 to-surface">
      {answer && (
        <Reveal className="relative border-b border-border px-6 py-8">
          <span className="absolute top-2 right-4 text-6xl leading-none text-gold/20" aria-hidden>
            “
          </span>
          <p className="relative text-xl leading-relaxed font-bold sm:text-2xl">{answer}</p>
        </Reveal>
      )}

      {steps.length > 0 && (
        <div className="px-4 py-6 sm:px-6">
          <div className="mb-5 flex items-center justify-between gap-4">
            <p className="text-sm text-muted">
              خلّص <span className="font-black text-foreground tabular-nums">{done}</span> من{" "}
              <span className="font-black text-foreground tabular-nums">{steps.length}</span>
            </p>
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-background">
              <div className="h-full rounded-full bg-gradient-to-l from-gold to-green transition-all duration-700" style={{ width: `${Math.max(pct, 2)}%` }} />
            </div>
          </div>

          <ol className="space-y-2">
            {steps.map((s, i) => {
              const project = projectIn(s.text, projects);
              const isNext = s.id === nextId;
              return (
                <Reveal key={s.id} delay={Math.min(i, 5) * 70}>
                  <li
                    className={`flex items-center gap-3 rounded-2xl border px-3 py-3 transition ${
                      s.done ? "border-green/30 bg-green/5" : isNext ? "border-gold/50 bg-gold/5" : "border-border bg-background/40"
                    }`}
                  >
                    <span
                      className={`flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-black ${
                        s.done ? "bg-green text-black" : isNext ? "bg-gold text-black" : "bg-surface-2 text-muted"
                      }`}
                    >
                      {s.done ? "✓" : i + 1}
                    </span>
                    <span className={`min-w-0 flex-1 font-bold ${s.done ? "text-muted line-through" : ""}`}>{s.text}</span>
                    {isNext && <span className="shrink-0 rounded-full bg-gold/15 px-2 py-0.5 text-xs font-bold text-gold">شغال عليها</span>}
                    {project && (
                      <Link href={`/p/${project.slug}`} className="shrink-0 text-xs font-bold text-gold hover:underline">
                        {project.name} ←
                      </Link>
                    )}
                  </li>
                </Reveal>
              );
            })}
          </ol>
        </div>
      )}
    </div>
  );
}
