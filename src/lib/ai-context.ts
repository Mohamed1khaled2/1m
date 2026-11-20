import { CREATOR } from "@/lib/creator";
import { KINDS, STAGES, type Journey } from "@/lib/journey";
import { PROJECT_DETAILS } from "@/lib/project-details";
import { GOAL, formatEGP } from "@/lib/year";

/**
 * كل اللي المساعد محتاج يعرفه عنك، من بيانات الموقع نفسها: القصة، الرقم، الخطة، المشاريع، اليوميات.
 * بيتبعت مع كل طلب، فالمساعد عمره ما يحتاج تشرحله إنت مين.
 */
export function buildContext(journey: Journey, styleSamples: string): string {
  const projectName = new Map(journey.projects.map((p) => [p.id, p.name]));

  const projects = journey.projects
    .map((p) => {
      const stage = STAGES.find((s) => s.key === p.stage)!;
      const what = PROJECT_DETAILS[p.slug]?.what ?? p.tagline;
      const kind = p.kind === "work" ? `مكان شغله (${CREATOR.role})` : `مشروعه، مرحلته: ${stage.label}`;
      return `- ${p.name} (${kind})${p.earned ? `، جاب ${formatEGP(p.earned)} جنيه` : ""}: ${what}`;
    })
    .join("\n");

  const entries = journey.entries
    .slice(0, 30)
    .map((e) => {
      const money = e.amount ? ` [${e.amount > 0 ? "+" : "−"}${formatEGP(Math.abs(e.amount))} جنيه]` : "";
      const project = e.project_id ? ` (مشروع ${projectName.get(e.project_id)})` : "";
      return `- ${e.happened_on} · ${KINDS[e.kind].label}${project}: ${e.title}${money}${e.body ? `\n  ${e.body.replace(/\n+/g, " ")}` : ""}`;
    })
    .join("\n");

  const steps = journey.steps.map((s) => `- [${s.done ? "خلص" : "لسه"}] ${s.text}`).join("\n");

  return `# مين هو
${CREATOR.name}، ${CREATOR.age} سنة، ${CREATOR.role}. القصة: معاه ${formatEGP(CREATOR.start)} جنيه وهيحوّلهم مليون. بيوثّق كل حاجة على تيك توك ويوتيوب (فيديو كل أسبوع) وإنستجرام.
${CREATOR.tagline}

# وصل لفين
معاه دلوقتي ${formatEGP(journey.balance)} جنيه (×${journey.multiple.toFixed(1)} من البداية، والهدف ${formatEGP(GOAL)}).
مكاسب: ${journey.stats.wins} · وقعات: ${journey.stats.falls} · دروس: ${journey.stats.lessons}

# الخطة
${journey.answer || "(لسه مكتبهاش)"}
${steps}

# مشاريعه
${projects || "(مفيش)"}

# آخر اللي حصل (الأحدث الأول)
${entries || "(لسه مانشرش حاجة)"}

# أمثلة من أسلوبه في الكلام
${styleSamples.trim() || "(مفيش أمثلة لسه: اكتب بالمصري العامي، جمل قصيرة، صريح ومن غير مبالغة)"}`;
}

export const SYSTEM_INSTRUCTION = `إنت مساعد بيكتب فيديوهات ${CREATOR.name} اللي بيوثّق قصته من ${formatEGP(CREATOR.start)} جنيه لمليون.

القواعد:
- اكتب بالمصري العامي، بأسلوبه هو (بص على الأمثلة). جمل قصيرة، صريحة، من غير مبالغة ولا كلام تحفيزي فاضي.
- إنت بتكتب بلسانه هو (أنا).
- استخدم بس الأرقام والأحداث اللي في البيانات. ممنوع تألف رقم أو حدث أو عميل. لو حاجة ناقصة قول "[محتاج تكمّل: ...]".
- الوقعات والخسارة جزء مهم من القصة، متخبيهاش.
- الإيموجي قليل.
- رتّب الرد بعناوين واضحة عشان يتنسخ ويتصوّر على طول.`;
