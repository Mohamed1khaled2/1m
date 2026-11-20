import { createClient } from "@supabase/supabase-js";

/**
 * عميل service role — بيتخطى RLS. للسيرفر بس، عمره ما يتبعت للمتصفح.
 * الموقع مالوش حسابات زوار، فده العميل الوحيد: بيقرا عشان يعرض، وبيكتب من صفحة الأدمن.
 */
export function createAdminClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false },
  });
}
