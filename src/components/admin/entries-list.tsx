"use client";

import { useState } from "react";
import { DeleteButton } from "@/components/admin/delete-button";
import { EntryForm } from "@/components/admin/entry-form";
import { KINDS, type Entry, type Project } from "@/lib/journey";
import { formatEGP } from "@/lib/year";

/** اللي اتنشر: تعدّل أي يومية في مكانها (نفس فورم النشر) أو تمسحها. */
export function EntriesList({ entries, projects }: { entries: Entry[]; projects: Pick<Project, "id" | "name">[] }) {
  const [editing, setEditing] = useState<number | null>(null);

  if (entries.length === 0) return <p className="text-muted">لسه ما نشرتش حاجة.</p>;

  return (
    <ul className="divide-y divide-border rounded-2xl border border-border bg-surface px-4">
      {entries.map((e) =>
        editing === e.id ? (
          <li key={e.id} className="py-4">
            <p className="mb-3 text-sm font-bold text-gold">بتعدّل: {e.title}</p>
            <EntryForm projects={projects} entry={e} onDone={() => setEditing(null)} />
          </li>
        ) : (
          <li key={e.id} className="flex items-center justify-between gap-3 py-3">
            <div className="min-w-0">
              <p className="text-xs text-muted">
                {KINDS[e.kind].icon} {e.happened_on}
                {e.amount !== 0 && (
                  <span className={`mr-2 font-bold ${e.amount > 0 ? "text-green" : "text-red-400"}`} dir="ltr">
                    {e.amount > 0 ? "+" : "−"}
                    {formatEGP(Math.abs(e.amount))}
                  </span>
                )}
              </p>
              <p className="truncate font-bold">{e.title}</p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <button onClick={() => setEditing(e.id)} className="text-sm text-muted transition hover:text-gold">
                ✏️ عدّل
              </button>
              <DeleteButton id={e.id} />
            </div>
          </li>
        ),
      )}
    </ul>
  );
}
