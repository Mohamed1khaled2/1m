"use client";

import { useEffect, useState } from "react";
import { YouMarker } from "@/components/art/you-marker";
import { MoneyBag } from "@/components/art/money-bag";

const COLS = 6; // الأرض + ٤ درجات + صندوق المليون
const HEIGHTS = [0, 44, 80, 116, 152, 188];
const LABELS = ["", "200K", "400K", "600K", "800K", ""];
const DEPTH = 12;

/**
 * سلّم المليون: كل درجة ٢٠٠ ألف، وعلامة "إنت هنا" على آخر درجة وصلها.
 * `step` من 0 (على الأرض) لـ 5 (فوق مع الشنطة). من غير `step` العلامة بتطلع السلم لوحدها وتعيد.
 */
export function Staircase({ step }: { step?: number }) {
  const [auto, setAuto] = useState(0);

  useEffect(() => {
    if (step !== undefined) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const id = setTimeout(() => setAuto(COLS - 1), 0);
      return () => clearTimeout(id);
    }
    let current = 0;
    let id: ReturnType<typeof setTimeout>;
    const next = () => {
      current = current >= COLS - 1 ? 0 : current + 1;
      setAuto(current);
      id = setTimeout(next, current === COLS - 1 ? 2200 : 900);
    };
    id = setTimeout(next, 900);
    return () => clearTimeout(id);
  }, [step]);

  const at = Math.max(0, Math.min(COLS - 1, step ?? auto));
  const colPct = 100 / COLS;

  return (
    <div className="relative mx-auto w-full max-w-xl select-none" style={{ height: HEIGHTS[COLS - 1] + 120 }}>
      <div className="absolute inset-x-0 bottom-0 h-px bg-border" />

      <div className="absolute inset-0 flex items-end">
        {HEIGHTS.map((h, i) => (
          <div key={i} className="flex h-full flex-1 flex-col items-center justify-end">
            {i === COLS - 1 && (
              <div className="mb-3" style={{ marginBottom: DEPTH + 4 }}>
                <MoneyBag width={54} />
              </div>
            )}
            {h > 0 && (
              <div
                className={`box3d flex w-[62%] items-end justify-center pb-1.5 ${i === COLS - 1 ? "gold" : ""}`}
                style={{ height: h, ["--d" as string]: `${DEPTH}px` }}
              >
                <span className="tape" />
                <span className="text-[10px] font-black sm:text-xs">{LABELS[i]}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* العلامة: بتتنقل بـ transition، والـ key بيعيد أنيميشن النطة مع كل درجة */}
      <div
        className="absolute transition-all duration-500 ease-out"
        style={{
          right: `${at * colPct + colPct / 2}%`,
          bottom: at === 0 ? 0 : HEIGHTS[at] + DEPTH / 2,
          transform: `translateX(calc(50% - ${at === COLS - 1 ? 22 : 0}px))`,
        }}
      >
        <div key={at} className="anim-hop">
          <YouMarker label={at === COLS - 1 ? "وصلت! 🎉" : "أنا هنا"} />
        </div>
      </div>
    </div>
  );
}

