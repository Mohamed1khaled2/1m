"use client";

import { useEffect, useState } from "react";
import { YEAR } from "@/lib/year";

const pad = (n: number) => String(n).padStart(2, "0");

/** نفس العدّاد بس في سطر واحد، للصفحات اللي العدّاد فيها مش هو البطل. */
export function CountdownInline() {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setNow(Date.now());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  if (now === null) return <p className="h-5" />;

  const start = new Date(YEAR, 0, 1).getTime();
  const end = new Date(YEAR + 1, 0, 1).getTime();
  if (now >= end) return <p className="text-sm text-muted">سنة {YEAR} خلصت.</p>;

  const before = now < start;
  const left = (before ? start : end) - now;
  const days = Math.floor(left / 86_400_000);
  const clock = `${pad(Math.floor(left / 3_600_000) % 24)}:${pad(Math.floor(left / 60_000) % 60)}:${pad(Math.floor(left / 1000) % 60)}`;

  return (
    <p className="text-sm text-muted">
      فاضل <span className="font-black text-foreground">{days}</span> يوم و
      <span dir="ltr" className="mx-1 font-mono text-foreground tabular-nums">
        {clock}
      </span>
      {before ? `على بداية ${YEAR}` : `على آخر ${YEAR}`}
    </p>
  );
}
