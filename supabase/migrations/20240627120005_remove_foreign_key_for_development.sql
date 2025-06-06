-- Migration: remove_foreign_key_for_development
-- Description: Remove foreign key constraint for user_id in generation_sessions table for development purposes
-- Created at: 2024-06-27 12:00:05

-- Drop the foreign key constraint for development
ALTER TABLE public.generation_sessions 
DROP CONSTRAINT IF EXISTS generation_sessions_user_id_fkey;

-- Create a comment to indicate this is for development only
COMMENT ON COLUMN public.generation_sessions.user_id IS 'User ID - foreign key constraint removed for development'; 