-- Migration: disable_rls_for_development
-- Description: Disable RLS for generation_sessions table for development purposes
-- Created at: 2024-06-27 12:00:04

-- Disable row level security for development
ALTER TABLE public.generation_sessions DISABLE ROW LEVEL SECURITY;

-- Grant permissions to anon role for development
GRANT ALL ON public.generation_sessions TO anon;
GRANT USAGE ON SEQUENCE public.generation_sessions_id_seq TO anon;

-- Create a comment to indicate this is for development only
COMMENT ON TABLE public.generation_sessions IS 'Stores AI flashcard generation sessions - RLS disabled for development'; 