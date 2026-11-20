"use client";

import { useTransition } from "react";
import { deleteCheer } from "@/app/admin/actions";
import { ConfirmButton } from "@/components/admin/confirm-button";

export type Cheer = { id: number; name: string; created_at: string };

const dateFmt = new Intl.DateTimeFormat("ar-EG-u-nu-latn", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });

/** اللي قالوا عاش. لو حد كتب اسم مش لطيف امسحه، وهيختفي من الموقع على طول. */
export function CheersList({ cheers }: { cheers: Cheer[] }) {
  const [pending, start] = useTransition();

  if (cheers.length === 0) return <p className="text-muted">لسه محدش قال عاش.</p>;

  return (
    <ul className={`flex flex-wrap gap-2 ${pending ? "opacity-70" : ""}`}>
      {cheers.map((c) => (
        <li key={c.id} className="group flex items-center gap-2 rounded-full border border-border bg-surface py-1 pr-3 pl-1 text-sm">
          <span>❤️ {c.name || "مشجّع"}</span>
          <span className="text-xs text-muted">{dateFmt.format(new Date(c.created_at))}</span>
          <ConfirmButton label="✕" confirmLabel="امسح" onConfirm={() => start(() => deleteCheer(c.id))} className="px-2" />
        </li>
      ))}
    </ul>
  );
}
