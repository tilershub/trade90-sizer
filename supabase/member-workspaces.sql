-- TRADE90 authenticated member workspace
-- Applied to the connected trade90 Supabase project.
--
-- This table is intentionally separate from the legacy Django/Wagtail tables.
-- Browser clients receive access only to this table, and RLS restricts every
-- row to auth.uid().

create table if not exists public.member_workspaces (
  user_id uuid primary key references auth.users(id) on delete cascade,
  schema_version smallint not null default 1,
  watchlist jsonb not null default '[]'::jsonb,
  research_history jsonb not null default '{}'::jsonb,
  journal jsonb not null default '[]'::jsonb,
  research_plan jsonb not null default '{}'::jsonb,
  daily_checklists jsonb not null default '{}'::jsonb,
  preferences jsonb not null default '{}'::jsonb,
  workspace_version bigint not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.member_workspaces enable row level security;

revoke all on table public.member_workspaces from anon;
revoke all on table public.member_workspaces from authenticated;
grant select, insert, update, delete on table public.member_workspaces to authenticated;

drop policy if exists "Members can read own workspace" on public.member_workspaces;
create policy "Members can read own workspace"
on public.member_workspaces for select to authenticated
using ((select auth.uid()) is not null and (select auth.uid()) = user_id);

drop policy if exists "Members can create own workspace" on public.member_workspaces;
create policy "Members can create own workspace"
on public.member_workspaces for insert to authenticated
with check ((select auth.uid()) is not null and (select auth.uid()) = user_id);

drop policy if exists "Members can update own workspace" on public.member_workspaces;
create policy "Members can update own workspace"
on public.member_workspaces for update to authenticated
using ((select auth.uid()) is not null and (select auth.uid()) = user_id)
with check ((select auth.uid()) is not null and (select auth.uid()) = user_id);

drop policy if exists "Members can delete own workspace" on public.member_workspaces;
create policy "Members can delete own workspace"
on public.member_workspaces for delete to authenticated
using ((select auth.uid()) is not null and (select auth.uid()) = user_id);

create or replace function public.touch_member_workspace()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  if tg_op = 'UPDATE' then
    new.workspace_version = old.workspace_version + 1;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_touch_member_workspace on public.member_workspaces;
create trigger trg_touch_member_workspace
before update on public.member_workspaces
for each row execute function public.touch_member_workspace();

create index if not exists member_workspaces_updated_at_idx
on public.member_workspaces (updated_at desc);
