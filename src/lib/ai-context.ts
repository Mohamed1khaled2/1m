import { CREATOR } from "@/lib/creator";
import { KINDS, STAGES, type Journey } from "@/lib/journey";
import { PROJECT_DETAILS } from "@/lib/project-details";
import { GOAL, QUARTERS, YEAR, focusQuarter, formatEGP } from "@/lib/year";

/**
 * كل اللي المساعد محتاج يعرفه عنك، من بيانات الموقع نفسها: القصة، الرقم، الخطة، المشاريع، اليوميات.
 * بيتبعت مع كل طلب، فالمساعد عمره ما يحتاج تشرحله إنت مين.
 */
export function buildContext(journey: Journey, styleSamples: string): string {
  const projectName = new Map(journey.projects.map((p) => [p.id, p.name]));
  const focusQ = QUARTERS[focusQuarter() - 1];
  const focus = journey.projects.find((p) => p.slug === focusQ.project);

  const projects = journey.projects
    .map((p) => {
      const stage = STAGES.find((s) => s.key === p.stage)!;
      const what = PROJECT_DETAILS[p.slug]?.what ?? p.tagline;
      const quarter = QUARTERS.find((x) => x.project === p.slug);
      const kind = p.kind === "work" ? `مكان شغله (${CREATOR.role})` : `مشروعه، مرحلته: ${stage.label}`;
      const when = quarter ? `، ربعه: Q${quarter.q} (${quarter.months})` : "";
      return `- ${p.name} (${kind}${when})${p.earned ? `، جاب ${formatEGP(p.earned)} جنيه` : ""}: ${what}`;
    })
    .join("\n");

  const order = QUARTERS.map((x) => `- Q${x.q} (${x.months} ${YEAR}): ${journey.projects.find((p) => p.slug === x.project)?.name ?? x.project}`).join("\n");

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

# التركيز: كل ربع مشروع واحد بس
${order}
الربع ده: Q${focusQ.q}، والمشروع: ${focus?.name ?? focusQ.project}. الباقيين مستنيين ربعهم.

${focus ? focusDetails(focus) : ""}

# مشاريعه
${projects || "(مفيش)"}

# آخر اللي حصل (الأحدث الأول)
${entries || "(لسه مانشرش حاجة)"}

# أمثلة من أسلوبه في الكلام
${styleSamples.trim() || "(مفيش أمثلة لسه: اكتب بالمصري العامي، جمل قصيرة، صريح ومن غير مبالغة)"}`;
}

/** كل اللي نعرفه عن مشروع الربع، عشان الخطة والفيديوهات تتبني على المنتج الحقيقي. */
function focusDetails(p: Journey["projects"][number]): string {
  const d = PROJECT_DETAILS[p.slug];
  const stage = STAGES.find((s) => s.key === p.stage)!;
  const lines = [`# مشروع الربع ده بالتفصيل: ${p.name}`, `المرحلة: ${stage.label}${p.url ? ` · اللينك: ${p.url}` : ""}`, d?.what ?? p.tagline];
  if (d?.problem) lines.push(`المشكلة: ${d.problem}`);
  if (d?.features.length) lines.push(`المميزات:\n${d.features.map((f) => `- ${f.title}: ${f.text}`).join("\n")}`);
  if (d?.audience?.length) lines.push(`لمين: ${d.audience.join("، ")}`);
  if (d?.stack.length) lines.push(`معمول بـ: ${d.stack.join("، ")}`);
  if (d?.pricing) lines.push(`السعر: ${d.pricing}`);
  return lines.join("\n");
}

export const SYSTEM_INSTRUCTION = `إنت مساعد بيكتب فيديوهات ${CREATOR.name} اللي بيوثّق قصته من ${formatEGP(CREATOR.start)} جنيه لمليون.

القواعد:
- اكتب بالمصري العامي، بأسلوبه هو (بص على الأمثلة). جمل قصيرة، صريحة، من غير مبالغة ولا كلام تحفيزي فاضي.
- إنت بتكتب بلسانه هو (أنا).
- استخدم بس الأرقام والأحداث اللي في البيانات. ممنوع تألف رقم أو حدث أو عميل. لو حاجة ناقصة قول "[محتاج تكمّل: ...]".
- كل ربع مشروع واحد بس (مكتوب في "التركيز"). أي فيديو أو فكرة أو خطة تبقى عن مشروع الربع ده، إلا لو هو طلب غير كده. المشاريع التانية اذكرها بس إنها جاية في ربعها، ومتقترحش شغل عليها دلوقتي.
- الوقعات والخسارة جزء مهم من القصة، متخبيهاش.
- الإيموجي قليل.
- رتّب الرد بعناوين واضحة عشان يتنسخ ويتصوّر على طول.`;
