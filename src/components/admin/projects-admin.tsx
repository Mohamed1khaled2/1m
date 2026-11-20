"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { addProject, deleteProject, updateProject, type ActionState } from "@/app/admin/actions";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { celebrate } from "@/lib/fx";
import { STAGES, type Project } from "@/lib/journey";

/** المشاريع في الأدمن: تغيّر مرحلة أي مشروع على طول، وتضيف مشروع جديد. */
export function ProjectsAdmin({ projects }: { projects: Project[] }) {
  return (
    <div className="space-y-3">
      {projects.map((p) => (
        <ProjectRow key={p.id} project={p} />
      ))}
      <AddProject />
    </div>
  );
}

function ProjectRow({ project: p }: { project: Project }) {
  const [pending, start] = useTransition();
  const [tagline, setTagline] = useState(p.tagline);
  const [error, setError] = useState<string | null>(null);

  function update(patch: { stage?: string; tagline?: string }) {
    start(async () => {
      const res = await updateProject(p.id, patch);
      setError(res?.error ?? null);
      if (!res?.error && patch.stage && STAGES.findIndex((s) => s.key === patch.stage) > STAGES.findIndex((s) => s.key === p.stage)) {
        celebrate(patch.stage === "earning" || patch.stage === "sold");
      }
    });
  }

  return (
    <div className={`rounded-2xl border border-border bg-surface p-4 ${pending ? "opacity-60" : ""}`}>
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="font-black">
            {p.name}
            {p.kind === "work" && <span className="mr-2 rounded-full bg-surface-2 px-2 py-0.5 text-xs font-normal text-muted">بشتغل فيها</span>}
          </p>
          <p className="text-xs text-muted" dir="ltr">
            /p/{p.slug}
          </p>
        </div>
        <ConfirmButton confirmLabel="متأكد؟ امسح المشروع" onConfirm={() => start(() => deleteProject(p.id))} />
      </div>

      {/* المرحلة: دوسة واحدة */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {STAGES.map((s) => (
          <button
            key={s.key}
            onClick={() => s.key !== p.stage && update({ stage: s.key })}
            className={`rounded-full border px-3 py-1 text-xs transition ${
              s.key === p.stage ? "border-gold bg-gold/15 font-bold text-gold" : "border-border text-muted hover:border-gold/40"
            }`}
          >
            {s.icon} {s.label}
          </button>
        ))}
      </div>

      <input
        value={tagline}
        onChange={(e) => setTagline(e.target.value)}
        onBlur={() => tagline !== p.tagline && update({ tagline })}
        maxLength={200}
        placeholder="المشروع بيعمل إيه؟ (سطر واحد)"
        className="input mt-3 py-2 text-sm"
      />
      {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
    </div>
  );
}

function AddProject() {
  const [state, action, pending] = useActionState<ActionState, FormData>(addProject, {});
  const [open, setOpen] = useState(false);
  const form = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!state.ok) return;
    form.current?.reset();
    celebrate();
  }, [state]);

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="w-full rounded-2xl border border-dashed border-border py-4 text-muted hover:border-gold hover:text-gold">
        + فكرة / مشروع جديد
      </button>
    );
  }

  return (
    <form ref={form} action={action} className="space-y-3 rounded-2xl border border-gold/40 p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <input name="name" required maxLength={80} placeholder="اسم المشروع" className="input" />
        <input name="slug" required dir="ltr" maxLength={40} placeholder="slug (مثلاً my-app)" className="input text-left" />
      </div>
      <input name="tagline" maxLength={200} placeholder="بيعمل إيه؟ (سطر واحد)" className="input" />
      <input name="url" type="url" dir="ltr" placeholder="https://..." className="input text-left" />
      <div className="grid gap-3 sm:grid-cols-2">
        <select name="stage" defaultValue="idea" className="input">
          {STAGES.map((s) => (
            <option key={s.key} value={s.key}>
              {s.icon} {s.label}
            </option>
          ))}
        </select>
        <select name="kind" defaultValue="mine" className="input">
          <option value="mine">مشروعي</option>
          <option value="work">مكان بشتغل فيه</option>
        </select>
      </div>
      <div className="flex items-center gap-3">
        <button className="btn px-6" disabled={pending}>
          {pending ? "ثانية..." : "ضيف"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="text-sm text-muted">
          إلغاء
        </button>
        {state.ok && <span className="text-sm text-green">اتضاف ✓</span>}
        {state.error && <span className="text-sm text-red-400">{state.error}</span>}
      </div>
    </form>
  );
}
