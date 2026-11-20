"use client";

import { useTransition } from "react";
import { deleteEntry } from "@/app/admin/actions";
import { ConfirmButton } from "@/components/admin/confirm-button";

/** المسح نهائي، فبيسأل الأول جوه الزرار. */
export function DeleteButton({ id }: { id: number; title?: string }) {
  const [pending, start] = useTransition();
  if (pending) return <span className="shrink-0 text-sm text-muted">بيتمسح...</span>;
  return <ConfirmButton onConfirm={() => start(() => deleteEntry(id))} />;
}
