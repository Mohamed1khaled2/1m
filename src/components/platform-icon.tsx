import { InstagramIcon } from "@/components/instagram-icon";
import { TikTokIcon } from "@/components/tiktok-icon";
import { YouTubeIcon } from "@/components/youtube-icon";
import type { Platform } from "@/lib/links";

export function PlatformIcon({ platform, className = "size-4" }: { platform: Platform; className?: string }) {
  if (platform === "youtube") return <YouTubeIcon className={`${className} text-[#ff0033]`} />;
  if (platform === "instagram") return <InstagramIcon className={`${className} text-[#e1306c]`} />;
  if (platform === "tiktok") return <TikTokIcon className={className} />;
  return <span className="text-sm leading-none">🔗</span>;
}
