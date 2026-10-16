-- Run this in Supabase SQL Editor.
-- Each authenticated user can access only their own row.
create table if not exists public.student_states (
  user_id uuid primary key references auth.users(id) on delete cascade,
  state jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.student_states enable row level security;
revoke all on table public.student_states from anon;
grant select, insert, update, delete on table public.student_states to authenticated;
drop policy if exists "Students can read own state" on public.student_states;
create policy "Students can read own state" on public.student_states for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists "Students can insert own state" on public.student_states;
create policy "Students can insert own state" on public.student_states for insert to authenticated with check ((select auth.uid()) = user_id);
drop policy if exists "Students can update own state" on public.student_states;
create policy "Students can update own state" on public.student_states for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop policy if exists "Students can delete own state" on public.student_states;
create policy "Students can delete own state" on public.student_states for delete to authenticated using ((select auth.uid()) = user_id);
