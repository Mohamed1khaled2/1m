"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { addEntry, updateEntry, type ActionState } from "@/app/admin/actions";
import { celebrate } from "@/lib/fx";
import { PlatformIcon } from "@/components/platform-icon";
import { KINDS, type Entry, type EntryKind, type Project } from "@/lib/journey";
import { platformOf, type Platform } from "@/lib/links";

const LINK_FIELDS: { name: string; platform: Platform; placeholder: string }[] = [
  { name: "link_youtube", platform: "youtube", placeholder: "https://youtu.be/..." },
  { name: "link_instagram", platform: "instagram", placeholder: "https://www.instagram.com/p/..." },
  { name: "link_tiktok", platform: "tiktok", placeholder: "https://www.tiktok.com/@.../video/..." },
  { name: "link_other", platform: "link", placeholder: "أي لينك تاني (موقع، بوست، صورة...)" },
];

const today = () => new Date().toISOString().slice(0, 10);

/** روابط يومية قديمة ← خانة لكل منصة، واللي يزيد بيتبعت مستخبي عشان مايضيعش. */
function splitLinks(links: string[]) {
  const fields: Record<string, string> = {};
  const extra: string[] = [];
  for (const url of links) {
    const name = LINK_FIELDS.find((f) => f.platform === platformOf(url))!.name;
    if (fields[name]) extra.push(url);
    else fields[name] = url;
  }
  return { fields, extra };
}

/** إضافة حاجة جديدة لليوميات، أو تعديل واحدة اتنشرت (entry). بتظهر في الموقع على طول. */
export function EntryForm({
  projects,
  defaultProjectId,
  entry,
  onDone,
}: {
  projects: Pick<Project, "id" | "name">[];
  defaultProjectId?: number;
  entry?: Entry;
  /** بعد ما التعديل يتحفظ */
  onDone?: () => void;
}) {
  const [state, action, pending] = useActionState<ActionState, FormData>(entry ? updateEntry : addEntry, {});
  const [kind, setKind] = useState<EntryKind>(entry?.kind ?? "step");
  const links = splitLinks(entry?.links ?? []);
  const onDoneRef = useRef(onDone);
  useEffect(() => {
    onDoneRef.current = onDone;
  }, [onDone]);
  const form = useRef<HTMLFormElement>(null);
  const lastKind = useRef(kind);

  useEffect(() => {
    lastKind.current = kind;
  }, [kind]);

  useEffect(() => {
    if (!state.ok) return;
    if (entry) return onDoneRef.current?.();
    form.current?.reset();
    celebrate(lastKind.current === "money");
  }, [state, entry]);

  return (
    <form ref={form} action={action} className="space-y-4">
      {entry && <input type="hidden" name="id" value={entry.id} />}
      {links.extra.map((url) => (
        <input key={url} type="hidden" name="link_extra" value={url} />
      ))}
      <div className="grid grid-cols-4 gap-2">
        {(Object.keys(KINDS) as EntryKind[]).map((k) => (
          <label
            key={k}
            className={`flex cursor-pointer flex-col items-center gap-1 rounded-xl border py-3 text-sm transition ${
              kind === k ? "border-gold bg-gold/10 font-bold" : "border-border text-muted hover:border-gold/40"
            }`}
          >
            <input type="radio" name="kind" value={k} checked={kind === k} onChange={() => setKind(k)} className="sr-only" />
            <span className="text-2xl">{KINDS[k].icon}</span>
            {KINDS[k].label}
          </label>
        ))}
      </div>

      <input name="title" required maxLength={140} defaultValue={entry?.title} placeholder="حصل إيه؟ (عنوان قصير)" className="input text-lg font-bold" />
      <textarea name="body" rows={4} maxLength={4000} defaultValue={entry?.body} placeholder="التفاصيل..." className="input resize-y leading-relaxed" />

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <span className="text-sm text-muted">الرصيد اتغير بكام؟ (جنيه)</span>
          <div className="mt-1 flex gap-2">
            <div className="flex shrink-0 overflow-hidden rounded-xl border border-border text-sm font-bold">
              <label className="cursor-pointer px-3 py-3 has-[:checked]:bg-green/15 has-[:checked]:text-green">
                <input type="radio" name="direction" value="in" defaultChecked={(entry?.amount ?? 0) >= 0} className="sr-only" />+ دخل
              </label>
              <label className="cursor-pointer border-r border-border px-3 py-3 has-[:checked]:bg-red-400/15 has-[:checked]:text-red-400">
                <input type="radio" name="direction" value="out" defaultChecked={(entry?.amount ?? 0) < 0} className="sr-only" />− خسرت
              </label>
            </div>
            <input
              name="amount"
              inputMode="numeric"
              dir="ltr"
              placeholder="0"
              defaultValue={entry?.amount ? Math.abs(entry.amount) : undefined}
              className="input min-w-0 text-left font-black"
            />
          </div>
        </div>
        <label className="block">
          <span className="text-sm text-muted">التاريخ</span>
          <input name="happened_on" type="date" defaultValue={entry?.happened_on ?? today()} required className="input mt-1" />
        </label>
      </div>

      {projects.length > 0 && (
        <label className="block">
          <span className="text-sm text-muted">تبع أنهي مشروع؟ (اختياري)</span>
          <select name="project_id" defaultValue={entry ? (entry.project_id ?? "") : (defaultProjectId ?? "")} className="input mt-1">
            <option value="">مش تبع مشروع</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
      )}

      <div>
        <span className="text-sm text-muted">روابط توثيق (اختياري): اللي يثبت إن ده حصل</span>
        <div className="mt-1 space-y-2">
          {LINK_FIELDS.map((f) => (
            <div key={f.name} className="flex items-center gap-2">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-border bg-surface-2">
                <PlatformIcon platform={f.platform} className="size-5" />
              </span>
              <input name={f.name} type="url" dir="ltr" defaultValue={links.fields[f.name]} placeholder={f.placeholder} className="input min-w-0 text-left" />
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button className="btn px-8" disabled={pending}>
          {entry ? (pending ? "بيتحفظ..." : "احفظ التعديل") : pending ? "بيتنشر..." : "انشر"}
        </button>
        {entry && onDone && (
          <button type="button" onClick={onDone} className="btn-ghost">
            إلغاء
          </button>
        )}
        {state.ok && !entry && <span className="text-sm text-green">اتنشر ✓</span>}
        {state.error && <span className="text-sm text-red-400">{state.error}</span>}
      </div>
    </form>
  );
}
