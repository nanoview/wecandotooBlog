-- Fix foreign key relationships by adding proper foreign key for comments to profiles
ALTER TABLE public.comments 
DROP CONSTRAINT IF EXISTS comments_user_id_fkey;

ALTER TABLE public.comments
ADD CONSTRAINT comments_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;