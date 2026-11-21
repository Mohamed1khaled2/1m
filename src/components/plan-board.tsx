import { Reveal } from "@/components/reveal";

export function PlanBoard({ answer }: { answer: string }) {
  if (!answer.trim()) return null;

  return (
    <div dir="rtl">
      <Reveal className="border-s-2 border-gold ps-5 sm:ps-7">
        <p className="mb-3 text-xs font-bold tracking-wide text-gold">الفكرة ببساطة</p>
        <p className="max-w-xl text-xl leading-[1.9] font-semibold text-foreground sm:text-2xl">{answer}</p>
      </Reveal>
    </div>
  );
}
