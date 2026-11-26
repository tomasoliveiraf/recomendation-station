-- Run this once in Supabase SQL Editor before deploying the updated app.
ALTER TABLE public.user_album_interactions
ADD COLUMN IF NOT EXISTS reaction text;

ALTER TABLE public.user_album_interactions
ADD CONSTRAINT user_album_interactions_reaction_check
CHECK (reaction IS NULL OR reaction IN ('disliked', 'mixed', 'loved'));
