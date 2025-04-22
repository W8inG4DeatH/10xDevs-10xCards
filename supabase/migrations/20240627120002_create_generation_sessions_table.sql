-- Migration: create_generation_sessions_table
-- Description: Creates the generation_sessions table with indexes and RLS policies
-- Created at: 2024-06-27 12:00:02

-- create generation_sessions table
create table public.generation_sessions (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  session_input text not null,
  session_output jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- add comments to table and columns
comment on table public.generation_sessions is 'Stores AI flashcard generation sessions';
comment on column public.generation_sessions.id is 'Unique identifier for the generation session';
comment on column public.generation_sessions.user_id is 'Reference to the user who initiated the generation session';
comment on column public.generation_sessions.session_input is 'Text input provided by the user for flashcard generation';
comment on column public.generation_sessions.session_output is 'JSON output containing generated flashcards and other session data';
comment on column public.generation_sessions.created_at is 'Timestamp when the generation session was created';
comment on column public.generation_sessions.updated_at is 'Timestamp when the generation session was last updated';

-- create indexes
create index idx_generation_sessions_user_id on public.generation_sessions(user_id);
create index idx_generation_sessions_created_at on public.generation_sessions(created_at);

-- create trigger to update the updated_at column automatically
create trigger set_updated_at_generation_sessions
before update on public.generation_sessions
for each row
execute function public.update_updated_at();

-- enable row level security
alter table public.generation_sessions enable row level security;

-- create policies for authenticated users
-- select policy - users can only view their own generation sessions
create policy "Users can view their own generation sessions"
on public.generation_sessions
for select
to authenticated
using (auth.uid() = user_id);

-- insert policy - users can only create generation sessions for themselves
create policy "Users can create their own generation sessions"
on public.generation_sessions
for insert
to authenticated
with check (auth.uid() = user_id);

-- update policy - users can only update their own generation sessions
create policy "Users can update their own generation sessions"
on public.generation_sessions
for update
to authenticated
using (auth.uid() = user_id);

-- delete policy - users can only delete their own generation sessions
create policy "Users can delete their own generation sessions"
on public.generation_sessions
for delete
to authenticated
using (auth.uid() = user_id);

-- create policies for anon users (no access)
-- anon users cannot select generation sessions
create policy "Anon users cannot view generation sessions"
on public.generation_sessions
for select
to anon
using (false);

-- anon users cannot insert generation sessions
create policy "Anon users cannot create generation sessions"
on public.generation_sessions
for insert
to anon
with check (false);

-- anon users cannot update generation sessions
create policy "Anon users cannot update generation sessions"
on public.generation_sessions
for update
to anon
using (false);

-- anon users cannot delete generation sessions
create policy "Anon users cannot delete generation sessions"
on public.generation_sessions
for delete
to anon
using (false); 