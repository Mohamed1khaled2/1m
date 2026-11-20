/** علامة "أنا هنا" اللي بتطلع السلم: مكانك على الطريق للمليون. */
export function YouMarker({ label = "أنا هنا" }: { label?: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="anim-glow rounded-full bg-gold px-2.5 py-1 text-[11px] font-black whitespace-nowrap text-black shadow-lg">
        {label}
      </span>
      <svg viewBox="0 0 20 26" width="18" height="24" aria-hidden>
        <path d="M10 26 L3 12 A8 8 0 1 1 17 12 Z" fill="#f6c544" />
        <circle cx="10" cy="9" r="3.5" fill="#0a0d0b" />
      </svg>
    </div>
  );
}
