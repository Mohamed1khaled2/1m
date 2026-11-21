"use client";

import { useEffect, useState } from "react";

export type AdminTab = { key: string; label: string; icon: string; badge?: number; content: React.ReactNode };

/**
 * الأدمن تابات: كل حاجة لوحدها بدل صفحة طويلة. التاب المختار بيتحفظ في اللينك (#publish)
 * فالـ refresh بيرجّعك لنفس المكان. التابات التانية بتفضل موجودة (مستخبية) عشان اللي كتبته مايضيعش.
 */
export function AdminTabs({ tabs }: { tabs: AdminTab[] }) {
  const [active, setActive] = useState(tabs[0].key);

  useEffect(() => {
    const fromHash = () => {
      const k = window.location.hash.slice(1);
      if (tabs.some((t) => t.key === k)) setActive(k);
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, [tabs]);

  function pick(key: string) {
    setActive(key);
    history.replaceState(null, "", `#${key}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div>
      <nav className="sticky top-0 z-30 -mx-5 border-b border-border bg-background/90 px-5 backdrop-blur-md">
        <div className="flex gap-1 overflow-x-auto py-2 [scrollbar-width:none]">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => pick(t.key)}
              className={`relative flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm transition ${
                active === t.key ? "bg-gold font-bold text-black" : "text-muted hover:bg-surface hover:text-foreground"
              }`}
            >
              <span>{t.icon}</span>
              {t.label}
              {!!t.badge && (
                <span className={`rounded-full px-1.5 text-[10px] font-black ${active === t.key ? "bg-black/20" : "bg-surface-2 text-foreground"}`}>
                  {t.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </nav>

      {tabs.map((t) => (
        <section key={t.key} hidden={active !== t.key} className="pt-8">
          {t.content}
        </section>
      ))}
    </div>
  );
}
