import Image from "next/image";
import { Reveal } from "@/components/reveal";
import type { ProjectDetails as Details } from "@/lib/project-details";

/** صفحة المشروع: بيعمل إيه، المشكلة، المميزات، الصور، لمين، ومعمول بإيه. */
export function ProjectDetails({ details: d, name }: { details: Details; name: string }) {
  return (
    <div className="space-y-20">
      <section>
        <Reveal>
          <h2 className="text-2xl font-black">بيعمل إيه؟</h2>
          <p className="mt-3 text-lg leading-relaxed">{d.what}</p>
        </Reveal>
        {d.problem && (
          <Reveal className="mt-6 rounded-2xl border-r-4 border-red-400/60 bg-red-400/5 px-5 py-4">
            <p className="text-xs font-bold text-red-400">المشكلة</p>
            <p className="mt-1 leading-relaxed text-muted">{d.problem}</p>
          </Reveal>
        )}
      </section>

      {d.gallery && d.gallery.length > 0 && (
        <section>
          <Reveal>
            <h2 className="text-2xl font-black">من جوه {name}</h2>
          </Reveal>
          <div className="-mx-5 mt-6 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-4 [scrollbar-width:none]">
            {d.gallery.map((g, i) => (
              <Reveal key={g.src} delay={i * 90} className="w-44 shrink-0 snap-center sm:w-48">
                <div className="rounded-[2rem] border-4 border-[#2a2f2c] bg-black p-1.5 shadow-2xl shadow-black/60">
                  <div className="relative aspect-[390/844] overflow-hidden rounded-[1.5rem]">
                    <Image src={g.src} alt={`${name}: ${g.label}`} fill sizes="200px" className="object-cover object-top" />
                  </div>
                </div>
                <p className="mt-2 text-center text-sm text-muted">{g.label}</p>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      <section>
        <Reveal>
          <h2 className="text-2xl font-black">المميزات</h2>
        </Reveal>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {d.features.map((f, i) => (
            <Reveal key={f.title} delay={Math.min(i, 5) * 70}>
              <div className="flex h-full gap-4 rounded-2xl border border-border bg-surface p-4 transition hover:border-gold/40">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-gold/10 text-xl">{f.icon}</span>
                <div>
                  <h3 className="font-black">{f.title}</h3>
                  <p className="mt-0.5 text-sm leading-relaxed text-muted">{f.text}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {(d.audience || d.pricing) && (
        <section className="grid gap-6 sm:grid-cols-2">
          {d.audience && (
            <Reveal>
              <h2 className="text-lg font-black">لمين؟</h2>
              <ul className="mt-3 flex flex-wrap gap-2">
                {d.audience.map((a) => (
                  <li key={a} className="rounded-full border border-border bg-surface px-3 py-1.5 text-sm">
                    {a}
                  </li>
                ))}
              </ul>
            </Reveal>
          )}
          {d.pricing && (
            <Reveal>
              <h2 className="text-lg font-black">السعر</h2>
              <p className="mt-3 rounded-2xl border border-gold/30 bg-gold/5 px-4 py-3 font-bold text-gold">{d.pricing}</p>
            </Reveal>
          )}
        </section>
      )}

      <section>
        <Reveal>
          <h2 className="text-lg font-black">معمول بـ</h2>
          <ul className="mt-3 flex flex-wrap gap-2" dir="ltr">
            {d.stack.map((s) => (
              <li key={s} className="rounded-lg bg-[#07090a] px-3 py-1.5 font-mono text-sm text-green">
                {s}
              </li>
            ))}
          </ul>
        </Reveal>
      </section>
    </div>
  );
}
