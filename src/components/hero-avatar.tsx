import { existsSync } from "node:fs";
import { join } from "node:path";
import Image from "next/image";
import { CheerHeart } from "@/components/cheer-heart";
import { InstagramIcon } from "@/components/instagram-icon";
import { TikTokIcon } from "@/components/tiktok-icon";
import { YouTubeIcon } from "@/components/youtube-icon";
import { CREATOR } from "@/lib/creator";

type Pill = { href: string; label: string; icon: React.ReactNode; external: boolean; tone: string };

/** دايرة بنفس مقاس الصورة، فيها أيقونة المنصة ولونها. */
function SocialPill({ pill, side, index }: { pill: Pill; side: "r" | "l"; index: number }) {
  return (
    <a
      href={pill.href}
      {...(pill.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      aria-label={pill.label}
      title={pill.label}
      className={`${side === "r" ? "pill-in-r" : "pill-in-l"} pill-shine group relative flex size-[var(--d)] shrink-0 items-center justify-center overflow-hidden rounded-full border-2 transition duration-300 hover:-translate-y-1 active:scale-95 ${pill.tone}`}
      style={{ animationDelay: `${200 + index * 120}ms`, ["--shine-delay" as string]: `${index * 0.9}s` }}
    >
      <span className="scale-110 transition duration-300 group-hover:scale-150 sm:scale-150 sm:group-hover:scale-[1.8]">{pill.icon}</span>
    </a>
  );
}

/**
 * صورتك في النص، واتنين يمين واتنين شمال: الخمسة دواير بمقاس واحد.
 * على الموبايل المقاس بيصغر للكل مع بعض عشان يدخلوا في سطر واحد.
 */
export function HeroAvatar({ cheers }: { cheers: number }) {
  const hasPhoto = existsSync(join(process.cwd(), "public/creator.jpg"));
  const tiktok = process.env.NEXT_PUBLIC_TIKTOK_URL;

  const right: Pill[] = [
    tiktok && {
      href: tiktok,
      label: "تيك توك",
      icon: <TikTokIcon className="size-6 drop-shadow-[2px_2px_0_#fe2c55]" />,
      external: true,
      tone: "border-[#25f4ee]/40 bg-black text-white hover:border-[#25f4ee] hover:shadow-[0_0_24px_-4px_#25f4ee]",
    },
    CREATOR.instagram && {
      href: CREATOR.instagram,
      label: "إنستجرام",
      icon: <InstagramIcon className="size-6" />,
      external: true,
      tone: "border-transparent bg-gradient-to-b from-[#feda75] via-[#d62976] to-[#4f5bd5] text-white hover:shadow-[0_0_24px_-4px_#d62976]",
    },
  ].filter(Boolean) as Pill[];

  const left: Pill[] = [
    CREATOR.youtube && {
      href: CREATOR.youtube,
      label: "يوتيوب",
      icon: <YouTubeIcon className="size-6" />,
      external: true,
      tone: "border-transparent bg-[#ff0033] text-white hover:shadow-[0_0_24px_-4px_#ff0033]",
    },
  ].filter(Boolean) as Pill[];

  return (
    <div className="flex items-center justify-center gap-2 [--d:min(112px,calc((100vw-2.5rem-2rem)/5))] sm:gap-3">
      {right.map((p, i) => (
        <SocialPill key={p.label} pill={p} side="r" index={i} />
      ))}

      <div className="relative shrink-0">
        <div className="absolute inset-0 rounded-full bg-gold/25 blur-2xl" aria-hidden />
        {hasPhoto ? (
          <Image
            src="/creator.jpg"
            alt={CREATOR.name}
            width={112}
            height={112}
            priority
            className="relative size-[var(--d)] rounded-full border-4 border-gold object-cover"
          />
        ) : (
          <div className="relative flex size-[var(--d)] items-center justify-center rounded-full border-4 border-gold bg-surface text-3xl font-black text-gold">
            {CREATOR.name.trim()[0]}
          </div>
        )}
      </div>

      {left.map((p, i) => (
        <SocialPill key={p.label} pill={p} side="l" index={i + right.length} />
      ))}
      {/* القلب = "عاش" نفسه */}
      <div className="pill-in-l" style={{ animationDelay: `${200 + (right.length + left.length) * 120}ms` }}>
        <CheerHeart count={cheers} />
      </div>
    </div>
  );
}
