-- Migration: disable_flashcards_rls_for_development
-- Description: Disable RLS for flashcards table for development purposes and remove foreign key constraint
-- Created at: 2024-06-27 12:00:06

-- Disable row level security for development
ALTER TABLE public.flashcards DISABLE ROW LEVEL SECURITY;

-- Drop the foreign key constraint for development
ALTER TABLE public.flashcards 
DROP CONSTRAINT IF EXISTS flashcards_user_id_fkey;

-- Grant permissions to anon role for development
GRANT ALL ON public.flashcards TO anon;
GRANT USAGE ON SEQUENCE public.flashcards_id_seq TO anon;

-- Create a comment to indicate this is for development only
COMMENT ON TABLE public.flashcards IS 'Stores flashcards for users - RLS disabled for development'; 
