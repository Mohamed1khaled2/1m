import { JourneyView } from "@/components/journey-view";
import { loadJourney } from "@/lib/journey";

// كل زيارة بتقرا آخر حاجة اتكتبت، فأي حاجة تنشرها من الأدمن بتبان على طول
export const dynamic = "force-dynamic";

export default async function Home() {
  return <JourneyView journey={await loadJourney()} />;
}
