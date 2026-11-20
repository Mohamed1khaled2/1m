import { existsSync } from "node:fs";
import { join } from "node:path";

/** صورة المشروع لو موجودة في public/projects/{slug}.jpg (سكرين شوت من الموقع نفسه). */
export function coverOf(slug: string): string | null {
  return existsSync(join(process.cwd(), "public/projects", `${slug}.jpg`)) ? `/projects/${slug}.jpg` : null;
}
