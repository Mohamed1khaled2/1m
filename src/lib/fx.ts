"use client";

import confetti from "canvas-confetti";

const COLORS = ["#f6c544", "#2fd27a", "#ffe08a", "#ffffff"];

/** احتفال. `big` للحاجات الكبيرة (فلوس دخلت)، والصغير لباقي الحفظ. */
export function celebrate(big = false) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (!big) {
    confetti({ particleCount: 60, spread: 70, origin: { y: 0.8 }, colors: COLORS, scalar: 0.9 });
    return;
  }
  const end = Date.now() + 900;
  (function frame() {
    confetti({ particleCount: 6, angle: 60, spread: 60, origin: { x: 0, y: 0.75 }, colors: COLORS });
    confetti({ particleCount: 6, angle: 120, spread: 60, origin: { x: 1, y: 0.75 }, colors: COLORS });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
}
