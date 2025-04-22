-- Migration: create_flashcards_table
-- Description: Creates the flashcards table with indexes and RLS policies
-- Created at: 2024-06-27 12:00:01

-- create flashcards table
create table public.flashcards (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  front text not null,
  back text not null,
  source varchar(20) not null default 'MANUAL' check (source in ('AI', 'MANUAL')),
  status varchar(20) not null default 'draft' check (status in ('draft', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- add comments to table and columns
comment on table public.flashcards is 'Stores flashcards for users';
comment on column public.flashcards.id is 'Unique identifier for the flashcard';
comment on column public.flashcards.user_id is 'Reference to the user who owns the flashcard';
comment on column public.flashcards.front is 'Front side content of the flashcard (question)';
comment on column public.flashcards.back is 'Back side content of the flashcard (answer)';
comment on column public.flashcards.source is 'Source of the flashcard: AI-generated or manually created';
comment on column public.flashcards.status is 'Status of the flashcard: draft, approved, or rejected';
comment on column public.flashcards.created_at is 'Timestamp when the flashcard was created';
comment on column public.flashcards.updated_at is 'Timestamp when the flashcard was last updated';

-- create indexes
create index idx_flashcards_user_id on public.flashcards(user_id);
create index idx_flashcards_created_at on public.flashcards(created_at);

-- create trigger to update the updated_at column automatically
create trigger set_updated_at_flashcards
before update on public.flashcards
for each row
execute function public.update_updated_at();

-- enable row level security
alter table public.flashcards enable row level security;

-- create policies for authenticated users
-- select policy - users can only view their own flashcards
create policy "Users can view their own flashcards"
on public.flashcards
for select
to authenticated
using (auth.uid() = user_id);

-- insert policy - users can only create flashcards for themselves
create policy "Users can create their own flashcards"
on public.flashcards
for insert
to authenticated
with check (auth.uid() = user_id);

-- update policy - users can only update their own flashcards
create policy "Users can update their own flashcards"
on public.flashcards
for update
to authenticated
using (auth.uid() = user_id);

-- delete policy - users can only delete their own flashcards
create policy "Users can delete their own flashcards"
on public.flashcards
for delete
to authenticated
using (auth.uid() = user_id);

-- create policies for anon users (no access)
-- anon users cannot select flashcards
create policy "Anon users cannot view flashcards"
on public.flashcards
for select
to anon
using (false);

-- anon users cannot insert flashcards
create policy "Anon users cannot create flashcards"
on public.flashcards
for insert
to anon
with check (false);

-- anon users cannot update flashcards
create policy "Anon users cannot update flashcards"
on public.flashcards
for update
to anon
using (false);

-- anon users cannot delete flashcards
create policy "Anon users cannot delete flashcards"
on public.flashcards
for delete
to anon
using (false); 