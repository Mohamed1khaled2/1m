"use client";

import { useEffect, useState, useTransition } from "react";
import { sendCheer } from "@/app/cheer/actions";
import { celebrate } from "@/lib/fx";

/**
 * القلب اللي جنب الصورة هو "عاش" نفسه: دوسة = عاش (من غير اسم ولا أي بيانات).
 * العدد على القلب، والـ rate limit بيرد بسطر صغير تحته بيختفي لوحده.
 */
export function CheerHeart({ count, className = "" }: { count: number; className?: string }) {
  const [shown, setShown] = useState(count);
  const [note, setNote] = useState<string | null>(null);
  const [bump, setBump] = useState(0);
  const [pending, start] = useTransition();

  useEffect(() => {
    if (!note) return;
    const id = setTimeout(() => setNote(null), 3500);
    return () => clearTimeout(id);
  }, [note]);

  function cheer() {
    start(async () => {
      const res = await sendCheer({}, new FormData());
      if (res.error) return setNote(res.error);
      setShown((n) => n + 1);
      setBump((b) => b + 1);
      setNote("وصلت! شكراً ❤️");
      celebrate(true);
    });
  }

  return (
    <div className="relative shrink-0">
      <button
        onClick={cheer}
        disabled={pending}
        aria-label="قول عاش"
        title="قول عاش"
        className={`group relative flex size-[var(--d)] items-center justify-center rounded-full border-2 border-gold/50 bg-gold/10 transition duration-300 hover:-translate-y-1 hover:border-gold hover:shadow-[0_0_24px_-4px_var(--gold)] active:scale-90 ${className}`}
      >
        <span key={bump} className={`text-2xl leading-none sm:text-4xl ${bump ? "animate-[hop_0.5s_ease-out]" : ""}`}>
          ❤️
        </span>
        {shown > 0 && (
          <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full border border-gold/50 bg-background px-2 py-0.5 text-[11px] font-black text-gold tabular-nums">
            {shown}
          </span>
        )}
      </button>
      {note && (
        <p className="absolute top-full left-0 z-10 mt-3 w-44 animate-[fade-up_0.3s_ease-out] rounded-xl border border-gold/30 bg-surface px-3 py-2 text-center text-xs leading-relaxed shadow-xl">
          {note}
        </p>
      )}
    </div>
  );
}
