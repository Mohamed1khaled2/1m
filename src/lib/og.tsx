import { ImageResponse } from "next/og";
import type { CSSProperties } from "react";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { GOAL, YEAR } from "@/lib/year";

export const ogSize = { width: 1200, height: 630 };

const fonts = Promise.all(
  [700, 900].map(async (weight) => ({
    name: "Cairo",
    data: await readFile(join(process.cwd(), `src/assets/fonts/Cairo-${weight}.ttf`)),
    weight: weight as 700 | 900,
    style: "normal" as const,
  })),
);

const C = { bg: "#0a0d0b", surface: "#121714", border: "#26302a", fg: "#f2f5f3", muted: "#8d9a92", gold: "#f6c544", green: "#2fd27a" };

// أرقام إنجليزي في الصورة: الصفر العربي (٠) بيبان نقطة في الخط الكبير
const num = (n: number) => new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(n);

/**
 * المولّد (Satori) بيشبّك الحروف العربي صح بس بيرصّ الكلمات من الشمال لليمين.
 * فبنقسّم السطر كلمات ونعكس ترتيبها، وكل الصفوف في الصورة مترتبة بالعكس لنفس السبب.
 */
function Rtl({ text, style }: { text: string; style?: CSSProperties }) {
  return (
    <div style={{ display: "flex", gap: "0.18em", ...style }}>
      {text.split(" ").reverse().map((w, i) => (
        <span key={i}>{w}</span>
      ))}
    </div>
  );
}

/** صورة المعاينة: لو في `total` بتبقى كارت رحلة شخص، غير كده بتبقى صورة الموقع. */
export async function renderOg({ name, total }: { name?: string; total?: number }) {
  const journey = total !== undefined;
  const pct = journey ? Math.min(100, (total / GOAL) * 100) : 0;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          justifyContent: "space-between",
          padding: "56px 72px",
          fontFamily: "Cairo",
          color: C.fg,
          background: `radial-gradient(70% 60% at 50% 0%, rgba(246,197,68,0.18), transparent 70%), ${C.bg}`,
        }}
      >
        <div style={{ display: "flex", width: "100%", justifyContent: "space-between", alignItems: "center", fontSize: 30 }}>
          <span style={{ color: C.gold, fontWeight: 900 }}>1M</span>
          <div style={{ display: "flex", gap: "0.3em", color: C.muted }}>
            <span>{YEAR}</span>
            <span>·</span>
            <Rtl text="رحلة المليون" />
          </div>
        </div>

        {journey ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
            <Rtl text={name ?? "واحد مننا"} style={{ fontSize: 48, fontWeight: 700 }} />
            <Rtl text="معايا دلوقتي" style={{ fontSize: 34, color: C.muted, marginTop: 4 }} />
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <span style={{ fontSize: 40, color: C.muted }}>جنيه</span>
              <span style={{ fontSize: 124, fontWeight: 900, color: C.gold, lineHeight: 1.15 }}>{num(total)}</span>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", fontSize: 80, fontWeight: 900, lineHeight: 1.35 }}>
            <Rtl text="عملت إيه عشان تجمع" />
            <div style={{ display: "flex", gap: "0.18em", color: C.gold }}>
              <span>جنيه</span>
              <span>{num(GOAL)}</span>
            </div>
            <Rtl text="في سنة؟" />
          </div>
        )}

        {journey ? (
          <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                width: "100%",
                height: 28,
                borderRadius: 14,
                background: C.surface,
                border: `2px solid ${C.border}`,
              }}
            >
              <div
                style={{
                  width: `${Math.max(pct, 1.5)}%`,
                  height: "100%",
                  borderRadius: 14,
                  background: `linear-gradient(to left, ${C.gold}, ${C.green})`,
                }}
              />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 14, fontSize: 30 }}>
              <div style={{ display: "flex", gap: "0.18em", color: C.muted }}>
                <span>جنيه</span>
                <span>{num(GOAL)}</span>
                <span>الهدف</span>
              </div>
              <div style={{ display: "flex", gap: "0.18em", color: C.green, fontWeight: 900 }}>
                <Rtl text="من الطريق" />
                <span>{`${pct.toFixed(pct < 10 ? 1 : 0)}%`}</span>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", gap: "0.4em", fontSize: 34, color: C.muted }}>
            <Rtl text="إيميلات في السنة" />
            <span>4</span>
            <span>·</span>
            <span>صناديق</span>
            <span>4</span>
            <span>·</span>
            <Rtl text="اكتب خطتك" />
          </div>
        )}
      </div>
    ),
    { ...ogSize, fonts: await fonts },
  );
}
