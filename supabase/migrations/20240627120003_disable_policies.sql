-- Migration: disable_policies
-- Description: Disables all RLS policies for flashcards and generation_sessions tables
-- Created at: 2024-06-27 12:00:03

-- disable policies for flashcards table
-- removing policy for authenticated users
drop policy if exists "Users can view their own flashcards" on public.flashcards;
drop policy if exists "Users can create their own flashcards" on public.flashcards;
drop policy if exists "Users can update their own flashcards" on public.flashcards;
drop policy if exists "Users can delete their own flashcards" on public.flashcards;

-- removing policy for anon users
drop policy if exists "Anon users cannot view flashcards" on public.flashcards;
drop policy if exists "Anon users cannot create flashcards" on public.flashcards;
drop policy if exists "Anon users cannot update flashcards" on public.flashcards;
drop policy if exists "Anon users cannot delete flashcards" on public.flashcards;

-- disable policies for generation_sessions table
-- removing policy for authenticated users
drop policy if exists "Users can view their own generation sessions" on public.generation_sessions;
drop policy if exists "Users can create their own generation sessions" on public.generation_sessions;
drop policy if exists "Users can update their own generation sessions" on public.generation_sessions;
drop policy if exists "Users can delete their own generation sessions" on public.generation_sessions;

-- removing policy for anon users
drop policy if exists "Anon users cannot view generation sessions" on public.generation_sessions;
drop policy if exists "Anon users cannot create generation sessions" on public.generation_sessions;
drop policy if exists "Anon users cannot update generation sessions" on public.generation_sessions;
drop policy if exists "Anon users cannot delete generation sessions" on public.generation_sessions;

-- Note: There is no generation_error_log table in the provided migrations 