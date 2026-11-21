import { TikTokIcon } from "@/components/tiktok-icon";
import { YouTubeIcon } from "@/components/youtube-icon";
import { CREATOR } from "@/lib/creator";

/** زراير المتابعة: تيك توك (الأساسي) ويوتيوب. */
export function FollowLinks({ primaryOnly = false }: { primaryOnly?: boolean }) {
  const tiktok = process.env.NEXT_PUBLIC_TIKTOK_URL;
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      {tiktok ? (
        <a href={tiktok} target="_blank" rel="noopener noreferrer" className="btn px-7 py-4 text-lg">
          <TikTokIcon />
          {CREATOR.followLabel}
        </a>
      ) : process.env.NODE_ENV !== "production" ? (
        <p className="rounded-xl border border-dashed border-border px-4 py-3 text-sm text-muted">
          زرار تيك توك هيظهر لما تحط NEXT_PUBLIC_TIKTOK_URL في .env.local
        </p>
      ) : null}
      {/* في المقدمة يوتيوب موجود أصلاً كدايرة جنب الصورة */}
      {!primaryOnly && CREATOR.youtube && (
        <a href={CREATOR.youtube} target="_blank" rel="noopener noreferrer" className="btn-ghost px-5 py-4 text-base">
          <YouTubeIcon className="size-5 text-[#ff0033]" />
          {CREATOR.youtubeLabel}
        </a>
      )}
    </div>
  );
}
