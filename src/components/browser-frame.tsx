import Image from "next/image";

/** صورة موقع جوه إطار متصفح (النقط التلاتة واللينك)، عشان تبان إنها منتج حقيقي شغال. */
export function BrowserFrame({
  src,
  url,
  alt,
  priority = false,
  className = "",
}: {
  src: string;
  url?: string | null;
  alt: string;
  priority?: boolean;
  className?: string;
}) {
  return (
    <div className={`overflow-hidden rounded-xl border border-white/10 bg-[#1b1f1d] shadow-2xl shadow-black/60 ${className}`}>
      <div className="flex items-center gap-1.5 px-3 py-2" dir="ltr">
        <span className="size-2.5 rounded-full bg-[#ff5f57]" />
        <span className="size-2.5 rounded-full bg-[#febc2e]" />
        <span className="size-2.5 rounded-full bg-[#28c840]" />
        {url && (
          <span className="ml-2 min-w-0 flex-1 truncate rounded-md bg-black/30 px-2 py-0.5 text-[11px] text-muted">
            {url.replace(/^https?:\/\//, "").replace(/\/$/, "")}
          </span>
        )}
      </div>
      <div className="relative aspect-[16/10] overflow-hidden bg-white">
        <Image src={src} alt={alt} fill priority={priority} sizes="(max-width: 640px) 90vw, 640px" className="object-cover object-top" />
      </div>
    </div>
  );
}
