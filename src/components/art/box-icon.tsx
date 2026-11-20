const FRONT = "#c9965c";
const TOP = "#e2b67e";
const SIDE = "#a26c39";
const INSIDE = "#5a3a1c";
const TAPE = "rgba(255,240,210,0.45)";

/**
 * صندوق الربع بتلات حالات:
 * locked: مقفول بشريط وقفل (الربع لسه مابدأش)
 * open: مفتوح وفاضي (مستني تسجّل)
 * done: مفتوح وطالع منه فلوس (اتسجّل)
 */
export function BoxIcon({ state, width = 96 }: { state: "locked" | "open" | "done"; width?: number }) {
  const closed = state === "locked";

  return (
    <svg viewBox="0 0 140 110" width={width} height={(width * 110) / 140} className="overflow-visible" aria-hidden>
      {/* الجنب والوش */}
      <path d="M110 52 L124 38 L124 90 L110 104 Z" fill={SIDE} />
      <rect x="26" y="52" width="84" height="52" rx="2" fill={FRONT} />

      {closed ? (
        <>
          <path d="M26 52 L40 38 L124 38 L110 52 Z" fill={TOP} />
          <path d="M61 52 L75 38 L89 38 L75 52 Z" fill={TAPE} />
          <rect x="61" y="52" width="14" height="22" fill={TAPE} />
          {/* قفل */}
          <path d="M60 78 v-5 a8 8 0 0 1 16 0 v5" stroke="#4a2c13" strokeWidth="3" fill="none" />
          <rect x="56" y="77" width="24" height="18" rx="3" fill="#4a2c13" />
          <circle cx="68" cy="85" r="2.5" fill={TOP} />
        </>
      ) : (
        <>
          <path d="M26 52 L40 38 L124 38 L110 52 Z" fill={INSIDE} />
          {state === "done" && (
            <g>
              <rect className="anim-float" style={{ animationDelay: "0.3s" }} x="52" y="16" width="30" height="16" rx="2" fill="#2fd27a" stroke="#1f8f55" strokeWidth="1.5" transform="rotate(-12 67 24)" />
              <rect x="64" y="22" width="32" height="17" rx="2" fill="#2fd27a" stroke="#1f8f55" strokeWidth="1.5" transform="rotate(10 80 30)" />
              <text x="80" y="35" textAnchor="middle" fontSize="10" fontWeight="900" fill="#0a3b22" fontFamily="sans-serif" transform="rotate(10 80 30)">
                $
              </text>
              <circle className="anim-float" style={{ animationDelay: "1.1s" }} cx="48" cy="26" r="6" fill="#ffe08a" stroke="#c18c16" strokeWidth="1.5" />
              <circle cx="100" cy="34" r="5" fill="#ffe08a" stroke="#c18c16" strokeWidth="1.5" />
            </g>
          )}
          {/* القلابات مفتوحة لبره */}
          <path d="M26 52 L40 38 L22 22 L8 36 Z" fill={TOP} />
          <path d="M110 52 L124 38 L138 50 L124 64 Z" fill={TOP} opacity="0.9" />
          <path d="M26 52 L110 52 L100 66 L16 66 Z" fill={TOP} opacity="0.85" />
        </>
      )}
    </svg>
  );
}
