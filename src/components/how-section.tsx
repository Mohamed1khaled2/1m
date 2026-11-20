import { Reveal } from "@/components/reveal";
import { GEAR, METHOD, TOOLS } from "@/lib/creator";

/** "إزاي هيحصل؟": الطريقة اللي بتتكرر، والعدّة، والأدوات. عشان الناس تشوف إن ده شغل مش حظ. */
export function HowSection() {
  const gear = [
    { icon: "📱", title: "iPhone 13 Pro Max", text: "كل التصوير." },
    { icon: "🎙️", title: "مايك", text: GEAR.audio },
    { icon: "💻", title: "لابتوب", text: "الكود، وتسجيل الشاشة." },
    { icon: "🏠", title: "أوضتي", text: "ستيب الكلام قدام الكاميرا." },
    { icon: "🚶", title: "برا", text: "شارع، كافيه، مكان الشغل." },
  ];

  return (
    <div className="space-y-14">
      {/* الطريقة: دايرة بتتكرر */}
      <div>
        <Reveal>
          <h3 className="mb-5 text-center text-lg font-black">الطريقة، كل أسبوع</h3>
        </Reveal>
        <ol className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {METHOD.map((m, i) => (
            <Reveal key={m.title} delay={i * 100}>
              <li className="relative flex h-full flex-col items-center rounded-2xl border border-border bg-gradient-to-b from-surface-2 to-surface p-4 text-center">
                <span className="absolute -top-2.5 right-3 flex size-6 items-center justify-center rounded-full bg-gold text-xs font-black text-black">
                  {i + 1}
                </span>
                <span className="text-3xl">{m.icon}</span>
                <p className="mt-2 font-black">{m.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-muted">{m.text}</p>
              </li>
            </Reveal>
          ))}
        </ol>
        <Reveal>
          <p className="mt-4 text-center text-sm text-muted">↻ وبعدين من الأول بمنتج تاني</p>
        </Reveal>
      </div>

      {/* العدّة */}
      <div>
        <Reveal>
          <h3 className="mb-5 text-center text-lg font-black">العدّة</h3>
        </Reveal>
        <div className="-mx-5 flex snap-x gap-3 overflow-x-auto px-5 pb-2 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-5 sm:overflow-visible sm:px-0">
          {gear.map((g, i) => (
            <Reveal key={g.title} delay={i * 80} className="w-32 shrink-0 snap-start sm:w-auto">
              <div className="flex h-full flex-col items-center rounded-2xl border border-border bg-surface p-4 text-center">
                <span className="text-3xl">{g.icon}</span>
                <p className="mt-2 text-sm font-black">{g.title}</p>
                <p className="mt-1 text-[11px] leading-relaxed text-muted">{g.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      {/* الأدوات */}
      <div>
        <Reveal>
          <h3 className="mb-5 text-center text-lg font-black">الأدوات</h3>
        </Reveal>
        <div className="grid gap-3 sm:grid-cols-2">
          {TOOLS.map((t, i) => (
            <Reveal key={t.title} delay={i * 100}>
              <div className="flex h-full items-start gap-4 rounded-2xl border border-border bg-surface p-4">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-gold/10 text-xl">{t.icon}</span>
                <div>
                  <p className="font-black">{t.title}</p>
                  <p className="mt-0.5 text-sm text-muted">{t.text}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  );
}
