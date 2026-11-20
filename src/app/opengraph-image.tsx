import { CREATOR } from "@/lib/creator";
import { loadJourney } from "@/lib/journey";
import { ogSize, renderOg } from "@/lib/og";

export const alt = `${CREATOR.name}، ${CREATOR.age} سنة: من ${CREATOR.start} لمليون جنيه`;
export const size = ogSize;
export const contentType = "image/png";
export const dynamic = "force-dynamic";

/** لما حد يشارك لينك الموقع: اسمك ورقمك الحالي والسلم. */
export default async function Image() {
  const { balance } = await loadJourney();
  return renderOg({ name: CREATOR.name, total: balance });
}
