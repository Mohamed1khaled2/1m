"use client";

import { useEffect, useRef, useState } from "react";
import type { AnimationItem } from "lottie-web";

type AnimationName = "coding" | "rocket-launch" | "money-tree" | "recording" | "ai-loading";

/** Load decorative animations near the viewport and pause them while hidden. */
export function LottieAnimation({
  name,
  fallback,
  className = "size-24",
  loop = false,
}: {
  name: AnimationName;
  fallback: string;
  className?: string;
  loop?: boolean;
}) {
  const container = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const element = container.current;
    if (!element) return;

    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let animation: AnimationItem | undefined;
    let disposed = false;
    let started = false;
    let visible = false;

    function syncPlayback() {
      if (!animation?.isLoaded) return;
      if (motion.matches) {
        animation.goToAndStop(Math.floor(animation.totalFrames / 2), true);
      } else if (visible && !document.hidden) {
        animation.play();
      } else {
        animation.pause();
      }
    }

    async function load() {
      if (started) return;
      started = true;
      try {
        const { default: lottie } = await import("lottie-web");
        if (disposed) return;
        animation = lottie.loadAnimation({
          container: element!,
          renderer: "svg",
          path: `/animations/${name}/animation.json`,
          assetsPath: `/animations/${name}/images/`,
          autoplay: false,
          loop,
          rendererSettings: { preserveAspectRatio: "xMidYMid meet", focusable: false },
        });
        animation.addEventListener("DOMLoaded", () => {
          if (disposed) return;
          setLoaded(true);
          syncPlayback();
        });
      } catch {
        // Keep the original icon if the player cannot load.
      }
    }

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) void load();
      syncPlayback();
    }, { threshold: 0.15 });
    observer.observe(element);
    motion.addEventListener("change", syncPlayback);
    document.addEventListener("visibilitychange", syncPlayback);

    return () => {
      disposed = true;
      observer.disconnect();
      motion.removeEventListener("change", syncPlayback);
      document.removeEventListener("visibilitychange", syncPlayback);
      animation?.destroy();
    };
  }, [name, loop]);

  return (
    <div aria-hidden="true" className={`relative shrink-0 ${className}`}>
      {!loaded && <span className="absolute inset-0 flex items-center justify-center text-3xl">{fallback}</span>}
      <div ref={container} className="size-full" />
    </div>
  );
}
