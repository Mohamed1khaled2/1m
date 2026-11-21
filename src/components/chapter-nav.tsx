"use client";

import { useEffect, useState } from "react";

/**
 * شريط الفصول الثابت فوق: بيظهر بعد ما الزائر ينزل من المقدمة، والفصل اللي هو فيه منوّر،
 * ودوسة على أي فصل بتنزّله عليه. على الموبايل بيتسحب بالعرض.
 */
export function ChapterNav({ items }: { items: { id: string; label: string }[] }) {
  const [visible, setVisible] = useState(false);
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > window.innerHeight * 0.7);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
      },
      // الفصل بيبقى "الحالي" لما يعدّي في الشريط اللي فوق نص الشاشة
      { rootMargin: "-30% 0px -60% 0px" },
    );
    items.forEach((it) => {
      const el = document.getElementById(it.id);
      if (el) io.observe(el);
    });

    return () => {
      window.removeEventListener("scroll", onScroll);
      io.disconnect();
    };
  }, [items]);

  return (
    <nav
      className={`fixed inset-x-0 top-0 z-40 border-b border-border bg-background/85 backdrop-blur-md transition duration-300 ${
        visible ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-full opacity-0"
      }`}
      aria-label="فصول القصة"
    >
      <div className="mx-auto flex max-w-2xl items-center gap-1 overflow-x-auto px-3 py-2 [scrollbar-width:none]">
        <a href="#top" className="shrink-0 rounded-full px-3 py-1.5 text-sm font-black text-gold">
          1M
        </a>
        {items.map((it) => (
          <a
            key={it.id}
            href={`#${it.id}`}
            className={`shrink-0 rounded-full px-3 py-1.5 text-sm transition ${
              active === it.id ? "bg-gold font-bold text-black" : "text-muted hover:text-foreground"
            }`}
          >
            {it.label}
          </a>
        ))}
      </div>
    </nav>
  );
}
