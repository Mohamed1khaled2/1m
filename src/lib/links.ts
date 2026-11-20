export type Platform = "youtube" | "instagram" | "tiktok" | "link";

/** المنصة من اللينك نفسه، عشان الأيقونة واللون. */
export function platformOf(url: string): Platform {
  let host = "";
  try {
    host = new URL(url).hostname.replace(/^www\.|^m\./, "");
  } catch {
    return "link";
  }
  if (host === "youtu.be" || host.endsWith("youtube.com")) return "youtube";
  if (host.endsWith("instagram.com")) return "instagram";
  if (host.endsWith("tiktok.com")) return "tiktok";
  return "link";
}

export const PLATFORM_LABEL: Record<Platform, string> = {
  youtube: "يوتيوب",
  instagram: "إنستجرام",
  tiktok: "تيك توك",
  link: "لينك",
};
