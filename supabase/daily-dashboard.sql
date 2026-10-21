-- Applied to TRADE90. Existing owner-only member_workspaces RLS remains in force.
-- Separate field preserves all older journal, watchlist and workspace content.
alter table public.member_workspaces add column if not exists daily_dashboard jsonb;
