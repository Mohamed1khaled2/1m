import { JourneyView } from "@/components/journey-view";
import { loadEpisodeLinks } from "@/lib/episodes";
import { loadJourney } from "@/lib/journey";
import { QUARTERS, focusQuarter } from "@/lib/year";

// كل زيارة بتقرا آخر حاجة اتكتبت، فأي حاجة تنشرها من الأدمن بتبان على طول
export const dynamic = "force-dynamic";

export default async function Home() {
  const [journey, episodeLinks] = await Promise.all([loadJourney(), loadEpisodeLinks(QUARTERS[focusQuarter() - 1].project)]);
  return <JourneyView journey={journey} episodeLinks={episodeLinks} />;
}
