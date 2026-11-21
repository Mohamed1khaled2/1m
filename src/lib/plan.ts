import type { Step } from "@/lib/journey";

/** Older plans have no kind. Recognize explicit recurring wording until edited. */
export function planItemKind(step: Step): "milestone" | "ongoing" {
  if (step.kind) return step.kind;
  const text = step.text.normalize("NFKC").replace(/[\u064B-\u065F\u0670\u0640]/g, "");
  return /كل\s+(?:أسبوع|اسبوع|يوم|شهر|سنة)|(?:أسبوعي|اسبوعي|يومي|شهري|سنوي)/.test(text)
    ? "ongoing"
    : "milestone";
}
