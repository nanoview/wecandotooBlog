-- Set nanopro user as admin
-- This migration will set the admin role for the user with username 'nanopro'

-- Function to set nanopro as admin (to be run after user exists)
CREATE OR REPLACE FUNCTION public.set_nanopro_as_admin()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  nanopro_user_id UUID;
BEGIN
  -- Find the user_id for username 'nanopro'
  SELECT user_id INTO nanopro_user_id
  FROM public.profiles
  WHERE username = 'nanopro';
  
  -- If user exists, update their role to admin
  IF nanopro_user_id IS NOT NULL THEN
    -- Remove existing role if any
    DELETE FROM public.user_roles WHERE user_id = nanopro_user_id;
    
    -- Insert admin role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (nanopro_user_id, 'admin');
    
    RAISE NOTICE 'User nanopro has been set as admin';
  ELSE
    RAISE NOTICE 'User nanopro not found. Please ensure the user is registered first.';
  END IF;
END;
$$;

-- Execute the function
SELECT public.set_nanopro_as_admin();

-- Drop the function as it's no longer needed
DROP FUNCTION public.set_nanopro_as_admin();
