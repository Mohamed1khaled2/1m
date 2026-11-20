import Link from "next/link";
import { Reveal } from "@/components/reveal";
import { PlatformIcon } from "@/components/platform-icon";
import { KINDS, type Entry } from "@/lib/journey";
import { PLATFORM_LABEL, platformOf } from "@/lib/links";
import { formatEGP } from "@/lib/year";

const dateFmt = new Intl.DateTimeFormat("ar-EG-u-nu-latn", { day: "numeric", month: "long" });

/** +45,000 / −10,000 بلون الاتجاه. */
export function Delta({ amount, className = "" }: { amount: number; className?: string }) {
  if (amount === 0) return null;
  return (
    <span dir="ltr" className={`font-black ${amount > 0 ? "text-green" : "text-red-400"} ${className}`}>
      {amount > 0 ? "+" : "−"}
      {formatEGP(Math.abs(amount))}
    </span>
  );
}

/** يومية واحدة على خط القصة. `project` بيظهر كلينك لقصة المشروع (مش بيظهر جوه صفحة المشروع نفسه). */
export function EntryItem({
  entry: e,
  index,
  project,
}: {
  entry: Entry;
  index: number;
  project?: { slug: string; name: string };
}) {
  // روابط التوثيق، ومعاها لينك الفيديو القديم لو اليومية اتكتبت قبل الروابط
  const proofs = [...(e.links ?? []), ...(e.video_url && !(e.links ?? []).includes(e.video_url) ? [e.video_url] : [])];

  return (
    <li className="relative pb-10">
      <span
        className={`absolute top-1 -right-[35px] flex size-8 items-center justify-center rounded-full border-2 text-base ${
          e.amount > 0
            ? "border-green bg-green/15"
            : e.amount < 0 || e.kind === "fail"
              ? "border-red-400/60 bg-red-400/10"
              : "border-border bg-surface"
        }`}
        aria-hidden
      >
        {KINDS[e.kind].icon}
      </span>
      <Reveal delay={Math.min(index, 4) * 80}>
        <p className="text-xs text-muted">
          {dateFmt.format(new Date(e.happened_on))} · {KINDS[e.kind].label}
          {project && (
            <>
              {" · "}
              <Link href={`/p/${project.slug}`} className="font-bold text-gold hover:underline">
                {project.name}
              </Link>
            </>
          )}
        </p>
        <h4 className="mt-1 text-xl font-black">{e.title}</h4>
        <Delta amount={e.amount} className="mt-1 block text-lg" />
        {e.body && <p className="mt-2 leading-relaxed whitespace-pre-line text-muted">{e.body}</p>}
        {proofs.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {proofs.map((url) => {
              const platform = platformOf(url);
              return (
                <a
                  key={url}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-sm font-bold transition hover:-translate-y-0.5 hover:border-gold/50"
                >
                  <PlatformIcon platform={platform} />
                  {PLATFORM_LABEL[platform]}
                </a>
              );
            })}
          </div>
        )}
      </Reveal>
    </li>
  );
}
