"use client";

import { useEffect, useState } from "react";

/**
 * زرار مسح بتأكيد جوه الزرار نفسه (بدل confirm بتاع المتصفح):
 * أول دوسة بتسأل "متأكد؟"، والتانية بتنفّذ، ولو سبته بيرجع لوحده.
 */
export function ConfirmButton({
  onConfirm,
  label = "امسح",
  confirmLabel = "متأكد؟ امسح",
  className = "",
}: {
  onConfirm: () => void;
  label?: string;
  confirmLabel?: string;
  className?: string;
}) {
  const [asking, setAsking] = useState(false);

  useEffect(() => {
    if (!asking) return;
    const id = setTimeout(() => setAsking(false), 4000);
    return () => clearTimeout(id);
  }, [asking]);

  if (!asking) {
    return (
      <button type="button" onClick={() => setAsking(true)} className={`shrink-0 text-sm text-muted transition hover:text-red-400 ${className}`}>
        {label}
      </button>
    );
  }

  return (
    <span className="inline-flex shrink-0 animate-[fade-up_0.2s_ease-out] items-center gap-1">
      <button
        type="button"
        onClick={() => {
          setAsking(false);
          onConfirm();
        }}
        className="rounded-full bg-red-500 px-3 py-1 text-xs font-bold text-white transition hover:bg-red-600 active:scale-95"
      >
        {confirmLabel}
      </button>
      <button type="button" onClick={() => setAsking(false)} className="rounded-full px-2 py-1 text-xs text-muted hover:text-foreground">
        لا
      </button>
    </span>
  );
}
