-- رحلة المليون — نفّذ الملف ده في Supabase → SQL Editor
--
-- الموقع بتاع صاحبه بس: هو اللي بيكتب (من /admin)، والناس بتتفرج.
-- الجدولين عليهم RLS من غير أي policy، يعني محدش يقدر يقرا أو يكتب من المتصفح؛
-- السيرفر بس (بالـ service role) هو اللي بيقرا عشان يعرض الصفحة، وبيكتب لما الأدمن يحفظ.

-- الخطة: صف واحد بس
create table if not exists public.plan (
  id int primary key default 1 check (id = 1),
  answer text not null default '',
  steps jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);
insert into public.plan (id) values (1) on conflict (id) do nothing;

-- اليوميات: كل حاجة بتحصل في الرحلة
create table if not exists public.entries (
  id bigint generated always as identity primary key,
  happened_on date not null default current_date,
  kind text not null default 'step' check (kind in ('step', 'money', 'fail', 'lesson')),
  title text not null,
  body text not null default '',
  -- الرصيد اتغير بكام: موجب لو فلوس دخلت، سالب لو خسرت أو صرفت على حاجة
  amount numeric(14, 2) not null default 0,
  video_url text,
  created_at timestamptz not null default now()
);
create index if not exists entries_happened_on on public.entries (happened_on desc, id desc);

alter table public.plan enable row level security;
alter table public.entries enable row level security;

-- لو كنت شغّلت الملف قبل كده: المبلغ بقى ممكن يبقى سالب (خسارة)
alter table public.entries drop constraint if exists entries_amount_check;

-- لو كنت شغّلت النسخة القديمة (حسابات الزوار)، امسح جداولها:
-- drop table if exists public.vaults, public.email_log, public.checkins, public.plans, public.profiles cascade;
-- drop function if exists public.handle_new_user cascade;
-- drop function if exists public.handle_user_email_change cascade;

-- ─────────────────────────────────────────────────────────────
-- المشاريع: كل مشروع قصة نجاح لوحده (مش محل). اليوميات بتتربط بيه.
create table if not exists public.projects (
  id bigint generated always as identity primary key,
  slug text not null unique,
  name text not null,
  tagline text not null default '',
  url text,
  -- فكرة ← بيتبني ← جاهز ← اتطلق ← بيكسب ← اتباع
  stage text not null default 'idea' check (stage in ('idea', 'building', 'ready', 'launched', 'earning', 'sold')),
  -- mine: مشروعي. work: مكان بشتغل فيه
  kind text not null default 'mine' check (kind in ('mine', 'work')),
  sort int not null default 0,
  created_at timestamptz not null default now()
);
alter table public.projects enable row level security;

alter table public.entries add column if not exists project_id bigint references public.projects (id) on delete set null;
create index if not exists entries_project on public.entries (project_id);

-- مشاريعك اللي في D:\mada\devlopment (الوصف تقدر تغيّره من /admin)
insert into public.projects (slug, name, tagline, url, stage, kind, sort) values
  ('nileband', 'NileBand', 'أبلكيشن سوار رياضي من غير شاشة، متصمم ومتجمّع في مصر.', 'https://nilebandlandingpage.vercel.app/ar', 'building', 'mine', 1),
  ('ethbat', 'إثبات', 'منصة بتجمع تقييمات العملا للمتاجر الأونلاين.', 'https://ethbat.online', 'ready', 'mine', 2),
  ('chatec', 'Chatec', 'مساعد مبيعات بالذكاء الاصطناعي بيحوّل زوار المتجر لمبيعات.', 'https://chatec.online', 'ready', 'mine', 3),
  ('centerid', 'CenterID', 'نظام لمراكز الدروس: كل طالب ليه بروفايل وQR، والحضور والفلوس بيتسجلوا لوحدهم.', 'https://centerid.systems', 'ready', 'mine', 4),
  ('elct', 'ELCT', 'الجمعية المصرية للتدريب والكوتشينج.', 'https://elct.eg', 'launched', 'work', 5)
on conflict (slug) do nothing;

-- ─────────────────────────────────────────────────────────────
-- "عاش": الزوار بيقولوا عاش، والاسم اختياري (لو فاضي بيظهر "مشجّع").
-- مفيش إيميل ولا IP: بس بصمة متشفرة من الـ IP + تاريخ اليوم (بتتغير كل يوم) عشان الـ rate limit.
create table if not exists public.cheers (
  id bigint generated always as identity primary key,
  name text not null default '',
  ip_hash text not null default '',
  created_at timestamptz not null default now()
);
-- لو كنت عملت الجدول بالنسخة اللي فيها إيميل: شيل الإيميلات والأعمدة القديمة
alter table public.cheers drop column if exists email;
alter table public.cheers drop column if exists message;
alter table public.cheers drop column if exists replied;
alter table public.cheers add column if not exists ip_hash text not null default '';
drop index if exists cheers_email;
create index if not exists cheers_created on public.cheers (created_at desc);
create index if not exists cheers_ip on public.cheers (ip_hash, created_at desc);
alter table public.cheers enable row level security;

-- ─────────────────────────────────────────────────────────────
-- روابط توثيق لكل يومية (يوتيوب، إنستجرام، تيك توك، أو أي لينك). المنصة بتتعرف من اللينك.
alter table public.entries add column if not exists links jsonb not null default '[]'::jsonb;

-- بعد أي تغيير في الجداول: خلّي Supabase يحدّث قايمته
notify pgrst, 'reload schema';
