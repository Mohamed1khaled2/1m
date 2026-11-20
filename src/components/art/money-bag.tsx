/** شنطة المليون اللي فوق السلم، بتلمع وطالع منها عملات. */
export function MoneyBag({ width = 64 }: { width?: number }) {
  return (
    <svg viewBox="0 0 80 84" width={width} height={(width * 84) / 80} className="anim-glow overflow-visible" aria-hidden>
      <circle className="anim-float" style={{ animationDelay: "0s" }} cx="22" cy="14" r="5" fill="#ffe08a" stroke="#c18c16" strokeWidth="1.5" />
      <circle className="anim-float" style={{ animationDelay: "0.8s" }} cx="58" cy="10" r="4" fill="#ffe08a" stroke="#c18c16" strokeWidth="1.5" />
      <circle className="anim-float" style={{ animationDelay: "1.5s" }} cx="40" cy="4" r="3.5" fill="#ffe08a" stroke="#c18c16" strokeWidth="1.5" />
      <path d="M28 22 q12 8 24 0 l-5 10 h-14z" fill="#1f8f55" />
      <path d="M33 32 h14 q24 14 22 34 q-2 16 -29 16 q-27 0 -29 -16 q-2 -20 22 -34z" fill="#2fd27a" />
      <path d="M33 32 h14 q24 14 22 34 q-2 16 -29 16" fill="none" stroke="#1f8f55" strokeWidth="2" opacity="0.6" />
      <rect x="31" y="29" width="18" height="6" rx="3" fill="#f6c544" />
      <text x="40" y="66" textAnchor="middle" fontSize="20" fontWeight="900" fill="#0a3b22" fontFamily="sans-serif">
        1M
      </text>
    </svg>
  );
}
