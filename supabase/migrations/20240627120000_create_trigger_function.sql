-- Migration: create_trigger_function
-- Description: Creates a function to automatically update the updated_at column
-- Created at: 2024-06-27 12:00:00

-- create a function to automatically set the updated_at column to current timestamp
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

comment on function public.update_updated_at() is 'Automatically sets the updated_at column to the current timestamp when a row is updated'; 